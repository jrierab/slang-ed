import { Component, OnInit } from '@angular/core';

import { ElectronProvider } from '../../providers/electron-provider';
import { LangToolsService } from '../../providers/lang-tools-service';

import { LangFileObject, LangTranslationsObject, LangNodeObject, LangTopicObject } from '../../customTypes/langObject.types';
import { UndoService } from '../../providers/undo-service';
import { HistoryInfoObject } from 'src/customTypes/undoObject.types';
import { AlertController } from '@ionic/angular';
import { LangService } from 'src/providers/lang-service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
    private translations: LangTranslationsObject = this.langTools.clearTranslations();

    rootLevel: LangNodeObject;
    words: Array<LangNodeObject | LangTopicObject>;

    projectNeedsSaving = false;
    projectReady = false;
    addNodeOrIdReady = false;
    removeNodeReady = false;

    public historyInfo: HistoryInfoObject;

    constructor(
        private electron: ElectronProvider,
        private langTools: LangToolsService,
        private undoService: UndoService,
        public translate: TranslateService,
        private langService: LangService,
        private alertCtrl: AlertController,
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
        this.langTools.translationsNeedsSaving$.subscribe((saveRequired: boolean) => {
            if (saveRequired) {
                this.projectNeedsSaving = true;
            }
        });
        this.undoService.historyInfo$.subscribe((info: HistoryInfoObject) => this.historyInfo = info);
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

                this.doSortTranslations(this.translations.root);
                this.doInitFromTranslations(true);
            }
        }
    }

    doInitFromTranslations(shouldInit: boolean = false) {
        this.rootLevel = this.translations.root;
        this.words = this.rootLevel.nodes;

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

    doAddRootNode() {
        if (this.projectReady) {
            this.langTools.doAddRootNode();
        }
    }

    doAddNode() {
        if (this.addNodeOrIdReady) {
            this.langTools.doAddNode();
        }
    }

    doAddId() {
        if (this.addNodeOrIdReady) {
            this.langTools.doAddId();
        }
    }

    async doRemoveCurrent() {
        if (this.removeNodeReady) {
            this.langTools.doDelete();
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

    async doOpenSettings() {
        const currentLang: string = this.langService.getCurrentLang();

        const alert = await this.alertCtrl.create({
            header: this.translate.instant('Config.TitleLanguage'),
            cssClass: 'config-popup',
            inputs: [
                {
                    name: 'ca',
                    type: 'radio',
                    label: 'Català',
                    value: 'ca',
                    checked: currentLang === 'ca'
                },
                {
                    name: 'en',
                    type: 'radio',
                    label: 'English',
                    value: 'en',
                    checked: currentLang === 'en'
                }
            ],
            buttons: [
                {
                    text: this.translate.instant('APP.Cancel'),
                    role: 'cancel'
                }, {
                    text: this.translate.instant('APP.Ok'),
                    handler: (lang: string) => {
                        this.langService.setLanguage(lang);
                    }
                }
            ]
        });

        await alert.present();
    }


    async doShowAbout() {
        const appVersion = this.electron.getAppVersion();

        const alert = await this.alertCtrl.create({
            header: this.translate.instant('APP.Name') + ': ' + this.translate.instant('APP.Title'),
            // tslint:disable: max-line-length
            message: '<div>' + this.translate.instant('About.Version') + ': ' + this.translate.instant('APP.Name') + ' v' + appVersion + '<br/>'
                + 'Github: <a href="https://github.com/jrierab/slang-ed" title="jrierab\'s Github">https://github.com/jrierab/slang-ed</a></div>'
                + '<div>' + this.translate.instant('About.Icons') + ' <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> '
                + this.translate.instant('About.license') + ' <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC 3.0 BY</a>:'
                + '<br/>- <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a>'
                + '<br/>- <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a>'
                + '</div><hr>',
            // tslint:enable: max-line-length
            cssClass: ['config-popup', 'about-popup'],
            buttons: [
                {
                    text: this.translate.instant('APP.Ok')
                }
            ]
        });

        await alert.present();
    }

}
