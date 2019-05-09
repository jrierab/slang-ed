import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { LangNodeObject } from 'src/customTypes/langObject.types';
import { LangToolsService } from 'src/providers/lang-tools-service';

@Component({
    selector: 'app-word-popup-menu',
    templateUrl: './word-popup-menu.component.html',
    styleUrls: ['./word-popup-menu.component.scss'],
})
export class WordPopupMenuComponent {
    public word: LangNodeObject;

    constructor(
        navParams: NavParams,
        private popoverController: PopoverController,
        private langTools: LangToolsService,
    ) {
        this.word = navParams.get('word');
    }

    doClose() {
        this.popoverController.dismiss();
    }

    doCopyToClipboard(mode: number) {
        let item: string;

        switch (mode) {
            case 1:
                item = '{{ "' + this.word.full_key + '" | translate }}';
                break;
            case 2:
                item = 'this.translate.instant(\'' + this.word.full_key + '\')';
                break;
            default:
                item = 'doCopyToClipboard(mode) ERROR: Unknown mode = ' + mode;
        }

        document.addEventListener('copy', (e: ClipboardEvent) => {
            e.clipboardData.setData('text/plain', (item));
            e.preventDefault();
            document.removeEventListener('copy', null);
        });
        document.execCommand('copy');

        this.doClose();
    }

    doAddNode() {
        this.langTools.doAddNode(this.word);
        this.doClose();
    }

    doAddId() {
        this.langTools.doAddId(this.word);
        this.doClose();
    }

    doDelete() {
        this.langTools.doDelete(this.word);
        this.doClose();
    }

}
