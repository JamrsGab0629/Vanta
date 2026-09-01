import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderedConfirmed } from './ordered-confirmed';

describe('OrderedConfirmed', () => {
  let component: OrderedConfirmed;
  let fixture: ComponentFixture<OrderedConfirmed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderedConfirmed],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderedConfirmed);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
