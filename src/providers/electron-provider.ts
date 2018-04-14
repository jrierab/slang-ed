import { Injectable } from '@angular/core';

// Not very elegant, but avoid types failing... 
const electron = window['require']("electron");
const fs = electron.remote.require('fs')

/*
  Generated class for the ElectronProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ElectronProvider {
  currentZoom: number = 0;

  constructor() {
    console.log('### ElectronProvider');
  }

  zoomIn(){
    electron.webFrame.setZoomLevel(++this.currentZoom);
  }

  zoomOut(){
    electron.webFrame.setZoomLevel(--this.currentZoom);
  }

  selectFolder(): string {
    let pathArray = electron.remote.dialog.showOpenDialog({properties: ['openDirectory']});
    let path = (pathArray? pathArray[0]: "");
    return path;
  }

  findTranslationsFolder(path): string {
    let path_to_i18n : string = null;

    // Check if it is a 'i18n' dir
    let sub_paths : Array<string> = [ "/src/assets/i18n",
                                      "/assets/i18n",
                                      "/i18n",
                                      "/",
                                    ];
    
    sub_paths.some( subpath => {
      let exists = fs.existsSync(path+subpath);

      if(exists) path_to_i18n = path+subpath;
      return exists;
    })
          
    return path_to_i18n;
  }

  readTranslations(path : string) {
    if(path) {
      let files : Array<string> = fs.readdirSync(path, 'utf-8');

      files.forEach(file => {
        let regex = /^[A-Za-z]{2}.json$/;

        if(regex.test(file)) {
          let data = fs.readFileSync(path+"/"+file, 'utf-8');
        
          console.log("> "+file);
          //if (data) console.log(data);          
        }
      });
    }

  }

}
