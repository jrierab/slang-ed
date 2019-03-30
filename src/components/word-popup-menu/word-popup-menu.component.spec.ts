import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordPopupMenuComponent } from './word-popup-menu.component';

describe('WordPopupMenuComponent', () => {
    let component: WordPopupMenuComponent;
    let fixture: ComponentFixture<WordPopupMenuComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [WordPopupMenuComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        })
            .compileComponents();
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
