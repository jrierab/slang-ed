import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';

import { ListWordComponent } from './list-word/list-word';

@NgModule({
	declarations: [ListWordComponent],
	imports: [CommonModule, IonicModule],
	exports: [ListWordComponent]
})
export class ComponentsModule {}
