import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-product',
  imports: [],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product {
  imageFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);
  imageError = signal<string>('');

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.imageError.set('Please select an image file.');
      input.value = '';
      return;
    }

    this.imageError.set('');
    this.setImage(file);
    input.value = ''; // allow re-selecting the same file later
  }

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.imageError.set('Please drop an image file.');
      return;
    }

    this.imageError.set('');
    this.setImage(file);
  }

  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  removeImage(): void {
    const url = this.imagePreviewUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.imageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.imageError.set('');
  }

  private setImage(file: File): void {
    const previousUrl = this.imagePreviewUrl();
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }
    this.imageFile.set(file);
    this.imagePreviewUrl.set(URL.createObjectURL(file));
  }
}
