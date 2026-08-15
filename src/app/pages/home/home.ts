import { Component } from '@angular/core';
import { ProductGrid } from "../../components/product-grid/product-grid";

@Component({
  selector: 'app-home',
  imports: [ProductGrid],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
