import { Component, OnInit } from '@angular/core';
import { LangNodeObject, LangTopicObject } from '../../customTypes/langObject.types';

import { LangToolsService } from '../../providers/lang-tools-service';

/**
 * Generated class for the EditWordComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'edit-word',
  templateUrl: 'edit-word.html',
  styleUrls: ['edit-word.scss']
})
export class EditWordComponent implements OnInit {
  word: LangNodeObject;
  langs: Array<LangTopicObject>;

  isLeaf = false;

  key_before: string;
  key_after: string;
  key_original: string;

  constructor(private langTools: LangToolsService) {
    console.log('### EditWordComponent');
  }

  ngOnInit() {
    this.langTools.getCurrentlyEditedWord().subscribe((data: LangNodeObject) => {
      this.word = data;
      if (data) {
        this.doEdit();
      } else {
        this.isLeaf = false;
        this.key_original = '';
        this.key_after = '';
      }
    });
  }

  doEdit() {
    if (this.word) {
      this.langs = this.word.nodes as Array<LangTopicObject>;
      this.isLeaf = this.word.isLeaf;

      const key: string = this.word['full_key'] as string;
      const p: number = key.lastIndexOf('.');
      if (p > 0) {
        this.key_before = key.substring(0, p);
        this.key_after = key.substring(p + 1);
      } else {
        this.key_before = '';
        this.key_after = key;
      }
      this.key_original = this.key_after;

    } else {
      this.langs = [];
      this.key_original = '';
      this.key_after = '';
    }
  }

  updatesWord(_event) {
    if (!this.langTools.isTranslationsSavingRequired()) {
      this.langTools.doTranslationNeedsSaving(true);
    }
  }

  updatesKeyAfter(_event) {
    this.word.key = this.key_after;

    this.langTools.doReplaceKeyInDescendants(this.word, this.key_before);

    if (!this.langTools.isTranslationsSavingRequired()) {
      this.langTools.doTranslationNeedsSaving(true);
    }
  }

  updateParent(_event) {
    if (this.key_original !== this.key_after) {
      this.langTools.sortParentNodes(this.word);
    }
  }
}
