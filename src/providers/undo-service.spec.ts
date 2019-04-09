import { UndoService } from './undo-service';
import { LangTranslationsObject, LangNodeObject } from '../customTypes/langObject.types';
import { LangToolsService } from './lang-tools-service';

//
// npm link @angular/cli
// ng test
//

// Straight Jasmine testing without Angular's testing support
describe('UndoService', () => {
    const undoService: UndoService = new UndoService();
    const langTools: LangToolsService = new LangToolsService(null, undoService);
    let translations: LangTranslationsObject;

    beforeEach(() => {
        const t: LangTranslationsObject = {
            options: null,
            languages: [],
            root: {
                key: '',
                full_key: '',
                isLeaf: false,
                level: 0,
                nodes: []
            }
        };
        for (let n_l1 = 0; n_l1 < 2; n_l1++) {
            const key_l1: string = 'key_' + n_l1.toString();
            const node_l1: LangNodeObject = {
                key: key_l1,
                full_key: key_l1,
                isLeaf: false,
                level: 1,
                nodes: []
            };
            for (let n_l2 = 0; n_l2 < 4; n_l2++) {
                const key_l2: string = 'key_' + n_l2.toString();
                const node_l2: LangNodeObject = {
                    key: key_l2,
                    full_key: key_l1 + '.' + key_l2,
                    isLeaf: true,
                    level: 2,
                    nodes: []
                };
                for (let v_l2 = 0; v_l2 < 2; v_l2++) {
                    const lang: string = (v_l2 === 0 ? 'ca' : 'en');
                    node_l2.nodes.push({
                        lang: lang,
                        value: 'value_' + lang + '_' + n_l1.toString() + '_' + n_l2.toString(),
                        comment: '',
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

        expect(undoService.hasHistory()).toBe(false, 'hasHistory');
        expect(undoService.hasFuture()).toBe(false, 'hasFuture');
    });

    it('Undo 2 keys, 2 cycles', () => {
        let myTranslations = JSON.parse(JSON.stringify(translations));

        // console.log(JSON.stringify(myTranslations));

        // Init and start
        undoService.clearHistory(myTranslations);

        for (let i = 1; i < 3; i++) {
            // Click one key, but do not modify it
            undoService.rememberThisHistory('key_0', myTranslations);

            expect(undoService.hasHistory()).toBe(false, 'hasHistory');
            expect(undoService.hasFuture()).toBe((i === 1 ? false : true), 'hasFuture (1)');

            // Click another key and modify it
            undoService.rememberThisHistory('key_1', myTranslations);
            myTranslations.root.nodes[1].key = 'key_1_mod';

            // Click another key - this will store the new data
            undoService.rememberThisHistory('key_2', myTranslations);

            expect(undoService.hasHistory()).toBe(true, 'hasHistory');
            expect(undoService.hasFuture()).toBe(false, 'hasFuture (2)');

            // UNDO - from history
            myTranslations = undoService.undo(myTranslations);

            // console.log('Value returned: ' + myTranslations.root.nodes[1]['key']);

            // Should have recovered
            expect(myTranslations.root.nodes[1]['key']).toBe('key_1', 'UNDO key_1 (1)');

            // Click another key and modify it
            undoService.rememberThisHistory('key_1', myTranslations);
            myTranslations.root.nodes[1].key = 'key_1_mod2';

            // UNDO - from pending currentStatus
            myTranslations = undoService.undo(myTranslations);

            // console.log(i + ' >>> Value returned: ' + myTranslations.root.nodes[1]['key']);

            // Should have recovered
            expect(myTranslations.root.nodes[1]['key']).toBe('key_1', 'UNDO key_1 (2)');
        }
        expect(undoService.hasHistory()).toBe(false, 'hasHistory');
        expect(undoService.hasFuture()).toBe(true, 'hasFuture (3)');
    });

    it('Undo/Redo 2 keys, 2 cycles', () => {
        let myTranslations = JSON.parse(JSON.stringify(translations));

        // Init and start
        undoService.clearHistory(myTranslations);

        // Click one key and modify it
        undoService.rememberThisHistory('key_1', myTranslations);
        myTranslations.root.nodes[1].key = 'key_1_mod';

        // Click another key - this will store the new data
        undoService.rememberThisHistory('key_2', myTranslations);

        expect(undoService.hasHistory()).toBe(true, 'hasHistory');
        expect(undoService.hasFuture()).toBe(false, 'hasFuture');

        // UNDO - from history
        myTranslations = undoService.undo(myTranslations);
        // console.log('Value returned: ' + myTranslations.root.nodes[1]['key']);

        // Should have recovered
        expect(myTranslations.root.nodes[1]['key']).toBe('key_1', 'UNDO key_1 (1)');
        expect(undoService.hasFuture()).toBe(true, 'hasFuture');

        // REDO
        myTranslations = undoService.redo(myTranslations);
        // console.log('Value returned: ' + myTranslations.root.nodes[1]['key']);

        // Should have recovered the modified value
        expect(myTranslations.root.nodes[1]['key']).toBe('key_1_mod', 'REDO key_1 (1)');
        expect(undoService.hasFuture()).toBe(false, 'hasFuture');

        // UNDO - from history
        myTranslations = undoService.undo(myTranslations);
        // console.log('Value returned: ' + myTranslations.root.nodes[1]['key']);

        // Should have recovered (again)
        expect(myTranslations.root.nodes[1]['key']).toBe('key_1', 'UNDO key_1 (2)');
        expect(undoService.hasFuture()).toBe(true, 'hasFuture');

        // Now, test deep UNDO/REDO

        // key 0 and modify it
        undoService.rememberThisHistory('key_0', myTranslations);
        myTranslations.root.nodes[0].key = 'key_0_deep';

        // key 1 and modify it
        undoService.rememberThisHistory('key_1', myTranslations);
        myTranslations.root.nodes[1].key = 'key_1_deep';

        // key 0 language and modify it
        undoService.rememberThisHistory('key_0_value', myTranslations);
        myTranslations.root.nodes[0].nodes[0].nodes[0].value = 'value_0_deep';

        // key 0 language and modify it
        undoService.rememberThisHistory('key_1_value', myTranslations);
        myTranslations.root.nodes[1].nodes[1].nodes[1].value = 'value_1_deep';

        // undoService.rememberThisHistory('key_2', myTranslations);

        for (let i = 0; i < 2; i++) {
            // console.log("myTranslations.root.nodes[0].key", myTranslations.root.nodes[0].key);
            // console.log("myTranslations.root.nodes[1].key", myTranslations.root.nodes[1].key);
            // console.log("myTranslations.root.nodes[0].nodes[0].nodes[0].value", myTranslations.root.nodes[0].nodes[0].nodes[0].value);
            // console.log("myTranslations.root.nodes[1].nodes[1].nodes[1].value", myTranslations.root.nodes[1].nodes[1].nodes[1].value);

            myTranslations = undoService.undo(myTranslations);
            expect(myTranslations.root.nodes[1].nodes[1].nodes[1].value).toBe('value_en_1_1', 'UNDO value_1_deep');
            expect(undoService.hasHistory()).toBe(true, 'hasHistory');
            expect(undoService.hasFuture()).toBe(true, 'hasFuture');
            myTranslations = undoService.undo(myTranslations);
            expect(myTranslations.root.nodes[0].nodes[0].nodes[0].value).toBe('value_ca_0_0', 'UNDO value_0_deep');
            myTranslations = undoService.undo(myTranslations);
            expect(myTranslations.root.nodes[1].key).toBe('key_1', 'UNDO key_1');
            myTranslations = undoService.undo(myTranslations);
            expect(myTranslations.root.nodes[0].key).toBe('key_0', 'UNDO key_0');

            // console.log("myTranslations.root.nodes[0].key", myTranslations.root.nodes[0].key);
            // console.log("myTranslations.root.nodes[1].key", myTranslations.root.nodes[1].key);
            // console.log("myTranslations.root.nodes[0].nodes[0].nodes[0].value", myTranslations.root.nodes[0].nodes[0].nodes[0].value);
            // console.log("myTranslations.root.nodes[1].nodes[1].nodes[1].value", myTranslations.root.nodes[1].nodes[1].nodes[1].value);

            expect(undoService.hasHistory()).toBe(false, 'hasHistory');
            expect(undoService.hasFuture()).toBe(true, 'hasFuture');

            myTranslations = undoService.redo(myTranslations);
            expect(myTranslations.root.nodes[0].key).toBe('key_0_deep', 'REDO key_0_deep');
            myTranslations = undoService.redo(myTranslations);
            expect(myTranslations.root.nodes[1].key).toBe('key_1_deep', 'REDO key_1_deep');
            myTranslations = undoService.redo(myTranslations);
            expect(myTranslations.root.nodes[0].nodes[0].nodes[0].value).toBe('value_0_deep', 'REDO value_0_deep');
            expect(undoService.hasHistory()).toBe(true, 'hasHistory');
            expect(undoService.hasFuture()).toBe(true, 'hasFuture');
            myTranslations = undoService.redo(myTranslations);
            expect(myTranslations.root.nodes[1].nodes[1].nodes[1].value).toBe('value_1_deep', 'REDO value_1_deep');

            // console.log("myTranslations.root.nodes[0].key", myTranslations.root.nodes[0].key);
            // console.log("myTranslations.root.nodes[1].key", myTranslations.root.nodes[1].key);
            // console.log("myTranslations.root.nodes[0].nodes[0].nodes[0].value", myTranslations.root.nodes[0].nodes[0].nodes[0].value);
            // console.log("myTranslations.root.nodes[1].nodes[1].nodes[1].value", myTranslations.root.nodes[1].nodes[1].nodes[1].value);

            expect(undoService.hasHistory()).toBe(true, 'hasHistory');
            expect(undoService.hasFuture()).toBe(false, 'hasFuture');
        }
    });

    it('AddRoot test', () => {
        let myTranslations = JSON.parse(JSON.stringify(translations));

        // Init and start
        langTools.doSetTranslations(myTranslations);
        undoService.clearHistory(myTranslations);

        expect(myTranslations.root.nodes.length).toBe(2, 'Init');

        // Add default root node
        myTranslations = langTools.doAddRootNode();

        expect(myTranslations.root.nodes.length).toBe(3, 'doAddRootNode (1)');
        expect(undoService.hasHistory()).toBe(true, 'hasHistory');
        expect(undoService.hasFuture()).toBe(false, 'hasFuture');

        // Add default root node
        myTranslations = langTools.doAddRootNode();

        expect(myTranslations.root.nodes.length).toBe(4, 'doAddRootNode (2)');

        // Undo
        myTranslations = undoService.undo(myTranslations);
        expect(myTranslations.root.nodes.length).toBe(3, 'UNDO doAddRootNode (2)');
        expect(undoService.hasHistory()).toBe(true, 'hasHistory');
        expect(undoService.hasFuture()).toBe(true, 'hasFuture');

        // Undo
        myTranslations = undoService.undo(myTranslations);
        expect(myTranslations.root.nodes.length).toBe(2, 'UNDO doAddRootNode (1)');
        expect(undoService.hasHistory()).toBe(false, 'hasHistory');
        expect(undoService.hasFuture()).toBe(true, 'hasFuture');
    });

});
