import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Whycreate } from './whycreate';

describe('Whycreate', () => {
  let component: Whycreate;
  let fixture: ComponentFixture<Whycreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Whycreate],
    }).compileComponents();

    fixture = TestBed.createComponent(Whycreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
