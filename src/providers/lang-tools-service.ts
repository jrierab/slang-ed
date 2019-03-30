import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { LangFileObject, LangNodeObject, LangTranslationsObject, LangTopicObject } from '../customTypes/langObject.types';
import { UndoService } from './undo-service';
import { AlertController } from '@ionic/angular';

/*
  Generated class for the LangToolsService provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LangToolsService {
    private translations: LangTranslationsObject = this.clearTranslations();

    private currentWord$: BehaviorSubject<LangNodeObject> = new BehaviorSubject(null);
    public translationsNeedsSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        private alertCtrl: AlertController,
        private undoService: UndoService
    ) {
        console.log('### LangToolsService');
    }

    clearTranslations(): LangTranslationsObject {
        const emptyOptions = { projectFolder: '', i18nFolder: '' };
        const emptyRoot = { key: '', full_key: '', isLeaf: false, level: 0, nodes: [] };

        return {
            options: JSON.parse(JSON.stringify(emptyOptions)),
            languages: [],
            root: JSON.parse(JSON.stringify(emptyRoot))
        };
    }

    initTranslations(langFiles: Array<LangFileObject>) {
        this.translations = this.clearTranslations();

        langFiles.forEach(langFile => {
            const code: string = langFile.filename.substring(0, 2);
            let lang_translations: any;

            try {
                lang_translations = JSON.parse(langFile.contents);
                this.translations.languages.push(code);

                this.buildLangStructure(code, this.translations.root, lang_translations);
            } catch (e) {
                // TODO: Catch error and give a proper error message to the user
                console.log(e);
            }
        });

        console.log('> Lang structure...', this.translations);

        this.doTranslationNeedsSaving(false);
        this.doClearEditWord();

        // this.undoService.clearHistory(this.translations);

        return this.translations;
    }

    createNodeAtLevel(parent: LangNodeObject, key: string): LangNodeObject {
        const new_node = {
            key: key,
            full_key: parent.full_key + (parent.full_key ? '.' : '') + key,
            isLeaf: false,
            level: parent.level + 1,
            nodes: []
        };
        parent.nodes.push(new_node);
        return new_node;
    }

    createIdAtLevel(parent: LangNodeObject, key: string): LangNodeObject {
        const new_node = this.createNodeAtLevel(parent, key);
        new_node.isLeaf = true;

        this.translations.languages.forEach((lang) => {
            new_node.nodes.push({
                lang: lang,
                value: '',
                approved: false,
                preserve: false,
                foundInSrc: false,
                comment: ''
            });
        });
        return new_node;
    }

    removeNode(node: LangNodeObject): void {
        const parent = this.getParent(node);
        const pos: number = parent.nodes.indexOf(node);
        if (pos !== -1) {
            parent.nodes.splice(pos, 1);
        }
    }

    buildLangStructure(lang: string, level: LangNodeObject, lang_translations: Object) {
        for (const key of Object.keys(lang_translations)) {
            const subkeys: Array<string> = key.split('.');
            let deep_level: LangNodeObject = level;

            subkeys.forEach(k => {
                const node: LangNodeObject = deep_level.nodes.find((el: LangNodeObject) => el.key === k) as LangNodeObject;

                if (!node) {
                    deep_level = this.createNodeAtLevel(deep_level, k);
                } else {
                    deep_level = node;
                }
            });

            const translation = lang_translations[key];

            if (translation instanceof Object) {
                this.buildLangStructure(lang, deep_level, translation);

            } else {
                deep_level.isLeaf = true;

                const langNode: LangTopicObject = deep_level.nodes.find((n: LangTopicObject) => n.lang === lang) as LangTopicObject;

                if (langNode) {
                    console.log('ERROR: ' + deep_level.full_key + ' already defined for lang ' + lang + ' !!!');
                } else {
                    deep_level.nodes.push({
                        lang: lang,
                        value: translation,
                        approved: false,
                        preserve: false,
                        foundInSrc: false,
                        comment: ''
                    });
                }
            }
        }
    }

    doEditWord(word: LangNodeObject): void {
        if (this.currentWord$.value !== word) {
            // this.undoService.rememberThisHistory(this.wordNum, "Update Word: "+
            // (this.currentWord.value? this.currentWord.value.full_key: "null"), this.translations);
            this.currentWord$.next(word);
        }
    }

    doClearEditWord() {
        if (this.currentWord$.value) {
            // this.undoService.rememberThisHistory(this.wordNum, "Clear Word: "+this.currentWord.value.full_key, this.translations);
            this.currentWord$.next(null);
        }
    }

    sort(words: Array<LangNodeObject>) {
        words.sort((a: LangNodeObject, b: LangNodeObject) => {
            return (a === b ? 0 : (a.key ? a.key.toLowerCase() : '') > (b.key ? b.key.toLowerCase() : '') ? 1 : -1);
        });
    }

    doTranslationNeedsSaving(b: boolean): void {
        this.translationsNeedsSaving$.next(b);
    }

    isTranslationsSavingRequired(): boolean {
        return this.translationsNeedsSaving$.value;
    }

    getCurrentlyEditedWord(): BehaviorSubject<LangNodeObject> {
        return this.currentWord$;
    }

    getCurrentlyEditedWordValue(): LangNodeObject {
        return this.currentWord$.value;
    }

    doReplaceKeyInDescendants(parent: LangNodeObject, key_before: string) {
        parent.full_key = key_before + (key_before ? '.' : '') + parent.key;

        if (!parent.isLeaf) {
            parent.nodes.forEach((son: LangNodeObject) => this.doReplaceKeyInDescendants(son, parent.full_key));
        }
    }

    countDescendants(level: LangNodeObject): number {
        if (level.isLeaf) { return 1; }

        let n = 0;
        level.nodes.forEach((node: LangNodeObject) => {
            n += this.countDescendants(node);
        });
        return n;
    }

    getParent(node: LangNodeObject): LangNodeObject {
        const keys = node.full_key.split('.');
        let parent = this.translations.root;

        // Remove last key, which is the key for the node itself
        keys.pop();

        keys.forEach((key: string) => {
            const son: LangNodeObject = parent.nodes.find((n: LangNodeObject) => n.key === key) as LangNodeObject;
            if (son) {
                parent = son;
            } else {
                throw Error(('Missing node with key \'' + key + '" when looking for parent'));
            }
        });
        return parent;
    }

    sortParentNodes(node: LangNodeObject): void {
        const parent: LangNodeObject = this.getParent(node);
        this.sort(parent.nodes as Array<LangNodeObject>);
    }

    undo(): LangTranslationsObject {
        this.translations = this.undoService.undo(this.translations);
        return this.translations;
    }

    redo(): LangTranslationsObject {
        this.translations = this.undoService.redo(this.translations);
        return this.translations;
    }

    doRememberTranslations(key: string): void {
        this.undoService.rememberThisHistory(key, this.translations);

    }

    doAddNode(level?: LangNodeObject) {
        if (!level) {
            level = this.getCurrentlyEditedWordValue();
        }

        this.doClearEditWord();
        const newNode: LangNodeObject = this.createNodeAtLevel(level, 'New_Node');
        this.doTranslationNeedsSaving(true);
        this.doEditWord(newNode);
    }

    doAddId(level?: LangNodeObject) {
        if (!level) {
            level = this.getCurrentlyEditedWordValue();
        }

        this.doClearEditWord();
        const newId: LangNodeObject = this.createIdAtLevel(level, 'New_Id');
        this.doTranslationNeedsSaving(true);
        this.doEditWord(newId);
    }

    async doDelete(level?: LangNodeObject) {
        if (!level) {
            level = this.getCurrentlyEditedWordValue();
        }

        const nodes = this.countDescendants(level);

        const confirm = await this.alertCtrl.create({
            header: 'Remove "' + level.full_key + '" ?',
            message: 'This will DELETE ' + nodes + ' language definitions !',
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: 'Agree',
                    handler: () => {
                        this.doClearEditWord();
                        this.removeNode(level);
                        this.doTranslationNeedsSaving(true);
                    }
                }
            ]
        });
        confirm.present();
    }

}
