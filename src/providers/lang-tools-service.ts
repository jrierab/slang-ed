import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { langFileObject, languaguesTopicObject, langTranslationsObject } from "../customTypes/langObject.types"

/*
  Generated class for the LangToolsService provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LangToolsService {
  translations : langTranslationsObject;
  emptyTranslations : langTranslationsObject = {languages: [], i18n: {}, projectFolder: "", i18nFolder: ""};

  private currentWord: BehaviorSubject<languaguesTopicObject> = new BehaviorSubject(null);
  private translationsNeedsSaving : BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {
    console.log('### LangToolsService');
  }

  initTranslations(langFiles: Array<langFileObject>) {
    this.translations = JSON.parse(JSON.stringify(this.emptyTranslations));

    langFiles.forEach(langFile => {
      let code : string = langFile.filename.substring(0, 2);
      let lang_translations : any;

      try {
        lang_translations = JSON.parse(langFile.contents);
        this.translations.languages.push(code);
  
        this.buildLangStructure(code, "", this.translations.i18n, lang_translations);
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

  buildLangStructure(lang: string, top_key: string, level: Object, lang_translations: Object) {
    for (let key of Object.keys(lang_translations)) {
      let subkeys : Array<string> = key.split('.');
      let deep_level = level;
      let deep_key = top_key;

      subkeys.forEach(k=> {
        if( !deep_level.hasOwnProperty(k) ) deep_level[k] = {};
        deep_level['full_key'] = deep_key;
        deep_level = deep_level[k];
        deep_key = deep_key+(deep_key.length>0? '.': '')+k;
        deep_level['isLeaf'] = false;
      })

      let translation = lang_translations[key];

      if(translation instanceof Object) {
        this.buildLangStructure(lang, deep_key, deep_level, translation);
        
      } else {
        deep_level['isLeaf'] = true;
        deep_level['full_key'] = deep_key;
        deep_level[lang] = {value: translation, approved: false, preserve: false, foundInSrc: false, comment: ""};
      }
    };
  }

  doEditWord(word: languaguesTopicObject): void {
    if(this.currentWord.value !== word) {
      this.currentWord.next(word);
    }
  }

  doClearEditWord() {
    if(this.currentWord.value) {
      this.currentWord.next(null);
    }
  }

  isReservedKey(key: string): boolean {
    const reservedKeys = ['isLeaf', 'full_key'];
    return reservedKeys.findIndex((k) => k === key) !== -1;
  }

  doTranslationNeedsSaving(b: boolean): void {
    this.translationsNeedsSaving.next(b);
  }

  isTranslationsSavingRequired(): boolean {
    return this.translationsNeedsSaving.value;
  }

  getCurrentlyEditedWord(): BehaviorSubject<languaguesTopicObject> {
    return this.currentWord;
  }
}
