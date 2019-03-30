import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordPopupMenuComponent } from './word-popup-menu.component';
import { NavParams, PopoverController } from '@ionic/angular';
import { LangToolsService } from 'src/providers/lang-tools-service';
import { LangNodeObject } from 'src/customTypes/langObject.types';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';

describe('WordPopupMenuComponent', () => {
    const ENGLISH_LANGUAGE = 'en';
    const ENGLISH_TRANSLATIONS = require('../../assets/i18n/en.json');

    const word: LangNodeObject = { key: 'none', full_key: 'none', isLeaf: true, level: 0, nodes: [] };

    let navParamsSpy: any, popoverControllerSpy: any, langToolsServiceSpy: any;
    let component: WordPopupMenuComponent;
    let fixture: ComponentFixture<WordPopupMenuComponent>;

    beforeEach(async(() => {

        navParamsSpy = jasmine.createSpyObj('NavParams', { get: word });
        popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
        langToolsServiceSpy = jasmine.createSpyObj('LangToolsService', ['doAddNode', 'doAddId', 'doDelete']);

        TestBed.configureTestingModule({
            declarations: [WordPopupMenuComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: NavParams, useValue: navParamsSpy },
                { provide: PopoverController, useValue: popoverControllerSpy },
                { provide: LangToolsService, useValue: langToolsServiceSpy },
            ],
            imports: [
                TranslateTestingModule
                    .withTranslations(ENGLISH_LANGUAGE, ENGLISH_TRANSLATIONS)
                    .withCompiler(new TranslateMessageFormatCompiler())
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WordPopupMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
