/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LegalTosComponent } from './legal-tos.component';

describe('LegalTosComponent', () => {
  let component: LegalTosComponent;
  let fixture: ComponentFixture<LegalTosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LegalTosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalTosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
