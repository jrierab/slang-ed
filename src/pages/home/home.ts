import { Component } from '@angular/core';

import { ElectronProvider } from '../../providers/electron-provider';
import { LangToolsService } from '../../providers/lang-tools-service';

import { langFileObject, langTranslationsObject, langNodeObject, langTopicObject } from "../../customTypes/langObject.types"

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  translations : langTranslationsObject = this.langTools.clearTranslations();

  level : langNodeObject;
  words : Array<langNodeObject | langTopicObject>;

  projectNeedsSaving : boolean = false;

  constructor(  private electron : ElectronProvider,
                private langTools : LangToolsService
              ) 
  {
  }

  doNewProject() {
    console.log("Create New project");
  }

  doInitFrom() {
    let folder = this.electron.selectFolder();

    //console.log("> Selected folder: "+folder);

    if(folder) {
      let path_to_i18n = this.electron.findTranslationsFolder(folder);

      //console.log("> i18n folder: "+path_to_i18n);

      if(path_to_i18n) {
        let langFiles : Array<langFileObject> = this.electron.readTranslationsFiles(path_to_i18n);

        this.translations = this.langTools.initTranslations(langFiles);

        // Remember paths
        this.translations.options.projectFolder = folder;
        this.translations.options.i18nFolder = path_to_i18n;
 
        this.level = this.translations.root;
        this.words = this.level.nodes;
        this.langTools.sort(this.words as Array<langNodeObject>);

        this.projectNeedsSaving = true;
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
    if(this.langTools.isTranslationsSavingRequired()) {
      if( this.electron.writeTranslationFiles(this.translations, false) ) {
        this.langTools.doTranslationNeedsSaving(false);
      } else {
        this.langTools.doTranslationNeedsSaving(true);
      }
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
