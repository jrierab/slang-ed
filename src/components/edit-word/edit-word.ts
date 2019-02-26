import { Component } from '@angular/core';
import { languaguesTopicObject } from "../../customTypes/langObject.types"

import { LangToolsService } from '../../providers/lang-tools-service';

/**
 * Generated class for the EditWordComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'edit-word',
  templateUrl: 'edit-word.html'
})
export class EditWordComponent {
  word: languaguesTopicObject;
  langs: Array<string> = [];

  constructor(private langTools : LangToolsService) {
    console.log('### EditWordComponent');
  }

  ngOnInit() {
    this.langTools.getCurrentlyEditedWord().subscribe((word)=> {
      this.word = word;
      this.doEdit();
    });
  }

  doEdit() {
    // console.log("Editing: ", this.word);
    this.langs = [];
    if(this.word) {
      for(let lang of Object.keys(this.word)) {
        if( !this.langTools.isReservedKey(lang) ) {
          this.langs.push(lang);
        }
      }
    }
  }

  updatesWord(event) {
    if( !this.langTools.isTranslationsSavingRequired() ) {
      this.langTools.doTranslationNeedsSaving(true);
    }
  }

}
