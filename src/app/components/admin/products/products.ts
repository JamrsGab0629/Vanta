import { Component } from '@angular/core';
import { DatabaseItem } from "../database-item/database-item";

@Component({
  selector: 'app-products',
  imports: [DatabaseItem],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {}
