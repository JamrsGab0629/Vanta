import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Products } from '../../components/admin/products/products';

@Component({
  selector: 'app-database',
  imports: [Products, RouterLink],
  templateUrl: './database.html',
  styleUrl: './database.css',
})
export class Database {}
