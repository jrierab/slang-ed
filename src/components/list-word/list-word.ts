import { Component, Input, OnChanges } from '@angular/core';
import { LangToolsService } from '../../providers/lang-tools-service';
import { LangNodeObject, LangTopicObject } from '../../customTypes/langObject.types';

/**
 * Generated class for the ListWordComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'list-word',
    templateUrl: 'list-word.html',
    styleUrls: ['list-word.scss']
})
export class ListWordComponent implements OnChanges {
    @Input() word: LangNodeObject;
    @Input() list: LangNodeObject;

    words: Array<LangNodeObject | LangTopicObject>;

    showChilds = false;

    indents: Array<number>;

    constructor(private langTools: LangToolsService) {
        console.log('### ListWordComponent');
    }

    ngOnChanges() {
        this.indents = Array(this.word.level - 1).fill(0).map((x, i) => i);

        if (this.list.isLeaf) {
            this.words = [];
        } else {
            this.words = this.word.nodes;
            // this.langTools.sort(this.words as Array<langNodeObject>);
        }
    }

    public doClick() {
        if (!this.word.isLeaf) {
            this.showChilds = !this.showChilds;
        }
        this.langTools.doRememberTranslations(this.word.full_key);
        this.langTools.doEditWord(this.word);
    }

}
