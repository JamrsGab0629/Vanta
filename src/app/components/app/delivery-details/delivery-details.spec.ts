import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryDetails } from './delivery-details';

describe('DeliveryDetails', () => {
  let component: DeliveryDetails;
  let fixture: ComponentFixture<DeliveryDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
