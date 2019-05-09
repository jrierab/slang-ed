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
    private projectFilename: string;

    rootLevel: LangNodeObject;
    words: Array<LangNodeObject | LangTopicObject>;

    projectNeedsSaving = false;
    projectReady = false;
    langFilesLoaded = false;
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
            this.projectNeedsSaving = (this.projectNeedsSaving || saveRequired) && !!this.projectFilename;
        });
        this.undoService.historyInfo$.subscribe((info: HistoryInfoObject) => this.historyInfo = info);
    }

    doNewProject() {
        if (this.langFilesLoaded) {
            const filename: string = this.electron.doNewProject(this.translations);

            if (filename) {
                this.projectFilename = filename;
            }
        }
    }

    doInitFrom() {
        const folder = this.electron.selectFolder('Electron.InitFromDir.Title', 'Electron.InitFromDir.ButtonLabel');

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

                // Clear a possible old file project
                this.projectFilename = null;

                this.doSortTranslations(this.translations.root);
                this.doInitFromTranslations(true);
            }
        }
    }

    doInitFromTranslations(shouldInit: boolean = false) {
        this.rootLevel = this.translations.root;
        this.words = this.rootLevel.nodes;

        this.projectReady = true;
        this.langFilesLoaded = true;
        
        if (shouldInit) {
            this.langTools.doSetTranslations(this.translations);
            this.undoService.clearHistory(this.translations);
            this.projectNeedsSaving = false;
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
        if (!(this.projectNeedsSaving || this.langTools.isTranslationsSavingRequired())) {
            const project: {translations: LangTranslationsObject, filename: string} = this.electron.doOpenProject();

            if (project.translations) {
                let allFound : boolean;
                let cancel: boolean = false;
                let path_to_i18n: string;
                do {
                    allFound = this.electron.verifyTranslationFilesDir(project.translations);
                    if (!allFound) {
                        const folder = this.electron.selectFolder('Electron.NewLocation.Title', 'Electron.NewLocation.ButtonLabel');           
                        if (folder) {
                            path_to_i18n = this.electron.findTranslationsFolder(folder);
                            // Remember new paths
                            project.translations.options.projectFolder = folder;
                            project.translations.options.i18nFolder = path_to_i18n;
                       } else {
                           cancel = true;
                       }
                    }
                } while(!allFound && !cancel);
                
                if (allFound) {
                    // TODO: Verify if translations files had been touched by another program: datetime? Object comparison?

                    this.projectFilename = project.filename;
                    this.translations = project.translations;

                    this.doSortTranslations(this.translations.root);
                    this.doInitFromTranslations(true);

                    // Should save if it has required to search for its new location
                    this.projectNeedsSaving = !!path_to_i18n;
                }
            }
        }
    }

    doSaveProject() {
        if (this.projectNeedsSaving && this.projectFilename) {
            this.electron.doSaveProject(this.projectFilename, this.translations);
            this.projectNeedsSaving = false;
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
