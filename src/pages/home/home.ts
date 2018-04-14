import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';


import { ElectronProvider } from '../../providers/electron-provider';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(  public navCtrl: NavController,
                public electron : ElectronProvider,
              ) 
  {}

  doSelectFolder() {
    let folder = this.electron.selectFolder();

    console.log("> Selected folder: "+folder);

    if(folder) {
      let path_to_i18n = this.electron.findTranslationsFolder(folder);

      console.log("> i18n folder: "+path_to_i18n);

      if(path_to_i18n) this.electron.readTranslations(path_to_i18n);
    }
  }

  doZoomIn() {
    this.electron.zoomIn();
  }

  doZoomOut() {
    this.electron.zoomOut();
  }
  
}
