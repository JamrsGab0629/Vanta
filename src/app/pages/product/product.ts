import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Photo } from "../../components/icons/photo/photo";
import { ProductService } from "../../helpers/product/product.service";
import { PublishProductInput, ProductItem } from "../../helpers/product/product.interface";

export interface LocalFormState {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock_quantity: number;
  spec: string;
  desc: string;
  imageUrl: string | null;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, Photo],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product {
  private productService = inject(ProductService);

  // Emits the finalized database record back to parent
  productAdded = output<ProductItem>();

  // Tracks raw file for binary upload
  selectedFile = signal<File | null>(null);

  // Component form state
  formData = signal<LocalFormState>({
    name: '',
    sku: '',
    category: 'GPU',
    price: 0,
    stock_quantity: 0,
    spec: '',
    desc: '',
    imageUrl: null,
  });

  categories = ['GPU', 'CPU', 'SSD', "RAM", "MOTHERBOARD"];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.formData.update((data) => ({
          ...data,
          imageUrl: reader.result as string, // Base64 preview
        }));
      };

      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.formData.update((data) => ({ ...data, imageUrl: null }));
  }

  showConfirmModal = signal<boolean>(false);
  isPublishing = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  onInitiateSubmit(): void {
    const form = this.formData();
    if (!form.name.trim() || !form.sku.trim() || form.price <= 0) {
      this.errorMessage.set('Please fill out all required fields (Name, SKU, and a valid Price).');
      this.successMessage.set(null);
      return;
    }
    this.errorMessage.set(null);
    this.showConfirmModal.set(true);
  }

  cancelSubmit(): void {
    this.showConfirmModal.set(false);
  }

  async confirmPublish(): Promise<void> {
    this.isPublishing.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      let finalImageUrl: string | null = null;

      // 1. Upload raw image file if selected
      const file = this.selectedFile();
      if (file) {
        const uploadRes = await this.productService.uploadImage(file);
        finalImageUrl = uploadRes.imageUrl || uploadRes.url || null;
      }

      const form = this.formData();

      // 2. Map form controls to Sequelize PublishProductInput format
      const payload: PublishProductInput = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
        description: form.desc || null,
        specs: form.spec ? { key_spec: form.spec } : null,
        image_url: finalImageUrl,
      };

      // 3. Persist product to backend database
      const createdProduct = await this.productService.createProduct(payload);

      // 4. Emit database item and notify
      this.productAdded.emit(createdProduct);
      this.successMessage.set(`Product "${form.name}" has been published successfully.`);
      this.showConfirmModal.set(false);
      this.resetForm();
    } catch (error: any) {
      console.error('Failed to publish product:', error);
      this.errorMessage.set(error?.message || 'Failed to publish product. Please check your credentials or network.');
      this.showConfirmModal.set(false);
    } finally {
      this.isPublishing.set(false);
    }
  }

  resetForm(): void {
    this.selectedFile.set(null);
    this.formData.set({
      name: '',
      sku: '',
      category: 'GPU',
      price: 0,
      stock_quantity: 0,
      spec: '',
      desc: '',
      imageUrl: null,
    });
  }
}