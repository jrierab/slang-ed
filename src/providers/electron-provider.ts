import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { LangFileObject, LangTranslationsObject, LangNodeObject, LangTopicObject } from '../customTypes/langObject.types';


// Not very elegant, but avoid types failing...
const electron = window['require']('electron');

// https://nodejs.org/api/fs.html
const fs = electron.remote.require('fs');

/*
  Generated class for the ElectronProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ElectronProvider {
    currentZoom = 0;

    constructor(public translate: TranslateService) {
        console.log('### ElectronProvider');
    }

    zoomIn() {
        electron.webFrame.setZoomLevel(++this.currentZoom);
    }

    zoomOut() {
        electron.webFrame.setZoomLevel(--this.currentZoom);
    }

    selectFolder(): string {
        const pathArray = electron.remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
        const path = (pathArray ? pathArray[0] : '');
        return path;
    }

    getAppVersion() {
        const appVersion = electron.remote.require('../package.json').version;
        return appVersion;
    }

    doOpenProject(): {translations: LangTranslationsObject, filename: string} {
        const files = electron.remote.dialog.showOpenDialog({
            title: this.translate.instant('Electron.OpenProject.Title'),
            filters: [{ name: this.translate.instant('Electron.NewProject.FileType'), extensions: ['sprj'] }],
            buttonLabel: this.translate.instant('Electron.OpenProject.ButtonLabel')
        });

        if (files) {
            const filename: string = files[0];
            const filecontents = fs.readFileSync(filename, 'utf8');
            if (filecontents) {
                const fileObject = JSON.parse(filecontents);
                const translations: LangTranslationsObject = fileObject.data;
                const version: string = fileObject['slang-ed'];
                console.log(filename, version);
                // TODO: Verify version
                // TODO: Verify if translations files had been touched by another program: datetime? Object comparison?
                return {translations: translations, filename: filename};
            }
        }
        return {translations: null, filename: null};
    }

    doNewProject(translations: LangTranslationsObject): string {
        const filename = electron.remote.dialog.showSaveDialog({
            title: this.translate.instant('Electron.NewProject.Title'),
            filters: [{ name: this.translate.instant('Electron.NewProject.FileType'), extensions: ['sprj'] }],
            buttonLabel: this.translate.instant('Electron.NewProject.ButtonLabel')
        });

        if (filename) {
            this.doSaveProject(filename, translations);
        }
        return filename;
    }

    doSaveProject(filename: string, translations: LangTranslationsObject) {
        console.log(filename);
        fs.writeFileSync(filename, JSON.stringify({
            'slang-ed': this.getAppVersion(),
            'data': translations
        }));
    }

    findTranslationsFolder(path): string {
        let path_to_i18n: string = null;

        // Check if it is a 'i18n' dir
        const sub_paths: Array<string> = ['/src/assets/i18n',
            '/assets/i18n',
            '/i18n',
            '/',
        ];

        sub_paths.some(subpath => {
            const exists = fs.existsSync(path + subpath);

            if (exists) { path_to_i18n = path + subpath; }
            return exists;
        });

        return path_to_i18n;
    }

    readTranslationsFiles(path: string): Array<LangFileObject> {
        const langFiles: Array<LangFileObject> = [];

        if (path) {
            const files: Array<string> = fs.readdirSync(path, 'utf-8');

            files.forEach(file => {
                const regex = /^[A-Za-z]{2}.json$/;

                if (regex.test(file)) {
                    const data = fs.readFileSync(path + '/' + file, 'utf-8');

                    langFiles.push({ filename: file, contents: data });
                }
            });
        }

        return langFiles;
    }

    writeTranslationFiles(translations: LangTranslationsObject, treeMode: boolean): boolean {
        let isOk = true;

        if (treeMode) {
            console.log('TreeMode is not yet supported: reverting to fullKey mode');
        }

        translations.languages.forEach((lang) => {
            const filename = translations.options.i18nFolder + '/' + lang + '.json';
            let isFirst = true;
            let data = '{\n';

            // Rename current file to preserve it in case of error
            fs.renameSync(filename, filename + '.bak');

            translations.root.nodes.forEach((node: LangNodeObject) => {
                if (!isFirst) {
                    data += ',\n\n';
                }
                data += this.buildForKey(lang, node, true);
                isFirst = false;

            });
            data += '\n}\n';

            console.log(filename);
            console.log(data);

            fs.writeFileSync(filename, data, 'utf8');

            if (!fs.existsSync(filename)) {
                isOk = false;
                console.log('ERROR: Unable to create file !!!');

                // Recover preserved file in case of error
                fs.renameSync(filename + '.bak', filename);

                console.log('Recovering ' + filename + '...');

            } else {
                // Verify files
                try {
                    JSON.parse(fs.readFileSync(filename, 'utf-8'));

                    // All ok. Remove possible old err file
                    if (fs.existsSync(filename + '.err')) {
                        fs.unlinkSync(filename + '.err');
                        console.log('Removing old ' + filename + '.err');
                    }

                } catch (e) {
                    isOk = false;
                    console.log('ERROR', e);

                    // Preserve file with errors to analyze
                    fs.renameSync(filename, filename + '.err');

                    // Recover preserved file in case of error
                    fs.renameSync(filename + '.bak', filename);

                    console.log('Recovering ' + filename + '...');
                    console.log('Translation (with errors) stored in ' + filename + '.err');
                }
            }
        });

        return isOk;
    }

    private buildForKey(lang: string, level: LangNodeObject, isFirst: boolean): string {
        let data = '';
        const indent = level.level;

        if (level.isLeaf) {
            data = (isFirst ? '' : ',\n');
            for (let i = 0; i < indent; i++) {
                data += '  ';
            }
            const langNode: LangTopicObject = level.nodes.find((n: LangTopicObject) => n.lang === lang) as LangTopicObject;
            if (langNode) {
                data += '"' + level.full_key + '": "' + langNode.value + '"';
            } else {
                data += '"' + level.full_key + '": ""';
            }

        } else {
            level.nodes.forEach((subnode: LangNodeObject) => {
                data += this.buildForKey(lang, subnode, isFirst);
                isFirst = false;
            });
        }
        return data;
    }

}
