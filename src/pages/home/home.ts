import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';


import { ElectronProvider } from '../../providers/electron-provider';
import { LangToolsService } from '../../providers/lang-tools-service';

import { langFileObject, langTranslationsObject } from "../../customTypes/langObject.types"
import { ListWordComponent } from '../../components/list-word/list-word';
import { ComponentsModule } from "../../components/components.module"

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  translations : langTranslationsObject = this.langTools.emptyTranslations;

  words : Array<string>;

  projectNeedsSaving : boolean = false;
  translationsNeedsSaving : boolean = false;

  constructor(  public navCtrl: NavController,
                public electron : ElectronProvider,
                public langTools : LangToolsService
              ) 
  {
  }

  doNewProject() {
    console.log("Create New project");
  }

  doInitFrom() {
    let folder = this.electron.selectFolder();

    console.log("> Selected folder: "+folder);

    if(folder) {
      let path_to_i18n = this.electron.findTranslationsFolder(folder);

      console.log("> i18n folder: "+path_to_i18n);

      if(path_to_i18n) {
        let langFiles : Array<langFileObject> = this.electron.readTranslationsFiles(path_to_i18n);

        this.translations = this.langTools.initTranslations(langFiles);

        // Remember paths
        this.translations.projectFolder = folder;
        this.translations.i18nFolder = path_to_i18n;
 
        this.words = [];
        for(let key of Object.keys(this.translations.i18n)) {
          if( this.translations.i18n[key] !== null && (typeof this.translations.i18n[key] === 'object')) this.words.push(key);
        }
        this.words.sort();
  
        this.projectNeedsSaving = true;
        this.translationsNeedsSaving = true;
      }
    }
  }

  doOpenProject() {
    console.log("Open existing project");
  }

  doSaveProject() {
    if(this.projectNeedsSaving) {
      console.log("Save current project");
    }
  }

  doSaveTranslations() {
    if(this.translationsNeedsSaving) {
      if( this.electron.writeTranslationFiles(this.translations, false) ) {
        this.translationsNeedsSaving = false;
      };
    }    
  }

  doOpenSettings() {
    console.log("Open project settings");
  }

  doZoomIn() {
    this.electron.zoomIn();
  }
  
  doZoomOut() {
    this.electron.zoomOut();
  }
  
}
