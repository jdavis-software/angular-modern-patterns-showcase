import { Component, OnInit, OnDestroy, computed, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { LucideAngularModule, Route } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, delay, of, catchError, tap } from 'rxjs';

interface RouteData {
  id: string;
  title: string;
  description: string;
  data: any;
  loadTime: number;
  cached: boolean;
}

interface NavigationState {
  currentRoute: string;
  previousRoute: string;
  navigationCount: number;
  totalLoadTime: number;
  averageLoadTime: number;
}

interface PrefetchStrategy {
  id: string;
  name: string;
  description: string;
  active: boolean;
  routes: string[];
}

@Component({
  selector: 'app-router-signals-demo',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="router-signals-demo">
      <h2><lucide-icon [img]="RouteIcon" size="24"></lucide-icon> Router + Signals Demo: Data & Prefetch Strategies</h2>
      
      <div class="demo-section">
        <h3>Navigation State & Performance</h3>
        
        <div class="navigation-dashboard">
          <div class="nav-metrics">
            <div class="metric-card">
              <div class="metric-icon">🧭</div>
              <div class="metric-label">Current Route</div>
              <div class="metric-value">{{ navigationState().currentRoute || '/home' }}</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">📊</div>
              <div class="metric-label">Navigation Count</div>
              <div class="metric-value">{{ navigationState().navigationCount }}</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">⚡</div>
              <div class="metric-label">Avg Load Time</div>
              <div class="metric-value">{{ navigationState().averageLoadTime }}ms</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">💾</div>
              <div class="metric-label">Cache Hit Rate</div>
              <div class="metric-value">{{ cacheHitRate() }}%</div>
            </div>
          </div>

          <div class="route-history">
            <h4>Recent Navigation History</h4>
            <div class="history-list">
              <div 
                *ngFor="let entry of navigationHistory(); let i = index"
                class="history-entry"
                [class.current]="i === 0">
                <span class="history-route">{{ entry.route }}</span>
                <span class="history-time">{{ entry.timestamp | date:'HH:mm:ss' }}</span>
                <span class="history-duration">{{ entry.loadTime }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Route Data with Signals</h3>
        
        <div class="route-simulator">
          <div class="route-buttons">
            <button 
              *ngFor="let route of availableRoutes()"
              (click)="simulateNavigation(route)"
              class="route-btn"
              [class.active]="currentRouteData()?.id === route.id"
              [disabled]="isLoading()">
              {{ route.title }}
            </button>
          </div>

          <div class="route-content" *ngIf="currentRouteData()">
            <div class="content-header">
              <h4>{{ currentRouteData()?.title }}</h4>
              <div class="content-meta">
                <span class="load-time">
                  ⚡ {{ currentRouteData()?.loadTime }}ms
                </span>
                <span class="cache-status" [class.cached]="currentRouteData()?.cached">
                  {{ currentRouteData()?.cached ? '💾 Cached' : '🌐 Fresh' }}
                </span>
              </div>
            </div>
            
            <div class="content-body">
              <p>{{ currentRouteData()?.description }}</p>
              <div class="route-data">
                <h5>Route Data:</h5>
                <pre>{{ currentRouteData()?.data | json }}</pre>
              </div>
            </div>
          </div>

          <div class="loading-indicator" *ngIf="isLoading()">
            <div class="spinner"></div>
            <p>Loading route data...</p>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Prefetch Strategies</h3>
        
        <div class="prefetch-controls">
          <div 
            *ngFor="let strategy of prefetchStrategies()"
            class="strategy-card"
            [class.active]="strategy.active">
            
            <div class="strategy-header">
              <h4>{{ strategy.name }}</h4>
              <button 
                (click)="toggleStrategy(strategy.id)"
                class="toggle-btn"
                [class.active]="strategy.active">
                {{ strategy.active ? 'Disable' : 'Enable' }}
              </button>
            </div>
            
            <p>{{ strategy.description }}</p>
            
            <div class="strategy-routes" *ngIf="strategy.active">
              <strong>Prefetching:</strong>
              <div class="route-tags">
                <span 
                  *ngFor="let route of strategy.routes"
                  class="route-tag"
                  [class.prefetched]="isPrefetched(route)">
                  {{ route }}
                  <span class="prefetch-status">
                    {{ isPrefetched(route) ? '✓' : '⏳' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="prefetch-status">
          <h4>Prefetch Cache Status</h4>
          <div class="cache-grid">
            <div 
              *ngFor="let item of prefetchCache() | keyvalue"
              class="cache-item">
              <div class="cache-route">{{ item.key }}</div>
              <div class="cache-info">
                <span class="cache-size">{{ item.value.size }} KB</span>
                <span class="cache-age">{{ getAgeString(item.value.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="router-info">
        <h4>🧭 Router + Signals Best Practices:</h4>
        <ul>
          <li><strong>Signal Conversion:</strong> Use <code>toSignal()</code> for route data and params</li>
          <li><strong>Computed Routing:</strong> Derive navigation state from route signals</li>
          <li><strong>Prefetch Strategies:</strong> Implement hover, viewport, and predictive prefetching</li>
          <li><strong>Cache Management:</strong> Use signals for cache state and invalidation</li>
          <li><strong>Loading States:</strong> Track navigation and data loading with signals</li>
          <li><strong>Error Boundaries:</strong> Handle route errors with signal-based error states</li>
          <li><strong>Performance:</strong> Monitor route change performance and optimize</li>
          <li><strong>SEO:</strong> Ensure proper meta tag updates during navigation</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .router-signals-demo {
      padding: 20px;
      width: 100%;
    }

    .demo-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .navigation-dashboard {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .nav-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #007bff;
    }

    .metric-icon {
      font-size: 2rem;
      margin-bottom: 8px;
    }

    .metric-label {
      font-size: 0.9rem;
      color: #000;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #007bff;
    }

    .route-history {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .route-history h4 {
      margin-top: 0;
      color: #000;
    }

    .history-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .history-entry {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
      font-size: 14px;
    }

    .history-entry.current {
      background: #e3f2fd;
      padding: 8px;
      border-radius: 4px;
      border-bottom: none;
      margin-bottom: 4px;
    }

    .history-route {
      font-weight: 500;
      color: #000;
    }

    .history-time {
      color: #000;
      font-family: monospace;
    }

    .history-duration {
      color: #007bff;
      font-weight: 500;
    }

    .route-simulator {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .route-buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .route-btn {
      padding: 10px 20px;
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .route-btn:hover:not(:disabled) {
      background: #e9ecef;
    }

    .route-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .route-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .route-content {
      border: 1px solid #e9ecef;
      border-radius: 6px;
      overflow: hidden;
    }

    .content-header {
      background: #f8f9fa;
      padding: 15px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .content-header h4 {
      margin: 0;
      color: #000;
    }

    .content-meta {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .load-time {
      font-size: 12px;
      color: #000;
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 3px;
    }

    .cache-status {
      font-size: 12px;
      color: #dc3545;
      background: #f8d7da;
      padding: 2px 6px;
      border-radius: 3px;
    }

    .cache-status.cached {
      color: #155724;
      background: #d4edda;
    }

    .content-body {
      padding: 15px;
    }

    .content-body p {
      margin: 0 0 15px 0;
      color: #000;
    }

    .route-data {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      border-left: 3px solid #007bff;
    }

    .route-data h5 {
      margin: 0 0 8px 0;
      color: #000;
    }

    .route-data pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #000;
    }

    .loading-indicator {
      text-align: center;
      padding: 40px;
      color: #000;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e9ecef;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .prefetch-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .strategy-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #6c757d;
      transition: all 0.3s;
    }

    .strategy-card.active {
      border-left-color: #28a745;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .strategy-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .strategy-header h4 {
      margin: 0;
      color: #000;
    }

    .toggle-btn {
      padding: 4px 12px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.2s;
    }

    .toggle-btn.active {
      background: #28a745;
    }

    .strategy-card p {
      margin: 0 0 15px 0;
      color: #000;
      font-size: 14px;
    }

    .strategy-routes strong {
      color: #000;
    }

    .route-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 8px;
    }

    .route-tag {
      background: #e9ecef;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      color: #000;
    }

    .route-tag.prefetched {
      background: #d4edda;
      color: #155724;
    }

    .prefetch-status {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .prefetch-status h4 {
      margin-top: 0;
      color: #000;
    }

    .cache-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
    }

    .cache-item {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      border-left: 3px solid #007bff;
    }

    .cache-route {
      font-weight: 500;
      margin-bottom: 4px;
      color: #000;
    }

    .cache-info {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #000;
    }

    .patterns-showcase {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .pattern-example {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .pattern-example h4 {
      margin-top: 0;
      color: #000;
    }

    .code-example {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }

    .code-example pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.4;
      color: #000;
    }

    .router-info {
      background: #fff3cd;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #ffc107;
    }

    .router-info ul {
      margin: 10px 0;
      padding-left: 20px;
      color: #000;
    }

    .router-info code {
      background: rgba(0,0,0,0.1);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      color: #000;
    }

    @media (max-width: 768px) {
      .navigation-dashboard {
        grid-template-columns: 1fr;
      }

      .route-buttons {
        flex-direction: column;
      }

      .prefetch-controls {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RouterSignalsDemoComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  RouteIcon = Route;

  private timeIntervalId?: ReturnType<typeof setInterval>;

  // Navigation state signals
  navigationState = signal<NavigationState>({
    currentRoute: '',
    previousRoute: '',
    navigationCount: 0,
    totalLoadTime: 0,
    averageLoadTime: 0
  });

  navigationHistory = signal<Array<{route: string, timestamp: Date, loadTime: number}>>([]);
  
  // Route data simulation
  isLoading = signal(false);
  currentRouteData = signal<RouteData | null>(null);
  
  availableRoutes = signal<Array<{id: string, title: string}>>([
    { id: 'dashboard', title: 'Dashboard' },
    { id: 'users', title: 'Users' },
    { id: 'products', title: 'Products' },
    { id: 'analytics', title: 'Analytics' },
    { id: 'settings', title: 'Settings' }
  ]);

  // Prefetch strategies
  prefetchStrategies = signal<PrefetchStrategy[]>([
    {
      id: 'hover',
      name: 'Hover Prefetch',
      description: 'Prefetch routes when user hovers over links',
      active: true,
      routes: ['/dashboard', '/users']
    },
    {
      id: 'viewport',
      name: 'Viewport Prefetch',
      description: 'Prefetch routes when links enter viewport',
      active: false,
      routes: ['/products', '/analytics']
    },
    {
      id: 'predictive',
      name: 'Predictive Prefetch',
      description: 'Prefetch based on user behavior patterns',
      active: false,
      routes: ['/settings']
    }
  ]);

  prefetchCache = signal<Record<string, {data: any, timestamp: Date, size: number}>>({});

  // Stable time signal to prevent ExpressionChangedAfterItHasBeenCheckedError
  currentTimeForDisplay = signal(Date.now());

  // Convert router events to signals (moved to class property for proper injection context)
  private navigationEnd$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => event as NavigationEnd)
  );
  
  private navigationSignal = toSignal(this.navigationEnd$, { initialValue: null });

  // Computed values
  cacheHitRate = computed(() => {
    const history = this.navigationHistory();
    if (history.length === 0) return 0;
    
    const cacheHits = history.filter(entry => entry.loadTime < 100).length;
    return Math.round((cacheHits / history.length) * 100);
  });

  // Effect to update navigation state (moved to class property for proper injection context)
  private navigationEffect = effect(() => {
    const currentData = this.currentRouteData();
    if (currentData) {
      this.updateNavigationState(currentData);
    }
  });

  ngOnInit() {
    // Initialize with dashboard
    setTimeout(() => {
      this.simulateNavigation({ id: 'dashboard', title: 'Dashboard' });
    }, 500);

    // Update display time every second to prevent expression changed errors
    this.timeIntervalId = setInterval(() => {
      this.currentTimeForDisplay.set(Date.now());
    }, 1000);
  }

  simulateNavigation(route: {id: string, title: string}) {
    this.isLoading.set(true);
    const startTime = Date.now();

    // Check cache first
    const cached = this.prefetchCache()[route.id];
    const loadTime = cached ? Math.random() * 50 + 20 : Math.random() * 500 + 200;

    // Simulate async data loading
    of(null).pipe(
      delay(loadTime),
      switchMap(() => this.loadRouteData(route.id)),
      catchError(error => {
        console.error('Route loading error:', error);
        return of(null);
      })
    ).subscribe(data => {
      const actualLoadTime = Date.now() - startTime;
      
      const routeData: RouteData = {
        id: route.id,
        title: route.title,
        description: `This is the ${route.title} page with dynamic content loaded via signals.`,
        data: data || this.generateMockData(route.id),
        loadTime: actualLoadTime,
        cached: !!cached
      };

      this.currentRouteData.set(routeData);
      this.isLoading.set(false);
      
      // Update history
      this.navigationHistory.update(history => [
        { route: route.title, timestamp: new Date(), loadTime: actualLoadTime },
        ...history.slice(0, 9) // Keep last 10 entries
      ]);
    });
  }

  private loadRouteData(routeId: string) {
    // Simulate API call
    return of({
      id: routeId,
      timestamp: new Date(),
      items: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `${routeId} Item ${i + 1}`,
        value: Math.floor(Math.random() * 1000)
      }))
    });
  }

  private generateMockData(routeId: string) {
    return {
      id: routeId,
      timestamp: new Date(),
      config: {
        theme: 'light',
        language: 'en',
        features: ['feature1', 'feature2', 'feature3']
      },
      stats: {
        views: Math.floor(Math.random() * 10000),
        users: Math.floor(Math.random() * 1000),
        conversion: Math.round(Math.random() * 100 * 100) / 100
      }
    };
  }

  private updateNavigationState(routeData: RouteData) {
    this.navigationState.update(state => {
      const newCount = state.navigationCount + 1;
      const newTotalTime = state.totalLoadTime + routeData.loadTime;
      
      return {
        currentRoute: routeData.title,
        previousRoute: state.currentRoute,
        navigationCount: newCount,
        totalLoadTime: newTotalTime,
        averageLoadTime: Math.round(newTotalTime / newCount)
      };
    });
  }

  toggleStrategy(strategyId: string) {
    this.prefetchStrategies.update(strategies =>
      strategies.map(strategy =>
        strategy.id === strategyId
          ? { ...strategy, active: !strategy.active }
          : strategy
      )
    );

    // Simulate prefetching when strategy is enabled
    const strategy = this.prefetchStrategies().find(s => s.id === strategyId);
    if (strategy?.active) {
      this.simulatePrefetch(strategy.routes);
    }
  }

  private simulatePrefetch(routes: string[]) {
    routes.forEach(route => {
      setTimeout(() => {
        const routeId = route.replace('/', '');
        const mockData = this.generateMockData(routeId);
        
        this.prefetchCache.update(cache => ({
          ...cache,
          [routeId]: {
            data: mockData,
            timestamp: new Date(),
            size: Math.floor(Math.random() * 50 + 10) // KB
          }
        }));
      }, Math.random() * 2000 + 500);
    });
  }

  isPrefetched(route: string): boolean {
    const routeId = route.replace('/', '');
    return !!this.prefetchCache()[routeId];
  }

  getAgeString(timestamp: Date): string {
    const seconds = Math.floor((this.currentTimeForDisplay() - timestamp.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  ngOnDestroy(): void {
    if (this.timeIntervalId) {
      clearInterval(this.timeIntervalId);
    }
  }
}