import { Component } from '@angular/core';
import { Ticker } from "../../components/ticker/ticker";
import { Nav } from "../../components/app/nav/nav";
import { RouterOutlet } from "@angular/router";
import { Footnote } from "../../components/footnote/footnote";

@Component({
  selector: 'app-app',
  imports: [Ticker, Nav, RouterOutlet, Footnote],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
