import { UndoService } from "./undo-service";
import { langTranslationsObject } from "../customTypes/langObject.types";

// 
// npm link @angular/cli
// ng test
//

// Straight Jasmine testing without Angular's testing support
describe('UndoService', () => {
    let undoService: UndoService;
    let translations: langTranslationsObject;

    beforeEach(() => { 
        undoService = new UndoService();
        const k1 : langNodeObject = {

        };
        const k2 : langNodeObject = {

        };

        translations = {
            options : null,
            languages : [],
            root: {
                key: "",
                full_key: "",
                isLeaf: false,
                level: 0,
                nodes: [k1, k2]
            }
        }
    });
    
    it('#getValue should return real value', () => {
        this.undoService.clearHistory(this.translations);

        expect(undoService.getValue()).toBe('real value');
    });
    
    /*
    it('#getObservableValue should return value from observable',
    (done: DoneFn) => {
    undoService.getObservableValue().subscribe(value => {
        expect(value).toBe('observable value');
        done();
    });
    });
    
    it('#getPromiseValue should return value from a promise',
    (done: DoneFn) => {
    undoService.getPromiseValue().then(value => {
        expect(value).toBe('promise value');
        done();
    });
    });
    */
});
