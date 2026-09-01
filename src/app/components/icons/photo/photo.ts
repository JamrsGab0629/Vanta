import { Component, input } from '@angular/core';

export type PhotoIconType = 'image' | 'camera' | 'image-add' | 'gallery';

@Component({
  selector: 'app-photo',
  standalone: true,
  imports: [],
  templateUrl: './photo.html',
  styleUrl: './photo.css',
})
export class Photo {
  // Input for specifying which SVG picture icon variant to display
  icon = input<PhotoIconType>('image');

  // Input for icon dimensions
  size = input<number | string>(24);
  color = input<string>('currentColor');
  strokeWidth = input<number>(2);
}