import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';

import { ListWordComponent } from './list-word/list-word';
import { EditWordComponent } from './edit-word/edit-word';

@NgModule({
	declarations: [ListWordComponent,
    EditWordComponent],
	imports: [CommonModule, IonicModule],
	exports: [ListWordComponent,
    EditWordComponent]
})
export class ComponentsModule {}
