import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryItem } from './history-item';

describe('HistoryItem', () => {
  let component: HistoryItem;
  let fixture: ComponentFixture<HistoryItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryItem],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
