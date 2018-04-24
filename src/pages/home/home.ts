import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';


import { ElectronProvider } from '../../providers/electron-provider';
import { LangToolsService } from '../../providers/lang-tools-service';

import { langFileObject } from "../../customTypes/langObject.types"

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  needsSaving : boolean = false;

  constructor(  public navCtrl: NavController,
                public electron : ElectronProvider,
                public langTools : LangToolsService
              ) 
  {
  }

  doNewProject() {
    let folder = this.electron.selectFolder();

    console.log("> Selected folder: "+folder);

    if(folder) {
      let path_to_i18n = this.electron.findTranslationsFolder(folder);

      console.log("> i18n folder: "+path_to_i18n);

      if(path_to_i18n) {
        let langFiles : Array<langFileObject> = this.electron.readTranslationsFiles(path_to_i18n);

        this.langTools.initTranslations(langFiles);

        this.needsSaving = false;
      }
    }
  }

  doOpenProject() {
    console.log("Open existing project");
  }

  doSaveProject() {
    if(this.needsSaving) {
      console.log("Save current project");
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
