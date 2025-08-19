import { Component, OnInit, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';

interface SSRChecklistItem {
  id: string;
  category: 'hydration' | 'performance' | 'seo' | 'accessibility';
  title: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'checking';
  details: string;
  fix?: string;
}

interface PlatformInfo {
  isBrowser: boolean;
  isServer: boolean;
  userAgent: string;
  timestamp: Date;
  hydrationTime?: number;
}

@Component({
  selector: 'app-ssr-hydration-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ssr-hydration-demo">
      <h2>🚀 SSR & Hydration Demo: Pitfalls Checklist</h2>
      
      <div class="demo-section">
        <h3>Platform Detection & Hydration Status</h3>
        
        <div class="platform-info">
          <div class="info-card" [class.active]="platformInfo().isBrowser">
            <div class="info-icon">🌐</div>
            <div class="info-content">
              <h4>Browser Environment</h4>
              <p>{{ platformInfo().isBrowser ? 'Active' : 'Inactive' }}</p>
              <small *ngIf="platformInfo().isBrowser">Hydration completed in {{ platformInfo().hydrationTime }}ms</small>
            </div>
          </div>

          <div class="info-card" [class.active]="platformInfo().isServer">
            <div class="info-icon">🖥️</div>
            <div class="info-content">
              <h4>Server Environment</h4>
              <p>{{ platformInfo().isServer ? 'Active' : 'Inactive' }}</p>
              <small>{{ platformInfo().isServer ? 'Pre-rendering content' : 'Client-side rendering' }}</small>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">⏱️</div>
            <div class="info-content">
              <h4>Render Timestamp</h4>
              <p>{{ platformInfo().timestamp | date:'HH:mm:ss.SSS' }}</p>
              <small>{{ platformInfo().userAgent || 'No user agent' }}</small>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>SSR/Hydration Checklist</h3>
        
        <div class="checklist-filters">
          <button 
            *ngFor="let category of categories()"
            (click)="setActiveCategory(category)"
            class="filter-btn"
            [class.active]="activeCategory() === category">
            {{ getCategoryIcon(category) }} {{ category | titlecase }}
          </button>
          <button 
            (click)="setActiveCategory('all')"
            class="filter-btn"
            [class.active]="activeCategory() === 'all'">
            📋 All
          </button>
        </div>

        <div class="checklist-summary">
          <div class="summary-card pass">
            <div class="summary-count">{{ getStatusCount('pass') }}</div>
            <div class="summary-label">Passing</div>
          </div>
          <div class="summary-card warning">
            <div class="summary-count">{{ getStatusCount('warning') }}</div>
            <div class="summary-label">Warnings</div>
          </div>
          <div class="summary-card fail">
            <div class="summary-count">{{ getStatusCount('fail') }}</div>
            <div class="summary-label">Failing</div>
          </div>
          <div class="summary-card checking">
            <div class="summary-count">{{ getStatusCount('checking') }}</div>
            <div class="summary-label">Checking</div>
          </div>
        </div>

        <div class="checklist-items">
          <div 
            *ngFor="let item of filteredItems(); trackBy: trackByItemId"
            class="checklist-item"
            [class]="item.status">
            
            <div class="item-header">
              <div class="item-status">
                <span class="status-icon">{{ getStatusIcon(item.status) }}</span>
              </div>
              <div class="item-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
              </div>
              <div class="item-category">
                <span class="category-badge" [class]="item.category">
                  {{ getCategoryIcon(item.category) }} {{ item.category }}
                </span>
              </div>
            </div>

            <div class="item-details">
              <div class="details-content">
                <strong>Details:</strong> {{ item.details }}
              </div>
              <div class="fix-content" *ngIf="item.fix && item.status !== 'pass'">
                <strong>Fix:</strong> {{ item.fix }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Common SSR/Hydration Issues Demo</h3>
        
        <div class="issues-demo">
          <!-- Browser-only content issue -->
          <div class="issue-example">
            <h4>❌ Browser-only Content (Hydration Mismatch)</h4>
            <div class="code-example">
              <pre><code>// ❌ Bad: Will cause hydration mismatch
&lt;div&gt;Current time: {{ getCurrentTime() }}&lt;/div&gt;

// ✅ Good: Use platform detection
&lt;div *ngIf="isBrowser"&gt;Current time: {{ getCurrentTime() }}&lt;/div&gt;</code></pre>
            </div>
            <div class="demo-output">
              <div class="bad-example">
                <strong>Bad:</strong> Current time: {{ getCurrentTime() }}
                <small>(This will cause hydration mismatch!)</small>
              </div>
              <div class="good-example">
                <strong>Good:</strong> 
                <span *ngIf="platformInfo().isBrowser">Current time: {{ getCurrentTime() }}</span>
                <span *ngIf="!platformInfo().isBrowser">Time will load after hydration</span>
              </div>
            </div>
          </div>

          <!-- Local storage issue -->
          <div class="issue-example">
            <h4>❌ localStorage Access (Server Error)</h4>
            <div class="code-example">
              <pre><code>// ❌ Bad: Will crash on server
const theme = localStorage.getItem('theme');

// ✅ Good: Platform-safe access
const theme = this.isBrowser ? localStorage.getItem('theme') : 'light';</code></pre>
            </div>
            <div class="demo-output">
              <div class="storage-demo">
                <strong>Theme from storage:</strong> {{ getThemeFromStorage() }}
                <button (click)="toggleTheme()" *ngIf="platformInfo().isBrowser">
                  Toggle Theme
                </button>
              </div>
            </div>
          </div>

          <!-- DOM manipulation issue -->
          <div class="issue-example">
            <h4>❌ Direct DOM Manipulation (SSR Unsafe)</h4>
            <div class="code-example">
              <pre><code>// ❌ Bad: Direct DOM access
document.getElementById('myElement').style.color = 'red';

// ✅ Good: Use Angular's Renderer2 or ViewChild
this.renderer.setStyle(this.elementRef.nativeElement, 'color', 'red');</code></pre>
            </div>
          </div>
        </div>
      </div>

      <div class="ssr-info">
        <h4>🚀 SSR & Hydration Best Practices:</h4>
        <ul>
          <li><strong>Platform Detection:</strong> Use <code>isPlatformBrowser()</code> for browser-only code</li>
          <li><strong>Consistent Rendering:</strong> Ensure server and client render identical content</li>
          <li><strong>Lazy Hydration:</strong> Defer non-critical component hydration</li>
          <li><strong>State Transfer:</strong> Use <code>TransferState</code> to avoid duplicate API calls</li>
          <li><strong>Meta Tags:</strong> Properly set SEO meta tags on the server</li>
          <li><strong>Error Boundaries:</strong> Handle hydration errors gracefully</li>
          <li><strong>Performance:</strong> Monitor hydration time and optimize critical path</li>
          <li><strong>Testing:</strong> Test both server and client rendering scenarios</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .ssr-hydration-demo {
      padding: 20px;
      width: 100%;
    }

    .demo-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .platform-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .info-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #6c757d;
      transition: all 0.3s;
    }

    .info-card.active {
      border-left-color: #28a745;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .info-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .info-content h4 {
      margin: 0 0 8px 0;
      color: #000;
    }

    .info-content p {
      margin: 0 0 4px 0;
      font-weight: 500;
      color: #000;
    }

    .info-content small {
      color: #000;
    }

    .checklist-filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 8px 16px;
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      background: #e9ecef;
    }

    .filter-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .checklist-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .summary-card {
      background: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .summary-card.pass { border-left: 4px solid #28a745; }
    .summary-card.warning { border-left: 4px solid #ffc107; }
    .summary-card.fail { border-left: 4px solid #dc3545; }
    .summary-card.checking { border-left: 4px solid #007bff; }

    .summary-count {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .summary-card.pass .summary-count { color: #28a745; }
    .summary-card.warning .summary-count { color: #ffc107; }
    .summary-card.fail .summary-count { color: #dc3545; }
    .summary-card.checking .summary-count { color: #007bff; }

    .summary-label {
      font-size: 0.9rem;
      color: #000;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .checklist-items {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .checklist-item {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s;
    }

    .checklist-item:hover {
      transform: translateY(-2px);
    }

    .checklist-item.pass { border-left: 4px solid #28a745; }
    .checklist-item.warning { border-left: 4px solid #ffc107; }
    .checklist-item.fail { border-left: 4px solid #dc3545; }
    .checklist-item.checking { border-left: 4px solid #007bff; }

    .item-header {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 20px;
    }

    .item-status {
      flex-shrink: 0;
    }

    .status-icon {
      font-size: 1.5rem;
    }

    .item-content {
      flex: 1;
    }

    .item-content h4 {
      margin: 0 0 8px 0;
      color: #000;
    }

    .item-content p {
      margin: 0;
      color: #000;
      line-height: 1.5;
    }

    .item-category {
      flex-shrink: 0;
    }

    .category-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .category-badge.hydration { background: #e3f2fd; color: #1976d2; }
    .category-badge.performance { background: #f3e5f5; color: #7b1fa2; }
    .category-badge.seo { background: #e8f5e8; color: #388e3c; }
    .category-badge.accessibility { background: #fff3e0; color: #f57c00; }

    .item-details {
      padding: 0 20px 20px 20px;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    .details-content, .fix-content {
      margin: 10px 0;
      color: #000;
    }

    .fix-content {
      padding: 10px;
      background: #fff3cd;
      border-radius: 4px;
      border-left: 3px solid #ffc107;
    }

    .issues-demo {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .issue-example {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .issue-example h4 {
      margin-top: 0;
      color: #000;
    }

    .code-example {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
      border-left: 4px solid #007bff;
    }

    .code-example pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.4;
      color: #000;
    }

    .demo-output {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    }

    .bad-example {
      color: #dc3545;
      margin-bottom: 10px;
    }

    .good-example {
      color: #28a745;
    }

    .storage-demo {
      color: #000;
    }

    .storage-demo button {
      margin-left: 10px;
      padding: 4px 8px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .ssr-info {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .ssr-info ul {
      margin: 10px 0;
      padding-left: 20px;
      color: #000;
    }

    .ssr-info code {
      background: rgba(0,0,0,0.1);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      color: #000;
    }

    @media (max-width: 768px) {
      .platform-info {
        grid-template-columns: 1fr;
      }

      .item-header {
        flex-direction: column;
        gap: 10px;
      }

      .checklist-filters {
        flex-direction: column;
      }
    }
  `]
})
export class SSRHydrationDemoComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private hydrationStartTime = Date.now();

  // Signal for stable time display to prevent ExpressionChangedAfterItHasBeenCheckedError
  currentTimeDisplay = signal<string>('');

  // Platform detection signals
  platformInfo = signal<PlatformInfo>({
    isBrowser: isPlatformBrowser(this.platformId),
    isServer: isPlatformServer(this.platformId),
    userAgent: '',
    timestamp: new Date()
  });

  // Checklist state
  activeCategory = signal<string>('all');
  
  checklistItems = signal<SSRChecklistItem[]>([
    {
      id: 'platform-detection',
      category: 'hydration',
      title: 'Platform Detection Implementation',
      description: 'Proper use of isPlatformBrowser() for browser-specific code',
      status: 'pass',
      details: 'Using PLATFORM_ID injection and platform detection utilities correctly',
      fix: 'Inject PLATFORM_ID and use isPlatformBrowser() before accessing browser APIs'
    },
    {
      id: 'dom-access',
      category: 'hydration',
      title: 'Safe DOM Access',
      description: 'Avoiding direct DOM manipulation that breaks SSR',
      status: 'pass',
      details: 'Using Angular Renderer2 and ViewChild instead of direct DOM access',
      fix: 'Replace document.getElementById() with ViewChild or Renderer2'
    },
    {
      id: 'local-storage',
      category: 'hydration',
      title: 'localStorage/sessionStorage Access',
      description: 'Platform-safe storage access patterns',
      status: 'pass',
      details: 'Checking platform before accessing browser storage APIs',
      fix: 'Wrap storage access in isPlatformBrowser() checks'
    },
    {
      id: 'hydration-mismatch',
      category: 'hydration',
      title: 'Hydration Mismatch Prevention',
      description: 'Ensuring server and client render identical content',
      status: 'warning',
      details: 'Some dynamic content may cause hydration mismatches',
      fix: 'Use consistent data sources and avoid time-based rendering differences'
    },
    {
      id: 'meta-tags',
      category: 'seo',
      title: 'SEO Meta Tags',
      description: 'Proper meta tag management for search engines',
      status: 'pass',
      details: 'Using Angular Meta service for dynamic meta tag updates',
      fix: 'Implement Meta service for title, description, and OG tags'
    },
    {
      id: 'structured-data',
      category: 'seo',
      title: 'Structured Data (JSON-LD)',
      description: 'Schema.org markup for rich search results',
      status: 'fail',
      details: 'No structured data implementation found',
      fix: 'Add JSON-LD structured data for better search visibility'
    },
    {
      id: 'performance-metrics',
      category: 'performance',
      title: 'Core Web Vitals',
      description: 'LCP, FID, and CLS optimization for SSR',
      status: 'checking',
      details: 'Monitoring performance metrics during hydration',
      fix: 'Optimize critical rendering path and reduce hydration time'
    },
    {
      id: 'lazy-hydration',
      category: 'performance',
      title: 'Lazy Hydration Strategy',
      description: 'Deferring non-critical component hydration',
      status: 'warning',
      details: 'Some components could benefit from lazy hydration',
      fix: 'Implement intersection observer for below-fold components'
    },
    {
      id: 'accessibility-ssr',
      category: 'accessibility',
      title: 'SSR Accessibility',
      description: 'Ensuring accessibility works with server rendering',
      status: 'pass',
      details: 'ARIA attributes and semantic HTML work correctly with SSR',
      fix: 'Test with screen readers on both server and client rendered content'
    },
    {
      id: 'focus-management',
      category: 'accessibility',
      title: 'Focus Management After Hydration',
      description: 'Maintaining focus state through hydration',
      status: 'warning',
      details: 'Focus may be lost during hydration process',
      fix: 'Implement focus restoration after hydration completes'
    }
  ]);

  // Computed values
  categories = computed(() => {
    const items = this.checklistItems();
    return [...new Set(items.map(item => item.category))];
  });

  filteredItems = computed(() => {
    const items = this.checklistItems();
    const category = this.activeCategory();
    
    if (category === 'all') {
      return items;
    }
    
    return items.filter(item => item.category === category);
  });

  // Effect to log platform changes (moved to class property for proper injection context)
  private platformEffect = effect(() => {
    console.log('🚀 Platform info:', this.platformInfo());
  });

  ngOnInit() {
    // Update platform info after hydration
    if (isPlatformBrowser(this.platformId)) {
      const hydrationTime = Date.now() - this.hydrationStartTime;
      
      this.platformInfo.update(info => ({
        ...info,
        userAgent: navigator.userAgent,
        hydrationTime
      }));

      // Simulate some async checks
      setTimeout(() => {
        this.updateChecklistItem('performance-metrics', 'pass', 
          `Hydration completed in ${hydrationTime}ms - Good performance!`);
      }, 1000);

      // Update time display every second to prevent ExpressionChangedAfterItHasBeenCheckedError
      setInterval(() => {
        this.currentTimeDisplay.set(new Date().toLocaleTimeString());
      }, 1000);
      
      // Set initial time
      this.currentTimeDisplay.set(new Date().toLocaleTimeString());
    }
  }

  setActiveCategory(category: string) {
    this.activeCategory.set(category);
  }

  getStatusCount(status: string): number {
    return this.checklistItems().filter(item => item.status === status).length;
  }

  getStatusIcon(status: string): string {
    const icons = {
      pass: '✅',
      fail: '❌',
      warning: '⚠️',
      checking: '🔄'
    };
    return icons[status as keyof typeof icons] || '❓';
  }

  getCategoryIcon(category: string): string {
    const icons = {
      hydration: '💧',
      performance: '⚡',
      seo: '🔍',
      accessibility: '♿'
    };
    return icons[category as keyof typeof icons] || '📋';
  }

  getCurrentTime(): string {
    return this.currentTimeDisplay() || new Date().toLocaleTimeString();
  }

  getThemeFromStorage(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('demo-theme') || 'light';
    }
    return 'light (server default)';
  }

  toggleTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const currentTheme = localStorage.getItem('demo-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('demo-theme', newTheme);
    }
  }

  private updateChecklistItem(id: string, status: SSRChecklistItem['status'], details: string) {
    this.checklistItems.update(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, status, details }
          : item
      )
    );
  }

  trackByItemId(index: number, item: SSRChecklistItem): string {
    return item.id;
  }
}