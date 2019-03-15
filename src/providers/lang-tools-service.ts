import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { langFileObject, langNodeObject, langTranslationsObject, langTopicObject } from "../customTypes/langObject.types"
import { UndoService } from './undo-service';

/*
  Generated class for the LangToolsService provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LangToolsService {
  private translations : langTranslationsObject = this.clearTranslations();
  
  private currentWord: BehaviorSubject<langNodeObject> = new BehaviorSubject(null);
  private translationsNeedsSaving : BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  constructor(private undoService: UndoService) {
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

    //this.undoService.clearHistory(this.translations);

    return this.translations;
  }
  
  createNodeAtLevel(parent: langNodeObject, key: string): langNodeObject {
    const new_node = {
      key: key,
      full_key: parent.full_key + (parent.full_key? ".": "")+key,
      isLeaf : false,
      level: parent.level + 1,
      nodes : []
    };
    parent.nodes.push(new_node);
    return new_node;
  }

  createIdAtLevel(parent: langNodeObject, key: string): langNodeObject {
    const new_node = this.createNodeAtLevel(parent, key);
    new_node.isLeaf = true;

    this.translations.languages.forEach((lang)=> {
      new_node.nodes.push({
        lang: lang,
        value: "", 
        approved: false, 
        preserve: false, 
        foundInSrc: false, 
        comment: ""
      });
    });
    return new_node;
  }

  removeNode(node: langNodeObject): void {
    const parent = this.getParent(node);
    let pos : number = parent.nodes.indexOf(node);
    if (pos !== -1) {
      parent.nodes.splice(pos, 1);  
    }
  }

  buildLangStructure(lang: string, level: langNodeObject, lang_translations: Object) {
    for (let key of Object.keys(lang_translations)) {
      let subkeys : Array<string> = key.split('.');
      let deep_level : langNodeObject = level;
            
      subkeys.forEach(k=> {
        const node : langNodeObject = deep_level.nodes.find((el: langNodeObject) => el.key === k) as langNodeObject;

        if (!node) {
          deep_level= this.createNodeAtLevel(deep_level, k);
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
      //this.undoService.rememberThisHistory(this.wordNum, "Update Word: "+(this.currentWord.value? this.currentWord.value.full_key: "null"), this.translations);
      this.currentWord.next(word);
    }
  }

  doClearEditWord() {
    if(this.currentWord.value) {
      //this.undoService.rememberThisHistory(this.wordNum, "Clear Word: "+this.currentWord.value.full_key, this.translations);
      this.currentWord.next(null);
    }
  }

  sort(words: Array<langNodeObject>) {
    words.sort((a: langNodeObject, b: langNodeObject) => {
      return ( a === b ? 0 : (a.key? a.key.toLowerCase(): "") > (b.key? b.key.toLowerCase(): "")? 1: -1); 
    });
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

  getCurrentlyEditedWordValue(): langNodeObject {
    return this.currentWord.value;
  }

  doReplaceKeyInDescendants(parent: langNodeObject, key_before: string) {
    parent.full_key = key_before+(key_before? ".": "")+parent.key;

    if(!parent.isLeaf) {
      parent.nodes.forEach( (son: langNodeObject) => this.doReplaceKeyInDescendants(son, parent.full_key));
    }
  }

  countDescendants(level: langNodeObject): number {    
    if(level.isLeaf) return 1;

    let n : number = 0;
    level.nodes.forEach((node: langNodeObject) => {
      n += this.countDescendants(node);
    });
    return n;
  }

  getParent(node: langNodeObject): langNodeObject {
    const keys = node.full_key.split('.');
    let parent = this.translations.root;

    // Remove last key, which is the key for the node itself
    keys.pop();

    keys.forEach((key: string) => {
      const son: langNodeObject = parent.nodes.find((n: langNodeObject) => n.key === key) as langNodeObject;
      if(son) {
        parent = son;
      } else {
        throw("Missing node with key '"+key+'" when looking for parent');
      }
    });
    return parent;
  }

  sortParentNodes(node: langNodeObject) : void {
    const parent : langNodeObject = this.getParent(node);
    this.sort(parent.nodes as Array<langNodeObject>);
  }

  undo(): langTranslationsObject {
    this.translations = this.undoService.undo(this.translations);
    return this.translations;
  }

  redo(): langTranslationsObject {
    this.translations = this.undoService.redo(this.translations);
    return this.translations;
  }

  doRememberTranslations(key: string): void {
    this.undoService.rememberThisHistory(key, this.translations);

  }

}
