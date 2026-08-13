import { Component } from '@angular/core';
import { Nav } from "../../components/nav/nav";
import { ProductGrid } from "../../components/product-grid/product-grid";
import { Category } from "../../components/category/category";
import { Footer } from '../../components/footer/footer';
import { Ticker } from "../../components/ticker/ticker";

@Component({
  selector: 'app-main',
  imports: [Nav, ProductGrid, Category, Footer, Ticker],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {}
