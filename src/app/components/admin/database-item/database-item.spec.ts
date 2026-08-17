import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseItem } from './database-item';

describe('DatabaseItem', () => {
  let component: DatabaseItem;
  let fixture: ComponentFixture<DatabaseItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatabaseItem],
    }).compileComponents();

    fixture = TestBed.createComponent(DatabaseItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
