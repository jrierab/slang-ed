import { Injectable } from '@angular/core';

import { langFileObject, langTranslationsObject } from "../customTypes/langObject.types"

/*
  Generated class for the LangToolsService provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LangToolsService {
  translations : langTranslationsObject;

  constructor() {
    console.log('### LangToolsService');
  }

  initTranslations(langFiles: Array<langFileObject>) {
    let firstLanguage = true;

    this.translations = {languages: [], i18n: {}};

    langFiles.forEach(langFile => {
      let code : string = langFile.filename.substring(0, 2);
      let lang_translations : any = JSON.parse(langFile.contents);

      this.translations.languages.push(code);

      for (let key of Object.keys(lang_translations)) {
        if(firstLanguage) this.translations.i18n[key] = {};

        this.translations.i18n[key][code] = {value: lang_translations[key], approved: false, preserve: false, foundInSrc: false, comment: ""};
      };

      firstLanguage = false;
    });

    console.log("> Lang structure...", this.translations);
    //console.log(JSON.stringify(this.translations));
  }

}
