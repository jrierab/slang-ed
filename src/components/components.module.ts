import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { ListWordComponent } from './list-word/list-word';
import { EditWordComponent } from './edit-word/edit-word';
import { WordPopupMenuComponent } from './word-popup-menu/word-popup-menu.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        ListWordComponent,
        EditWordComponent,
        WordPopupMenuComponent
    ],
    entryComponents: [WordPopupMenuComponent],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule
    ],
    exports: [
        ListWordComponent,
        EditWordComponent,
        WordPopupMenuComponent
    ],
})
export class ComponentsModule { }
