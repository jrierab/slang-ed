import { Injectable } from '@angular/core';

import { UndoObject, HistoryInfoObject } from '../customTypes/undoObject.types';
import { LangTranslationsObject } from '../customTypes/langObject.types';
import { BehaviorSubject, Observable } from 'rxjs';

/*
  Generated class for the UndoService provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UndoService {

    private readonly _historyInfo: BehaviorSubject<HistoryInfoObject> = new BehaviorSubject({ history: 0, future: 0 });

    public readonly historyInfo$: Observable<HistoryInfoObject> = this._historyInfo.asObservable();

    private history: Array<UndoObject> = [];
    private future: Array<UndoObject> = [];

    private currentHistoryStatus: UndoObject = null;

    constructor() {
        // console.log('### UndoService');
    }

    clearHistory(translations: LangTranslationsObject): void {
        this.history.length = 0;
        this.future.length = 0;
        this.currentHistoryStatus = { key: 'Init', contents: JSON.stringify(translations) };
        this.history.push({ key: this.currentHistoryStatus.key, contents: this.currentHistoryStatus.contents });
        // this.showHistory('* clearHistory');
        this.emitHistoryInfo();
    }

    rememberThisHistory(key: string, translations: LangTranslationsObject): void {
        const currentStatus: UndoObject = { key: key, contents: JSON.stringify(translations) };
        const differs: boolean = currentStatus.contents !== this.currentHistoryStatus.contents;

        if (differs) {
            // Adds pending history and remember current status
            // const stored = JSON.parse(this.currentHistoryStatus.contents);
            // const value = stored.root.nodes[0]['key'];

            const newKey = (this.currentHistoryStatus.key ? this.currentHistoryStatus.key : key);
            this.history.push({ key: this.currentHistoryStatus.key, contents: this.currentHistoryStatus.contents });
            this.future.length = 0;
            this.currentHistoryStatus = currentStatus;
            // this.showHistory('* Add to history: ' + newKey + ' because of ' + key);

        } else {
            //  Simply updates the current key
            this.currentHistoryStatus.key = key;
            // this.showHistory('- Update key: ' + key);
        }
        this.emitHistoryInfo();
    }

    hasHistory(): boolean {
        return this.history.length > 1;
    }

    hasFuture(): boolean {
        return this.future.length > 0;
    }

    undo(translations: LangTranslationsObject): LangTranslationsObject {
        const curentStatus: UndoObject = { key: this.currentHistoryStatus.key, contents: JSON.stringify(translations) };
        const differs: boolean = curentStatus.contents !== this.currentHistoryStatus.contents;
        const lastHistoryStatus: UndoObject = (differs ? this.currentHistoryStatus : this.history.pop());

        const lastHistoryObject: LangTranslationsObject = JSON.parse(lastHistoryStatus.contents);

        // this.showHistory('UNDO');

        // Remember the current status
        this.currentHistoryStatus = lastHistoryStatus;

        // Remember the future
        this.future.push({ key: curentStatus.key, contents: curentStatus.contents });
        this.emitHistoryInfo();

        return lastHistoryObject;
    }

    redo(translations: LangTranslationsObject): LangTranslationsObject {
        const curentStatus: UndoObject = { key: this.currentHistoryStatus.key, contents: JSON.stringify(translations) };
        const differs: boolean = curentStatus.contents !== this.currentHistoryStatus.contents;

        if (differs) {
            // Should store the previous status in history
            this.history.push({ key: this.currentHistoryStatus.key, contents: this.currentHistoryStatus.contents });
        }
        // Store the current status in history
        this.history.push({ key: curentStatus.key, contents: curentStatus.contents });

        const newFutureStatus: UndoObject = this.future.pop();
        const newFutureObject: LangTranslationsObject = JSON.parse(newFutureStatus.contents);
        this.currentHistoryStatus = newFutureStatus;
        this.emitHistoryInfo();

        // this.showHistory('REDO');
        return newFutureObject;
    }

    private emitHistoryInfo(): void {
        this._historyInfo.next({ history: this.history.length - 1, future: this.future.length });
    }

    /*
    showHistory(msg: string) {
        console.log(msg);
        this.history.forEach((h, i) => console.log(' - ' + i + ': ' + h.key));
        this.future.forEach((h, i) => console.log(' + ' + i + ': ' + h.key));
    }
    */

}
