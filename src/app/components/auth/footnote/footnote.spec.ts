import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Footnote } from './footnote';

describe('Footnote', () => {
  let component: Footnote;
  let fixture: ComponentFixture<Footnote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footnote],
    }).compileComponents();

    fixture = TestBed.createComponent(Footnote);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
