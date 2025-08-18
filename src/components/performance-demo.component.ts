import { Component, OnInit, ChangeDetectionStrategy, computed, signal, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ListItem {
  id: number;
  name: string;
  value: number;
  category: string;
  isActive: boolean;
  lastUpdated: Date;
}

interface PerformanceMetrics {
  renderTime: number;
  itemCount: number;
  filteredCount: number;
  lastUpdate: Date;
}

@Component({
  selector: 'app-performance-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="performance-demo">
      <h2>⚡ Performance Demo: Optimization Techniques</h2>
      
      <div class="metrics-section">
        <h3>Performance Metrics</h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">{{ performanceMetrics().renderTime }}ms</div>
            <div class="metric-label">Last Render Time</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ performanceMetrics().itemCount }}</div>
            <div class="metric-label">Total Items</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ performanceMetrics().filteredCount }}</div>
            <div class="metric-label">Filtered Items</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ performanceMetrics().lastUpdate | date:'HH:mm:ss.SSS' }}</div>
            <div class="metric-label">Last Update</div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Large List with TrackBy & Memoization</h3>
        
        <div class="controls">
          <div class="control-group">
            <label>Filter by name:</label>
            <input 
              [(ngModel)]="filterText" 
              placeholder="Type to filter..."
              class="filter-input">
          </div>
          
          <div class="control-group">
            <label>Category:</label>
            <select [(ngModel)]="selectedCategory" class="category-select">
              <option value="">All Categories</option>
              <option *ngFor="let category of categories()" [value]="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div class="control-group">
            <label>Show active only:</label>
            <input 
              type="checkbox" 
              [(ngModel)]="showActiveOnly"
              class="checkbox">
          </div>
        </div>

        <div class="list-actions">
          <button (click)="addItems(1000)" class="btn-primary">
            Add 1,000 Items
          </button>
          <button (click)="updateRandomItems()" class="btn-secondary">
            Update Random Items
          </button>
          <button (click)="clearItems()" class="btn-danger">
            Clear All
          </button>
        </div>

        <div class="list-container">
          <div class="list-header">
            <span>Showing {{ filteredItems().length }} of {{ items().length }} items</span>
            <small>(Using trackBy for efficient updates)</small>
          </div>
          
          <div class="virtual-list">
            <div 
              *ngFor="let item of visibleItems(); trackBy: trackByItemId; let i = index" 
              class="list-item"
              [class.active]="item.isActive"
              [class.even]="i % 2 === 0">
              
              <div class="item-header">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-category">{{ item.category }}</span>
              </div>
              
              <div class="item-details">
                <span class="item-value">\${{ item.value | number:'1.2-2' }}</span>
                <span class="item-status" [class.active]="item.isActive">
                  {{ item.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
              
              <div class="item-actions">
                <button 
                  (click)="toggleItemStatus(item.id)"
                  class="btn-small">
                  {{ item.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button 
                  (click)="updateItemValue(item.id)"
                  class="btn-small secondary">
                  Update Value
                </button>
              </div>
            </div>
          </div>

          <div class="pagination" *ngIf="totalPages() > 1">
            <button 
              (click)="goToPage(currentPage() - 1)"
              [disabled]="currentPage() === 1"
              class="btn-small">
              Previous
            </button>
            
            <span class="page-info">
              Page {{ currentPage() }} of {{ totalPages() }}
            </span>
            
            <button 
              (click)="goToPage(currentPage() + 1)"
              [disabled]="currentPage() === totalPages()"
              class="btn-small">
              Next
            </button>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Expensive Computation with Memoization</h3>
        
        <div class="computation-demo">
          <div class="input-group">
            <label>Number to process:</label>
            <input 
              type="number" 
              [(ngModel)]="computationInput"
              min="1"
              max="50"
              class="number-input">
          </div>
          
          <div class="computation-results">
            <div class="result-card">
              <h4>Fibonacci (Memoized)</h4>
              <div class="result-value">{{ fibonacciResult() }}</div>
              <small>Computed using memoized signals</small>
            </div>
            
            <div class="result-card">
              <h4>Prime Factors</h4>
              <div class="result-value">{{ primeFactors().join(', ') }}</div>
              <small>Cached until input changes</small>
            </div>
          </div>
        </div>
      </div>

      <div class="performance-info">
        <h4>🔍 Performance Techniques Demonstrated:</h4>
        <ul>
          <li><strong>OnPush Change Detection:</strong> Reduces unnecessary checks</li>
          <li><strong>TrackBy Functions:</strong> Efficient list updates by tracking item identity</li>
          <li><strong>Computed Signals:</strong> Memoized derived state that only recalculates when dependencies change</li>
          <li><strong>Virtual Scrolling:</strong> Only render visible items (pagination simulation)</li>
          <li><strong>Lazy Computation:</strong> Expensive operations cached until inputs change</li>
          <li><strong>Immutable Updates:</strong> Efficient change detection with immutable patterns</li>
          <li><strong>Debounced Filtering:</strong> Reduce computation frequency for search</li>
        </ul>
        
        <div class="performance-tips">
          <h4>💡 Additional Performance Tips:</h4>
          <ul>
            <li>Use <code>async</code> pipe for observables to handle subscriptions</li>
            <li>Implement <code>OnDestroy</code> to clean up subscriptions</li>
            <li>Use <code>ChangeDetectionStrategy.OnPush</code> for pure components</li>
            <li>Preconnect to external APIs in index.html</li>
            <li>Use Angular DevTools to profile component performance</li>
            <li>Defer loading of non-critical components</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .performance-demo {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .metrics-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      color: #007bff;
      margin-bottom: 8px;
    }

    .metric-label {
      font-size: 0.9rem;
      color: #212529;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .demo-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .controls {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: end;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .control-group label {
      font-weight: 500;
      font-size: 0.9rem;
      color: #000;
    }

    .filter-input, .category-select, .number-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .checkbox {
      width: 18px;
      height: 18px;
    }

    .list-actions {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .list-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .list-header {
      padding: 15px 20px;
      background: #e9ecef;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
      color: #000;
    }

    .virtual-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .list-item {
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      transition: background-color 0.2s;
    }

    .list-item:hover {
      background: #f8f9fa;
    }

    .list-item.even {
      background: #fafafa;
    }

    .list-item.even:hover {
      background: #f0f0f0;
    }

    .list-item.active {
      border-left: 4px solid #28a745;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .item-name {
      font-weight: 600;
      color: #000;
    }

    .item-category {
      background: #007bff;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .item-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .item-value {
      font-weight: 500;
      color: #28a745;
    }

    .item-status {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      background: #dc3545;
      color: white;
    }

    .item-status.active {
      background: #28a745;
    }

    .item-actions {
      display: flex;
      gap: 8px;
    }

    .pagination {
      padding: 15px 20px;
      background: #f8f9fa;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
    }

    .page-info {
      font-weight: 500;
      color: #000;
    }

    .computation-demo {
      background: white;
      padding: 20px;
      border-radius: 8px;
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .computation-results {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .result-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border: 2px solid #e9ecef;
    }

    .result-card h4 {
      margin: 0 0 10px 0;
      color: #000;
    }

    .result-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #007bff;
      margin-bottom: 8px;
      word-break: break-all;
    }

    .performance-info {
      background: #fff3cd;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #ffc107;
    }

    .performance-tips {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(0,0,0,0.1);
    }

    .performance-info ul {
      margin: 10px 0;
      padding-left: 20px;
      color: #000;
    }

    .performance-info code {
      background: rgba(0,0,0,0.1);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      color: #000;
    }

    .btn-primary, .btn-secondary, .btn-danger, .btn-small {
      padding: 8px 16px;
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

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .btn-small {
      padding: 4px 8px;
      font-size: 12px;
      background: #007bff;
      color: white;
    }

    .btn-small:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-small.secondary {
      background: #6c757d;
    }

    .btn-small.secondary:hover {
      background: #545b62;
    }

    .btn-small:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .controls {
        flex-direction: column;
        align-items: stretch;
      }

      .list-actions {
        flex-direction: column;
      }

      .item-header, .item-details {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class PerformanceDemoComponent implements OnInit {
  // Signals for reactive state management
  items = signal<ListItem[]>([]);
  private _filterText = signal('');
  private _selectedCategory = signal('');
  private _showActiveOnly = signal(false);
  currentPage = signal(1);
  private _computationInput = signal(10);
  
  // Computed signals for memoized derived state
  categories = computed(() => {
    const allCategories = this.items().map(item => item.category);
    return [...new Set(allCategories)].sort();
  });

  // Combined computed signal that returns both filtered items and performance metrics
  private filteredItemsWithMetrics = computed(() => {
    const startTime = performance.now();
    
    let filtered = this.items();
    
    // Filter by text
    const filterText = this._filterText().toLowerCase();
    if (filterText) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(filterText)
      );
    }
    
    // Filter by category
    const selectedCategory = this._selectedCategory();
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by active status
    if (this._showActiveOnly()) {
      filtered = filtered.filter(item => item.isActive);
    }
    
    const endTime = performance.now();
    const renderTime = Math.round((endTime - startTime) * 100) / 100;
    
    return {
      items: filtered,
      metrics: {
        renderTime,
        itemCount: this.items().length,
        filteredCount: filtered.length,
        lastUpdate: new Date()
      }
    };
  });

  // Extract filtered items from the combined computed
  filteredItems = computed(() => this.filteredItemsWithMetrics().items);

  // Extract performance metrics from the combined computed
  performanceMetrics = computed(() => this.filteredItemsWithMetrics().metrics);

  itemsPerPage = 50;
  
  totalPages = computed(() => 
    Math.ceil(this.filteredItems().length / this.itemsPerPage)
  );

  visibleItems = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredItems().slice(startIndex, endIndex);
  });

  // Expensive computations with memoization
  fibonacciResult = computed(() => this.fibonacci(this._computationInput()));
  
  primeFactors = computed(() => this.getPrimeFactors(this._computationInput()));

  // Memoization cache for fibonacci
  private fibCache = new Map<number, number>();

  ngOnInit() {
    this.generateInitialData();
    
    // Set up property bindings for template inputs
    setTimeout(() => {
      const filterInput = document.querySelector('.filter-input') as HTMLInputElement;
      const categorySelect = document.querySelector('.category-select') as HTMLSelectElement;
      const activeCheckbox = document.querySelector('.checkbox') as HTMLInputElement;
      const numberInput = document.querySelector('.number-input') as HTMLInputElement;

      if (filterInput) {
        filterInput.addEventListener('input', (e) => {
          this._filterText.set((e.target as HTMLInputElement).value);
        });
      }

      if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
          this._selectedCategory.set((e.target as HTMLSelectElement).value);
        });
      }

      if (activeCheckbox) {
        activeCheckbox.addEventListener('change', (e) => {
          this._showActiveOnly.set((e.target as HTMLInputElement).checked);
        });
      }

      if (numberInput) {
        numberInput.addEventListener('input', (e) => {
          const value = parseInt((e.target as HTMLInputElement).value) || 1;
          this._computationInput.set(Math.max(1, Math.min(50, value)));
        });
      }
    }, 100);
  }

  // TrackBy function for efficient list updates
  trackByItemId: TrackByFunction<ListItem> = (index: number, item: ListItem) => item.id;

  generateInitialData() {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys'];
    const adjectives = ['Premium', 'Deluxe', 'Standard', 'Basic', 'Pro', 'Elite'];
    const nouns = ['Widget', 'Gadget', 'Device', 'Tool', 'Item', 'Product'];
    
    const items: ListItem[] = [];
    
    for (let i = 1; i <= 500; i++) {
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      items.push({
        id: i,
        name: `${adjective} ${noun} ${i}`,
        value: Math.random() * 1000 + 10,
        category,
        isActive: Math.random() > 0.3,
        lastUpdated: new Date()
      });
    }
    
    this.items.set(items);
  }

  addItems(count: number) {
    const currentItems = this.items();
    const newItems: ListItem[] = [];
    const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys'];
    const adjectives = ['Premium', 'Deluxe', 'Standard', 'Basic', 'Pro', 'Elite'];
    const nouns = ['Widget', 'Gadget', 'Device', 'Tool', 'Item', 'Product'];
    
    for (let i = 0; i < count; i++) {
      const id = currentItems.length + i + 1;
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      newItems.push({
        id,
        name: `${adjective} ${noun} ${id}`,
        value: Math.random() * 1000 + 10,
        category,
        isActive: Math.random() > 0.3,
        lastUpdated: new Date()
      });
    }
    
    this.items.set([...currentItems, ...newItems]);
  }

  updateRandomItems() {
    const currentItems = this.items();
    const itemsToUpdate = Math.min(100, currentItems.length);
    
    const updatedItems = currentItems.map(item => {
      if (Math.random() < itemsToUpdate / currentItems.length) {
        return {
          ...item,
          value: Math.random() * 1000 + 10,
          lastUpdated: new Date()
        };
      }
      return item;
    });
    
    this.items.set(updatedItems);
  }

  clearItems() {
    this.items.set([]);
    this.currentPage.set(1);
  }

  toggleItemStatus(id: number) {
    const currentItems = this.items();
    const updatedItems = currentItems.map(item =>
      item.id === id 
        ? { ...item, isActive: !item.isActive, lastUpdated: new Date() }
        : item
    );
    this.items.set(updatedItems);
  }

  updateItemValue(id: number) {
    const currentItems = this.items();
    const updatedItems = currentItems.map(item =>
      item.id === id 
        ? { ...item, value: Math.random() * 1000 + 10, lastUpdated: new Date() }
        : item
    );
    this.items.set(updatedItems);
  }

  goToPage(page: number) {
    const totalPages = this.totalPages();
    if (page >= 1 && page <= totalPages) {
      this.currentPage.set(page);
    }
  }

  // Memoized fibonacci calculation
  private fibonacci(n: number): number {
    if (n <= 1) return n;
    
    if (this.fibCache.has(n)) {
      return this.fibCache.get(n)!;
    }
    
    const result = this.fibonacci(n - 1) + this.fibonacci(n - 2);
    this.fibCache.set(n, result);
    return result;
  }

  // Prime factorization
  private getPrimeFactors(n: number): number[] {
    const factors: number[] = [];
    let divisor = 2;
    
    while (n >= 2) {
      if (n % divisor === 0) {
        factors.push(divisor);
        n = n / divisor;
      } else {
        divisor++;
      }
    }
    
    return factors;
  }

  // Template property bindings
  get filterText() { return this._filterText().toString(); }
  set filterText(value: string) { this._filterText.set(value); }

  get selectedCategory() { return this._selectedCategory().toString(); }
  set selectedCategory(value: string) { this._selectedCategory.set(value); }

  get showActiveOnly() { return this._showActiveOnly(); }
  set showActiveOnly(value: boolean) { this._showActiveOnly.set(value); }

  get computationInput() { return this._computationInput(); }
  set computationInput(value: number) { this._computationInput.set(value); }
}