import { Injectable } from '@angular/core';

import { langFileObject, langTranslationsObject } from "../customTypes/langObject.types"

// Not very elegant, but avoid types failing... 
const electron = window['require']("electron");

// https://nodejs.org/api/fs.html
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

  readTranslationsFiles(path : string): Array<langFileObject> {
    let langFiles : Array<langFileObject> = [];

    if(path) {
      let files : Array<string> = fs.readdirSync(path, 'utf-8');

      files.forEach(file => {
        let regex = /^[A-Za-z]{2}.json$/;

        if(regex.test(file)) {
          let data = fs.readFileSync(path+"/"+file, 'utf-8');

          langFiles.push({filename: file, contents: data})
        }
      });
    }

    return langFiles;
  }

  writeTranslationFiles(translations: langTranslationsObject, treeMode: boolean): boolean {
    let isOk: boolean = false;
    
    if(treeMode) {
      console.log("TreeMode is not yet supported: reverting to fullKey mode");
    }
    
    for(let lang of translations.languages) {
      const filename = translations.i18nFolder+"/"+lang+".json";
      let isFirst: boolean = true;
      let data : string = "{\n";

      // Rename current file to preserve it in case of error
      fs.rename(filename, filename+".bak");

      for(let key in translations.i18n) {
        if (key !== "isLeaf" && key !="full_key") {
          if(!isFirst) {
            data += ",\n\n";
          }
          data += this.buildForKey(lang, translations.i18n[key], 1, true);
          isFirst = false;
        }
      }
      data += "\n}\n";

      console.log("Saving translations into: "+filename);
      fs.writeFileSync(filename, data);

      // Verify files
      try {
        JSON.parse(fs.readFileSync(filename, 'utf-8'));

        // Remove possible old err file
        if(fs.existsSync(filename+".err")) {
          fs.unlink(filename+".err");
          console.log("Removing old "+filename+".err");
        }
        isOk = true;

      } catch(e) {
        console.log("ERROR", e);

        // Preserve file with errors to analyze
        fs.rename(filename, filename+".err");
        // Recover preserved file in case of error
        fs.rename(filename+".bak", filename);

        console.log("Recovering "+filename+"...");
        console.log("Translation (with errors) stored in "+filename+".err");
      }
    }

    return isOk;
  }

  private buildForKey(lang: string, level: any, indent: number, isFirst: boolean): string {
    let data : string = "";

    if( level['isLeaf'] ) {
      data = (isFirst? "": ",\n");
      for(let i=0; i<indent; i++) {
        data += "  ";
      }
      data += '"'+level['full_key']+'": "'+level[lang].value+'"';

    } else {
      for(let key in level) {
        if (key !== "isLeaf" && key !="full_key") {
          data += this.buildForKey(lang, level[key], indent+1, isFirst);
          isFirst = false; 
        }
      }
    }
    return data;
  }

}
