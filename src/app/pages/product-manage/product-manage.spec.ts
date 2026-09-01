import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProductManage } from './product-manage';

describe('ProductManage', () => {
  let component: ProductManage;
  let fixture: ComponentFixture<ProductManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductManage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductManage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
