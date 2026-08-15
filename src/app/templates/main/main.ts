import { Component } from '@angular/core';
import { Nav } from "../../components/landing/nav/nav";
import { ProductGrid } from "../../components/product-grid/product-grid";
import { Category } from "../../components/landing/category/category";
import { Footer } from '../../components/landing/footer/footer';
import { Ticker } from "../../components/ticker/ticker";

@Component({
  selector: 'app-main',
  imports: [Nav, ProductGrid, Category, Footer, Ticker],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {}
