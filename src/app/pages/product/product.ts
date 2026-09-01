import { Component, inject, output, signal } from '@angular/core';
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
  benchTestStatus: 'Pending' | 'Passed' | 'Failed';
  imageUrl: string | null;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule, Photo],
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
    benchTestStatus: 'Pending',
    imageUrl: null,
  });

  categories = ['GPU', 'CPU', 'SSD', "RAM", "MOTHERBOARD"];
  benchStatuses = ['Pending', 'Passed', 'Failed'];

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

  async onSubmit(): Promise<void> {
    try {
      let finalImageUrl: string | null = null;

      // 1. Upload raw image file if selected
      const file = this.selectedFile();
      if (file) {
        const uploadRes = await this.productService.uploadImage(file);
        finalImageUrl = uploadRes.url;
      }

      const form = this.formData();

      // 2. Map form controls to Sequelize PublishProductInput format
      const payload: PublishProductInput = {
        name: form.name,
        sku: form.sku,
        category: form.category,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
        description: form.desc,
        specs: form.spec ? { key_spec: form.spec } : null,
        bench_stats: { status: form.benchTestStatus },
        image_url: finalImageUrl,
        is_active: form.benchTestStatus === 'Passed', // Automatically activate if passed
      };

      // 3. Persist product to backend database
      const createdProduct = await this.productService.createProduct(payload);

      // 4. Emit database item and reset local form state
      this.productAdded.emit(createdProduct);
      this.resetForm();
    } catch (error) {
      console.error('Failed to publish product:', error);
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
      benchTestStatus: 'Pending',
      imageUrl: null,
    });
  }
}