import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

import { ElectronProvider } from '../../providers/electron-provider';
import { LangToolsService } from '../../providers/lang-tools-service';

import { LangFileObject, LangTranslationsObject, LangNodeObject, LangTopicObject } from '../../customTypes/langObject.types';
import { UndoService } from '../../providers/undo-service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
    private translations: LangTranslationsObject = this.langTools.clearTranslations();

    level: LangNodeObject;
    words: Array<LangNodeObject | LangTopicObject>;

    projectNeedsSaving = false;
    projectReady = false;
    addNodeOrIdReady = false;
    removeNodeReady = false;

    constructor(private electron: ElectronProvider,
        private langTools: LangToolsService,
        private undoService: UndoService,
        private alertCtrl: AlertController
    ) {
    }

    ngOnInit() {
        this.langTools.getCurrentlyEditedWord().subscribe((data: LangNodeObject) => {
            this.addNodeOrIdReady = false;
            this.removeNodeReady = false;
            if (data) {
                this.removeNodeReady = true;
                if (!data.isLeaf) {
                    this.addNodeOrIdReady = true;
                }
            }
        });
    }

    doNewProject() {
        console.log('Create New project');
    }

    doInitFrom() {
        const folder = this.electron.selectFolder();

        // console.log("> Selected folder: "+folder);

        if (folder) {
            const path_to_i18n = this.electron.findTranslationsFolder(folder);

            // console.log("> i18n folder: "+path_to_i18n);

            if (path_to_i18n) {
                const langFiles: Array<LangFileObject> = this.electron.readTranslationsFiles(path_to_i18n);

                this.translations = this.langTools.initTranslations(langFiles);

                // Remember paths
                this.translations.options.projectFolder = folder;
                this.translations.options.i18nFolder = path_to_i18n;

                this.doInitFromTranslations(true);
            }
        }
    }

    doInitFromTranslations(shouldInit: boolean = false) {
        this.level = this.translations.root;
        this.words = this.level.nodes;
        // this.langTools.sort(this.words as Array<langNodeObject>);
        this.doSortTranslations(this.level);

        this.projectNeedsSaving = true;
        this.projectReady = true;

        if (shouldInit) {
            this.undoService.clearHistory(this.translations);
        }
    }

    doSortTranslations(node: LangNodeObject) {
        this.langTools.sort(node.nodes as Array<LangNodeObject>);
        node.nodes.forEach((n: LangNodeObject) => {
            if (!n.isLeaf) {
                this.doSortTranslations(n);
            }
        });
    }

    doOpenProject() {
        console.log('Open existing project');
    }

    doSaveProject() {
        if (this.projectNeedsSaving) {
            console.log('Save current project');
        }
    }

    doSaveTranslations() {
        if (this.langTools.isTranslationsSavingRequired()) {
            if (this.electron.writeTranslationFiles(this.translations, false)) {
                this.langTools.doTranslationNeedsSaving(false);
            } else {
                this.langTools.doTranslationNeedsSaving(true);
            }
        }
    }

    doOpenSettings() {
        console.log('Open project settings');
    }

    doShowAbout() {
        console.log('Show about');
    }

    doAddRootNode() {
        if (this.projectReady) {
            this.langTools.doClearEditWord();

            const newNode: LangNodeObject = this.langTools.createNodeAtLevel(this.level, 'New_Node');
            this.projectNeedsSaving = true;
            this.langTools.doTranslationNeedsSaving(true);
            this.langTools.doEditWord(newNode);
        }
    }

    doAddNode() {
        if (this.addNodeOrIdReady) {
            const level: LangNodeObject = this.langTools.getCurrentlyEditedWordValue();

            this.langTools.doClearEditWord();
            const newNode: LangNodeObject = this.langTools.createNodeAtLevel(level, 'New_Node');
            this.projectNeedsSaving = true;
            this.langTools.doTranslationNeedsSaving(true);
            this.langTools.doEditWord(newNode);
        }
    }

    doAddId() {
        if (this.addNodeOrIdReady) {
            const level: LangNodeObject = this.langTools.getCurrentlyEditedWordValue();

            this.langTools.doClearEditWord();
            const newId: LangNodeObject = this.langTools.createIdAtLevel(level, 'New_Id');
            this.projectNeedsSaving = true;
            this.langTools.doTranslationNeedsSaving(true);
            this.langTools.doEditWord(newId);
        }
    }

    async doRemoveCurrent() {
        if (this.removeNodeReady) {
            const level: LangNodeObject = this.langTools.getCurrentlyEditedWordValue();
            const nodes = this.langTools.countDescendants(level);

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
                            this.langTools.doClearEditWord();
                            this.langTools.removeNode(level);
                            this.projectNeedsSaving = true;
                            this.langTools.doTranslationNeedsSaving(true);
                        }
                    }
                ]
            });
            confirm.present();
        }
    }

    doUndo() {
        if (this.undoService.hasHistory()) {
            this.translations = this.langTools.undo();
            this.doInitFromTranslations();
            // console.log(this.level);
        }
    }

    doRedo() {
        if (this.undoService.hasFuture()) {
            this.translations = this.langTools.redo();
            this.doInitFromTranslations();
            // console.log(this.level);
        }
    }

    doZoomIn() {
        this.electron.zoomIn();
    }

    doZoomOut() {
        this.electron.zoomOut();
    }

}
