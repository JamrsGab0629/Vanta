import { Component } from '@angular/core';
import { Nav } from "../../components/admin/nav/nav";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-admin',
  imports: [Nav, RouterOutlet],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {}
