import { Component, Input } from '@angular/core';

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
  @Input() word;
  @Input() list;
  @Input() level : number = 0;

  words : Array<string>;

  shouldIgnore : boolean = false;

  showChilds : boolean = false;
  
  indents : Array<number>;

  constructor() {
    console.log('### ListWordComponent');
  }

  ngOnChanges() {
    this.indents = Array(this.level).fill(0).map((x,i)=>i);

    if(this.list.isLeaf) {
      //console.log("Leaf..."+this.word);

    } else if( this.list ) {
      this.words = [];
      for(let key of Object.keys(this.list)) {
        if( this.list[key] !== null && (typeof this.list[key] === 'object')) this.words.push(key);
      }
      this.words.sort();
      //console.log("Words for "+this.word, this.words);

    } else {
      console.log("Should ignore..."+this.word);
      this.shouldIgnore = true;
    }
  }

}
