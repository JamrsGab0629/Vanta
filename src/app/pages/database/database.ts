import { Component } from '@angular/core';
import { Products } from "../../components/admin/products/products";

@Component({
  selector: 'app-database',
  imports: [Products],
  templateUrl: './database.html',
  styleUrl: './database.css',
})
export class Database {}
