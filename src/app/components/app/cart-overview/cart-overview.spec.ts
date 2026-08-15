import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartOverview } from './cart-overview';

describe('CartOverview', () => {
  let component: CartOverview;
  let fixture: ComponentFixture<CartOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartOverview],
    }).compileComponents();

    fixture = TestBed.createComponent(CartOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
