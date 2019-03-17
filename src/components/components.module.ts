import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { ListWordComponent } from './list-word/list-word';
import { EditWordComponent } from './edit-word/edit-word';

@NgModule({
	declarations: [
		ListWordComponent,
		EditWordComponent
	],
	imports: [
		CommonModule, 
		FormsModule, 
		IonicModule
	],
	exports: [
		ListWordComponent,
		EditWordComponent
	]
})
export class ComponentsModule {}
