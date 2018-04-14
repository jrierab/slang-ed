import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { TranslateService } from '@ngx-translate/core';

/*
  Generated class for the LangServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LangService {
  onLang : BehaviorSubject<string> = new BehaviorSubject("");

  lang_sets : Array<string> = [];

  constructor(public translate: TranslateService) {
    console.log('### LangService');
  }

  init(lang_default: string, lang_sets: Array<string>, lang_fallback?: string) {
    // Verify that some sets are present
    if(lang_sets.length==0) {
      console.error("[LangService] error: no lang_sets defined");
      return;
    } else {
      this.lang_sets = lang_sets;
    }

    // Verify default is present in lang_sets
    if(this.lang_sets.indexOf(lang_default) == -1) {
      console.log("[LangService] Warning: trying to use default lang '"+lang_default+"' which is not present in lang_sets");
      console.log("[LangService] Warning: setting default to first language in set");
      lang_default = this.lang_sets[0];
    }

    // this language will be used as a fallback when a translation isn't found in the current language
    if(!lang_fallback) lang_fallback = lang_default;

    this.translate.setDefaultLang(lang_fallback);

    let langRegex = new RegExp(this.lang_sets.join("|"), 'gi');

    // get browser language by default
    let userLang = navigator.language.split('-')[0];
    userLang = langRegex.test(userLang) ? userLang : lang_default;

    this.setLanguage(userLang);
    // ----------------------------------------------------------------    
  }

  getCurrentLang() {return this.translate.currentLang};

  setLanguage(lang: string) {
    // Verify default is present in lang_sets
    if(this.lang_sets.indexOf(lang) == -1) {
      console.log("[LangService] Warning: trying to use lang '"+lang+"' which is not present in lang_sets");
      return;
    }

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use(lang);        
    console.log("[LangService] Using language: "+this.translate.currentLang);

    // Inform to all
    this.onLang.next(lang);
  }
}
