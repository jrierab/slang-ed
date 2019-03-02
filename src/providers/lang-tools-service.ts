import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { langFileObject, langNodeObject, langTranslationsObject, langTopicObject } from "../customTypes/langObject.types"

/*
  Generated class for the LangToolsService provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LangToolsService {
  translations : langTranslationsObject = this.clearTranslations();
  
  private currentWord: BehaviorSubject<langNodeObject> = new BehaviorSubject(null);
  private translationsNeedsSaving : BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  constructor() {
    console.log('### LangToolsService');
  }
  
  clearTranslations(): langTranslationsObject {
    const emptyOptions = {projectFolder: "", i18nFolder: ""};
    const emptyRoot = {key :"", full_key: "", isLeaf: false, level: 0, nodes: []};

    return {
      options: JSON.parse(JSON.stringify(emptyOptions)),
      languages: [],
      root: JSON.parse(JSON.stringify(emptyRoot))
    }
  }
  
  initTranslations(langFiles: Array<langFileObject>) {
    this.translations = this.clearTranslations();

    langFiles.forEach(langFile => {
      let code : string = langFile.filename.substring(0, 2);
      let lang_translations : any;

      try {
        lang_translations = JSON.parse(langFile.contents);
        this.translations.languages.push(code);
  
        this.buildLangStructure(code, this.translations.root, lang_translations);
      } catch(e) {
        // TODO: Catch error and give a proper error message to the user
        console.log(e);
      }
    });

    console.log("> Lang structure...", this.translations);
    
    this.doTranslationNeedsSaving(false);
    this.doClearEditWord();
    
    return this.translations;
  }
  
  buildLangStructure(lang: string, level: langNodeObject, lang_translations: Object) {
    for (let key of Object.keys(lang_translations)) {
      let subkeys : Array<string> = key.split('.');
      let deep_level : langNodeObject = level;
            
      subkeys.forEach(k=> {
        const node : langNodeObject = deep_level.nodes.find((el: langNodeObject) => el.key === k) as langNodeObject;

        if (!node) {
          const new_node = {
            key: k,
            full_key: deep_level.full_key + (deep_level.full_key? ".": "")+k,
            isLeaf : false,
            level: deep_level.level + 1,
            nodes : []
          };
          deep_level.nodes.push(new_node);
          deep_level = new_node;
        } else {
          deep_level = node;
        }
      })
            
      let translation = lang_translations[key];
      
      if(translation instanceof Object) {
        this.buildLangStructure(lang, deep_level, translation);
        
      } else {
        deep_level.isLeaf = true;

        const langNode : langTopicObject = deep_level.nodes.find((n: langTopicObject)=> n.lang === lang) as langTopicObject;

        if(langNode) {
          console.log("ERROR: "+deep_level.full_key+" already defined for lang "+lang+" !!!");
        } else {
          deep_level.nodes.push({
            lang: lang,
            value: translation, 
            approved: false, 
            preserve: false, 
            foundInSrc: false, 
            comment: ""
          });
        }
      }
    };
  }

  doEditWord(word: langNodeObject): void {
    if(this.currentWord.value !== word) {
      this.currentWord.next(word);
    }
  }

  doClearEditWord() {
    if(this.currentWord.value) {
      this.currentWord.next(null);
    }
  }

  sort(words: Array<langNodeObject>) {
    words.sort((a: langNodeObject, b: langNodeObject) => (a.key > b.key? 1: -1));
  }

  doTranslationNeedsSaving(b: boolean): void {
    this.translationsNeedsSaving.next(b);
  }

  isTranslationsSavingRequired(): boolean {
    return this.translationsNeedsSaving.value;
  }

  getCurrentlyEditedWord(): BehaviorSubject<langNodeObject> {
    return this.currentWord;
  }

  doReplaceKeyInDescendants(parent: langNodeObject, key_before: string) {
    parent.full_key = key_before+(key_before? ".": "")+parent.key;

    if(!parent.isLeaf) {
      parent.nodes.forEach( (son: langNodeObject) => this.doReplaceKeyInDescendants(son, parent.full_key));
    }    
  }
}
