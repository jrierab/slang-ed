import { Injectable } from '@angular/core';

import { undoObject } from '../customTypes/undoObject.types';
import { langTranslationsObject } from '../customTypes/langObject.types';

/*
  Generated class for the UndoService provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UndoService {

  private history: Array<undoObject> = [];
  private future: Array<undoObject> = [];

  private currentStatus : undoObject = null;

  constructor() {
    console.log('### UndoService');
  }

  clearHistory(translations: langTranslationsObject): void {
    this.history.length = 0;
    this.future.length = 0;
    this.currentStatus = {key: "Init", contents: JSON.stringify(translations)};
    this.history.push({key: this.currentStatus.key, contents: this.currentStatus.contents});
    this.showHistory("* clearHistory");
    //this.rememberThisHistory(, translations);
    //this.prevStatus = this.history[0].contents;
    //this.currentStatus = null;
  }

  rememberThisHistory(key: string, translations: langTranslationsObject): void {
    const newStatus : undoObject = {key: key, contents: JSON.stringify(translations)};
    const differs: boolean = newStatus.contents !== this.currentStatus.contents;
    
    console.log("- Current key: "+this.currentStatus.key);
    //console.log(newStatus);

    if(differs) {
      key = this.currentStatus.key;
      this.history.push({key: this.currentStatus.key, contents: newStatus.contents});
      this.future.length = 0;
      this.currentStatus = newStatus;
      this.showHistory("* Add to history: "+key);

    } else {
      this.currentStatus.key = key;
      this.showHistory("- Update key: "+key);
    }
  }

  hasHistory(): boolean {
    return this.history.length > 1;
  }

  hasFuture(): boolean {
    return this.future.length > 0;
  }

  undo(translations: langTranslationsObject): langTranslationsObject {
    const currentTranslations : string = JSON.stringify(translations);
    let last : undoObject = this.history.pop();

    /*
    if (last.contents === currentStatus && this.history.length > 1) {
      // Something was added, but no changes have been made. Remove another brick
      last = this.history.pop();
      this.showHistory("Remove another key because last is the same (no edits made)");
    }
    */

    this.currentStatus = last;
    this.future.push({key: "Undo: "+last.key, contents: currentTranslations});

    this.showHistory("UNDO");
    return JSON.parse(last.contents);
  }
  
  redo(translations: langTranslationsObject): langTranslationsObject {
    const currentTranslations : string = JSON.stringify(translations);
    const last : undoObject = this.future.pop();
    this.history.push({key: "Redo: "+last.key, contents: currentTranslations});
    this.currentStatus = last;

    this.showHistory("REDO");
    return JSON.parse(last.contents);
  }

  showHistory(msg: string) {
    console.log(msg);
    this.history.forEach( (h, i) => console.log(" - "+i+": "+h.key) );
    this.future.forEach( (h, i) => console.log(" + "+i+": "+h.key) );
  }

}
