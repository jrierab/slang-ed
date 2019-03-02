import { Component, Input } from '@angular/core';
import { LangToolsService } from '../../providers/lang-tools-service';
import { langNodeObject, langTopicObject } from "../../customTypes/langObject.types"

/**
 * Generated class for the ListWordComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'list-word',
  templateUrl: 'list-word.html'
})
export class ListWordComponent {
  @Input() word : langNodeObject;
  @Input() list: langNodeObject;

  words : Array<langNodeObject | langTopicObject>;

  showChilds : boolean = false;
  
  indents : Array<number>;

  constructor(private langTools : LangToolsService) {
    console.log('### ListWordComponent');
  }

  ngOnChanges() {
    this.indents = Array(this.word.level).fill(0).map((x,i)=>i);

    if(this.list.isLeaf) {
      this.words = [];
    } else {
      this.words = this.word.nodes;
      this.langTools.sort(this.words as Array<langNodeObject>);
    }
  }

  public doClick() {
    if(!this.word.isLeaf) {
      this.showChilds = !this.showChilds;
    }
    this.langTools.doEditWord(this.word);
  }

}
