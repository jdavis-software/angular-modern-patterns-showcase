import { Component, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Zap } from 'lucide-angular';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-signals-demo',
  standalone: true,
  template: `
    <div class="signals-demo">
      <h2><lucide-icon [img]="ZapIcon" size="24"></lucide-icon> Signals Demo: Fine-grained Local Reactivity</h2>
      
      <div class="cart-section">
        <h3>Shopping Cart</h3>
        
        <div class="add-item">
          <input 
            [(ngModel)]="newItemName" 
            placeholder="Item name"
            #nameInput>
          <input 
            type="number" 
            [(ngModel)]="newItemPrice" 
            placeholder="Price"
            min="0"
            step="0.01">
          <button 
            (click)="addItem()"
            [disabled]="!newItemName.trim()"
            class="btn-primary">
            Add Item
          </button>
        </div>

        <div class="cart-items" *ngIf="cartItems().length > 0">
          <div 
            *ngFor="let item of cartItems(); trackBy: trackByItemId" 
            class="cart-item">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-price">\${{ item.price.toFixed(2) }}</span>
            <div class="quantity-controls">
              <button 
                (click)="updateQuantity(item.id, item.quantity - 1)"
                [disabled]="item.quantity <= 1"
                class="btn-secondary">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button 
                (click)="updateQuantity(item.id, item.quantity + 1)"
                class="btn-secondary">+</button>
            </div>
            <button 
              (click)="removeItem(item.id)"
              class="btn-danger">Remove</button>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <strong>Items: {{ totalItems() }}</strong>
          </div>
          <div class="summary-row">
            <strong>Total: \${{ totalPrice().toFixed(2) }}</strong>
          </div>
          <div class="summary-row" *ngIf="discount() > 0">
            <span class="discount">Discount (10% for 5+ items): -\${{ discount().toFixed(2) }}</span>
          </div>
          <div class="summary-row final-total">
            <strong>Final Total: \${{ finalTotal().toFixed(2) }}</strong>
          </div>
        </div>
      </div>

      <div class="signals-info">
        <h4>🔍 What's happening with Signals:</h4>
        <ul>
          <li><code>cartItems</code> - WritableSignal managing cart state</li>
          <li><code>totalItems</code> - Computed signal (auto-updates when cart changes)</li>
          <li><code>totalPrice</code> - Computed signal with price calculation</li>
          <li><code>discount</code> - Computed signal with conditional logic</li>
          <li><code>finalTotal</code> - Computed signal depending on other computeds</li>
          <li>Effect logs changes to console (check DevTools!)</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .signals-demo {
      padding: 20px;
      width: 100%;
    }

    .cart-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .add-item {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .add-item input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      flex: 1;
      min-width: 120px;
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 10px;
      background: white;
      border-radius: 4px;
      margin-bottom: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .item-name {
      flex: 1;
      font-weight: 500;
    }

    .item-price {
      min-width: 60px;
      text-align: right;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .quantity {
      min-width: 30px;
      text-align: center;
      font-weight: bold;
    }

    .cart-summary {
      background: white;
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .final-total {
      border-top: 2px solid #007bff;
      padding-top: 8px;
      font-size: 1.1em;
    }

    .discount {
      color: #28a745;
    }

    .signals-info {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .signals-info ul {
      margin: 10px 0;
      padding-left: 20px;
      color: #000;
    }

    .signals-info code {
      background: rgba(0,0,0,0.1);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      color: #000;
    }

    .btn-primary, .btn-secondary, .btn-danger {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      min-width: 30px;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 600px) {
      .cart-item {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }

      .add-item {
        flex-direction: column;
      }
    }
  `]
})
export class SignalsDemoComponent {
  ZapIcon = Zap;

  // Signals for fine-grained local reactivity
  cartItems = signal<CartItem[]>([]);
  newItemName = '';
  newItemPrice = 0;

  // Computed signals - automatically update when dependencies change
  totalItems = computed(() => 
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  totalPrice = computed(() =>
    this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0)
  );

  discount = computed(() => {
    const total = this.totalPrice();
    const items = this.totalItems();
    return items >= 5 ? total * 0.1 : 0;
  });

  finalTotal = computed(() => this.totalPrice() - this.discount());

  // Effect - runs when signals change (moved to class property for proper injection context)
  private cartEffect = effect(() => {
    console.log('🛒 Cart updated:', {
      items: this.totalItems(),
      total: this.finalTotal(),
      cartContents: this.cartItems()
    });
  });

  addItem() {
    if (!this.newItemName.trim()) return;

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      name: this.newItemName.trim(),
      price: this.newItemPrice || 0,
      quantity: 1
    };

    this.cartItems.update(items => [...items, newItem]);
    this.newItemName = '';
    this.newItemPrice = 0;
  }

  updateQuantity(id: string, newQuantity: number) {
    if (newQuantity < 1) return;

    this.cartItems.update(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  }

  removeItem(id: string) {
    this.cartItems.update(items => items.filter(item => item.id !== id));
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }
}