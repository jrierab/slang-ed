import { Component } from '@angular/core';
import { langNodeObject, langTopicObject } from "../../customTypes/langObject.types"

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
  word: langNodeObject;
  langs: Array<langTopicObject>;

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
    if(this.word) {
      this.langs = this.word.nodes as Array<langTopicObject>;
    } else {
      this.langs = [];      
    }
  }

  updatesWord(event) {
    if( !this.langTools.isTranslationsSavingRequired() ) {
      this.langTools.doTranslationNeedsSaving(true);
    }
  }

}
