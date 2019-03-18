import { UndoService } from "./undo-service";
import { langTranslationsObject, langNodeObject } from "../customTypes/langObject.types";

// 
// npm link @angular/cli
// ng test
//

// Straight Jasmine testing without Angular's testing support
describe('UndoService', () => {
    const undoService: UndoService = new UndoService();
    let translations: langTranslationsObject;

    beforeEach(() => { 
        const t: langTranslationsObject = {    
            options : null,
            languages : [],
            root: {
                key: "",
                full_key: "",
                isLeaf: false,
                level: 0,
                nodes: []
            }
        };
        for(let n_l1=0; n_l1<2; n_l1++) {
            const key_l1: string = "key_"+n_l1.toString();
            const node_l1: langNodeObject = {
                key: key_l1,
                full_key: key_l1,
                isLeaf : false,
                level: 1,
                nodes: []
            }
            for(let n_l2=0; n_l2<4; n_l2++) {
                const key_l2: string = "key_"+n_l2.toString();
                const node_l2: langNodeObject = {
                    key: key_l2,
                    full_key: key_l1+"."+key_l2,
                    isLeaf : true,
                    level: 2,
                    nodes: []
                }
                for(let v_l2=0; v_l2<2; v_l2++) {
                    const lang: string = (v_l2===0? "ca": "en");
                    node_l2.nodes.push({
                        lang: lang,
                        value: "value_"+lang+"_"+n_l1.toString()+"_"+n_l2.toString(),
                        comment: "",
                        approved: false,
                        foundInSrc: false,
                        preserve: false
                    });
                }
                node_l1.nodes.push(node_l2);
            }
            t.root.nodes.push(node_l1);
        }
        translations = JSON.parse(JSON.stringify(t));
    });
    
    it('ClearHistory test', () => {
        const myTranslations = JSON.parse(JSON.stringify(translations));

        // Init and start
        undoService.clearHistory(myTranslations);

        expect(undoService.hasHistory()).toBe(false, "hasHistory");
        expect(undoService.hasFuture()).toBe(false, "hasFuture");
    });

        
    it('Undo/Redo 1 cycle', () => {
        let myTranslations = JSON.parse(JSON.stringify(translations));

        //console.log(JSON.stringify(myTranslations));

        // Init and start
        undoService.clearHistory(myTranslations);

        // Click one key, but do not modify it
        undoService.rememberThisHistory("key_0", myTranslations);
        
        expect(undoService.hasHistory()).toBe(false, "hasHistory");
        expect(undoService.hasFuture()).toBe(false, "hasFuture");
        
        // Click another key and modify it
        undoService.rememberThisHistory("key_1", myTranslations);
        myTranslations.root.nodes[1].key = "key_1_mod";

        // Click another key - this will store the new data
        undoService.rememberThisHistory("key_2", myTranslations);
        
        expect(undoService.hasHistory()).toBe(true, "hasHistory");
        expect(undoService.hasFuture()).toBe(false, "hasFuture");

        // UNDO
        myTranslations = undoService.undo(myTranslations);

        // Should have recovered
        expect(myTranslations.root.nodes[1].key).toBe("key_1", "UNDO key_1");

        expect(undoService.hasHistory()).toBe(false, "hasHistory");
        expect(undoService.hasFuture()).toBe(true, "hasFuture");
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
