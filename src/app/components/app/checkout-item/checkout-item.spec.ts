import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutItem } from './checkout-item';

describe('CheckoutItem', () => {
  let component: CheckoutItem;
  let fixture: ComponentFixture<CheckoutItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutItem],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
