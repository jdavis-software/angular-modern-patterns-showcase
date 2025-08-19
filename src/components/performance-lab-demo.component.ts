import { Component, OnInit, ChangeDetectionStrategy, computed, signal, effect, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PerformanceTest {
  id: string;
  name: string;
  description: string;
  strategy: 'default' | 'onpush' | 'signals' | 'virtual';
  itemCount: number;
  renderTime: number;
  memoryUsage: number;
  fpsAverage: number;
  status: 'idle' | 'running' | 'completed' | 'error';
}

interface RenderStrategy {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
}

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fpsAverage: number;
  changeDetectionCycles: number;
  domNodes: number;
  timestamp: Date;
}

interface TestItem {
  id: number;
  name: string;
  value: number;
  category: string;
  isActive: boolean;
  lastUpdated: Date;
  complexity: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-performance-lab-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="performance-lab-demo">
      <h2>⚡ Performance Lab: Render Strategies at Scale</h2>
      
      <div class="demo-section">
        <h3>Performance Test Suite</h3>
        
        <div class="test-controls">
          <div class="control-group">
            <label>Test Scale:</label>
            <select [(ngModel)]="testScale" class="scale-select">
              <option value="small">Small (1K items)</option>
              <option value="medium">Medium (5K items)</option>
              <option value="large">Large (10K items)</option>
              <option value="xlarge">X-Large (25K items)</option>
            </select>
          </div>
          
          <div class="control-group">
            <label>Update Frequency:</label>
            <select [(ngModel)]="updateFrequency" class="frequency-select">
              <option value="low">Low (1s)</option>
              <option value="medium">Medium (500ms)</option>
              <option value="high">High (100ms)</option>
              <option value="extreme">Extreme (16ms)</option>
            </select>
          </div>

          <button 
            (click)="runAllTests()"
            [disabled]="isRunningTests()"
            class="btn-primary">
            {{ isRunningTests() ? 'Running Tests...' : 'Run Performance Tests' }}
          </button>
          
          <button 
            (click)="clearResults()"
            class="btn-secondary">
            Clear Results
          </button>
        </div>

        <div class="test-results">
          <div class="results-header">
            <h4>Test Results Comparison</h4>
            <div class="results-summary">
              <span>Completed: {{ completedTests().length }}/{{ performanceTests().length }}</span>
              <span *ngIf="bestStrategy()">Best: {{ bestStrategy()?.name }}</span>
            </div>
          </div>

          <div class="results-grid">
            <div 
              *ngFor="let test of performanceTests(); trackBy: trackByTestId"
              class="test-result-card"
              [class]="test.status">
              
              <div class="test-header">
                <h5>{{ test.name }}</h5>
                <div class="test-status">
                  <span class="status-indicator" [class]="test.status"></span>
                  {{ test.status | titlecase }}
                </div>
              </div>

              <div class="test-metrics" *ngIf="test.status === 'completed'">
                <div class="metric">
                  <span class="metric-label">Render Time</span>
                  <span class="metric-value">{{ test.renderTime }}ms</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Memory</span>
                  <span class="metric-value">{{ test.memoryUsage }}MB</span>
                </div>
                <div class="metric">
                  <span class="metric-label">FPS</span>
                  <span class="metric-value">{{ test.fpsAverage }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Items</span>
                  <span class="metric-value">{{ test.itemCount | number }}</span>
                </div>
              </div>

              <div class="test-progress" *ngIf="test.status === 'running'">
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
                <p>Running {{ test.name }} test...</p>
              </div>

              <div class="test-description">
                <p>{{ test.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Live Performance Monitor</h3>
        
        <div class="performance-monitor">
          <div class="monitor-controls">
            <button 
              (click)="startMonitoring()"
              [disabled]="isMonitoring()"
              class="btn-primary">
              Start Monitoring
            </button>
            <button 
              (click)="stopMonitoring()"
              [disabled]="!isMonitoring()"
              class="btn-secondary">
              Stop Monitoring
            </button>
            <button 
              (click)="triggerStressTest()"
              class="btn-danger">
              Stress Test
            </button>
          </div>

          <div class="metrics-dashboard">
            <div class="metric-card">
              <div class="metric-icon">⚡</div>
              <div class="metric-info">
                <div class="metric-value">{{ currentMetrics().renderTime }}ms</div>
                <div class="metric-label">Render Time</div>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-icon">🧠</div>
              <div class="metric-info">
                <div class="metric-value">{{ currentMetrics().memoryUsage }}MB</div>
                <div class="metric-label">Memory Usage</div>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-icon">📊</div>
              <div class="metric-info">
                <div class="metric-value">{{ currentMetrics().fpsAverage }}</div>
                <div class="metric-label">FPS Average</div>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-icon">🔄</div>
              <div class="metric-info">
                <div class="metric-value">{{ currentMetrics().changeDetectionCycles }}</div>
                <div class="metric-label">CD Cycles</div>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-icon">🌳</div>
              <div class="metric-info">
                <div class="metric-value">{{ currentMetrics().domNodes }}</div>
                <div class="metric-label">DOM Nodes</div>
              </div>
            </div>
          </div>

          <div class="performance-chart" #performanceChart>
            <canvas #chartCanvas width="800" height="200"></canvas>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Render Strategy Comparison</h3>
        
        <div class="strategies-grid">
          <div 
            *ngFor="let strategy of renderStrategies()"
            class="strategy-card">
            
            <div class="strategy-header">
              <h4>{{ strategy.name }}</h4>
              <div class="strategy-id">{{ strategy.id }}</div>
            </div>

            <p class="strategy-description">{{ strategy.description }}</p>

            <div class="strategy-details">
              <div class="pros-cons">
                <div class="pros">
                  <h5>✅ Pros</h5>
                  <ul>
                    <li *ngFor="let pro of strategy.pros">{{ pro }}</li>
                  </ul>
                </div>
                
                <div class="cons">
                  <h5>❌ Cons</h5>
                  <ul>
                    <li *ngFor="let con of strategy.cons">{{ con }}</li>
                  </ul>
                </div>
              </div>

              <div class="best-for">
                <h5>🎯 Best For</h5>
                <div class="use-cases">
                  <span 
                    *ngFor="let useCase of strategy.bestFor"
                    class="use-case-tag">
                    {{ useCase }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Interactive Performance Test</h3>
        
        <div class="interactive-test">
          <div class="test-controls">
            <div class="control-row">
              <label>Current Strategy:</label>
              <select [(ngModel)]="activeStrategy" class="strategy-select">
                <option value="default">Default Change Detection</option>
                <option value="onpush">OnPush Strategy</option>
                <option value="signals">Signals-Based</option>
                <option value="virtual">Virtual Scrolling</option>
              </select>
            </div>

            <div class="control-row">
              <label>Item Count: {{ testItemCount() | number }}</label>
              <input 
                type="range" 
                min="100" 
                max="10000" 
                step="100"
                [(ngModel)]="itemCountSlider"
                (input)="updateItemCount($event)"
                class="item-slider">
            </div>

            <div class="control-row">
              <button (click)="generateTestData()" class="btn-primary">
                Generate Test Data
              </button>
              <button (click)="updateRandomItems()" class="btn-secondary">
                Update Random Items
              </button>
              <button (click)="sortItems()" class="btn-secondary">
                Sort Items
              </button>
            </div>
          </div>

          <div class="test-visualization" #testVisualization>
            <div class="visualization-header">
              <h4>Live Test Data ({{ activeStrategy | titlecase }})</h4>
              <div class="performance-indicator" [class]="getPerformanceLevel()">
                {{ getPerformanceLevel() | titlecase }} Performance
              </div>
            </div>

            <div class="items-container" [class]="activeStrategy">
              <div 
                *ngFor="let item of visibleTestItems(); trackBy: trackByItemId; let i = index"
                class="test-item"
                [class.active]="item.isActive"
                [class]="item.complexity">
                
                <div class="item-id">#{{ item.id }}</div>
                <div class="item-content">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-details">
                    <span class="item-value">\${{ item.value | number:'1.0-0' }}</span>
                    <span class="item-category">{{ item.category }}</span>
                  </div>
                </div>
                <div class="item-status">
                  <span class="complexity-indicator" [class]="item.complexity">
                    {{ item.complexity }}
                  </span>
                  <span class="update-time">
                    {{ item.lastUpdated | date:'HH:mm:ss' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="performance-info">
        <h4>⚡ Performance Optimization Strategies:</h4>
        <ul>
          <li><strong>OnPush Strategy:</strong> Reduces change detection cycles by 60-90%</li>
          <li><strong>Signals:</strong> Fine-grained reactivity with automatic optimization</li>
          <li><strong>Virtual Scrolling:</strong> Handles 100K+ items with constant performance</li>
          <li><strong>TrackBy Functions:</strong> Prevents unnecessary DOM manipulation</li>
          <li><strong>Lazy Loading:</strong> Defers non-critical component initialization</li>
          <li><strong>Memoization:</strong> Caches expensive computations and renders</li>
          <li><strong>Web Workers:</strong> Offloads heavy processing from main thread</li>
          <li><strong>Bundle Splitting:</strong> Reduces initial load time and memory usage</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .performance-lab-demo {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .demo-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .test-controls {
      display: flex;
      gap: 20px;
      align-items: end;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .control-group label {
      font-weight: 500;
      color: #000;
      font-size: 14px;
    }

    .scale-select, .frequency-select, .strategy-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e9ecef;
    }

    .results-header h4 {
      margin: 0;
      color: #000;
    }

    .results-summary {
      display: flex;
      gap: 15px;
      font-size: 14px;
      color: #000;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .test-result-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #6c757d;
      transition: all 0.3s;
    }

    .test-result-card.completed {
      border-left-color: #28a745;
    }

    .test-result-card.running {
      border-left-color: #007bff;
      animation: pulse 2s infinite;
    }

    .test-result-card.error {
      border-left-color: #dc3545;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .test-header h5 {
      margin: 0;
      color: #000;
    }

    .test-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6c757d;
    }

    .status-indicator.completed { background: #28a745; }
    .status-indicator.running { background: #007bff; }
    .status-indicator.error { background: #dc3545; }

    .test-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .metric-label {
      font-size: 12px;
      color: #000;
    }

    .metric-value {
      font-weight: 600;
      color: #007bff;
    }

    .test-progress {
      text-align: center;
      margin-bottom: 15px;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e9ecef;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #28a745);
      animation: progress 2s ease-in-out infinite;
    }

    @keyframes progress {
      0% { width: 0%; }
      50% { width: 70%; }
      100% { width: 100%; }
    }

    .test-description p {
      margin: 0;
      font-size: 14px;
      color: #000;
    }

    .performance-monitor {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .monitor-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .metrics-dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .metric-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-left: 3px solid #007bff;
    }

    .metric-icon {
      font-size: 1.5rem;
    }

    .metric-info {
      flex: 1;
    }

    .metric-card .metric-value {
      font-size: 1.2rem;
      font-weight: bold;
      color: #007bff;
      margin-bottom: 2px;
    }

    .metric-card .metric-label {
      font-size: 0.8rem;
      color: #000;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .performance-chart {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 10px;
    }

    .strategies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .strategy-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #007bff;
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

    .strategy-id {
      background: #e9ecef;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      color: #000;
    }

    .strategy-description {
      margin: 0 0 15px 0;
      color: #000;
      line-height: 1.5;
    }

    .pros-cons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }

    .pros h5, .cons h5 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #000;
    }

    .pros ul, .cons ul {
      margin: 0;
      padding-left: 15px;
      font-size: 13px;
      color: #000;
    }

    .pros li, .cons li {
      margin-bottom: 4px;
    }

    .best-for h5 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #000;
    }

    .use-cases {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .use-case-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .interactive-test {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .control-row {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }

    .control-row label {
      font-weight: 500;
      color: #000;
      min-width: 120px;
    }

    .item-slider {
      flex: 1;
      min-width: 200px;
    }

    .test-visualization {
      border: 1px solid #e9ecef;
      border-radius: 6px;
      overflow: hidden;
    }

    .visualization-header {
      background: #f8f9fa;
      padding: 15px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .visualization-header h4 {
      margin: 0;
      color: #000;
    }

    .performance-indicator {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .performance-indicator.excellent {
      background: #d4edda;
      color: #155724;
    }

    .performance-indicator.good {
      background: #d1ecf1;
      color: #0c5460;
    }

    .performance-indicator.fair {
      background: #fff3cd;
      color: #856404;
    }

    .performance-indicator.poor {
      background: #f8d7da;
      color: #721c24;
    }

    .items-container {
      max-height: 400px;
      overflow-y: auto;
      padding: 10px;
    }

    .items-container.virtual {
      /* Virtual scrolling would be implemented here */
      background: linear-gradient(45deg, #f8f9fa 25%, transparent 25%),
                  linear-gradient(-45deg, #f8f9fa 25%, transparent 25%);
      background-size: 20px 20px;
    }

    .test-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 10px;
      border-bottom: 1px solid #e9ecef;
      transition: background-color 0.2s;
    }

    .test-item:hover {
      background: #f8f9fa;
    }

    .test-item.active {
      background: #e3f2fd;
      border-left: 3px solid #2196f3;
    }

    .item-id {
      font-family: monospace;
      font-size: 12px;
      color: #000;
      min-width: 50px;
    }

    .item-content {
      flex: 1;
    }

    .item-name {
      font-weight: 500;
      margin-bottom: 2px;
      color: #000;
    }

    .item-details {
      display: flex;
      gap: 10px;
      font-size: 12px;
    }

    .item-value {
      color: #28a745;
      font-weight: 500;
    }

    .item-category {
      color: #000;
      background: #e9ecef;
      padding: 1px 6px;
      border-radius: 8px;
    }

    .item-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .complexity-indicator {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 8px;
      text-transform: uppercase;
      font-weight: 500;
    }

    .complexity-indicator.low {
      background: #d4edda;
      color: #155724;
    }

    .complexity-indicator.medium {
      background: #fff3cd;
      color: #856404;
    }

    .complexity-indicator.high {
      background: #f8d7da;
      color: #721c24;
    }

    .update-time {
      font-size: 10px;
      color: #000;
      font-family: monospace;
    }

    .btn-primary, .btn-secondary, .btn-danger {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-primary:disabled {
      background: #6c757d;
      cursor: not-allowed;
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

    .performance-info {
      background: #fff3cd;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #ffc107;
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

    @media (max-width: 768px) {
      .test-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .results-grid {
        grid-template-columns: 1fr;
      }

      .strategies-grid {
        grid-template-columns: 1fr;
      }

      .pros-cons {
        grid-template-columns: 1fr;
      }

      .control-row {
        flex-direction: column;
        align-items: stretch;
      }

      .control-row label {
        min-width: auto;
      }
    }
  `]
})
export class PerformanceLabDemoComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('performanceChart') performanceChart!: ElementRef;

  // Test configuration
  testScale = 'medium';
  updateFrequency = 'medium';
  activeStrategy = 'default';
  itemCountSlider = 1000;

  // Performance test state
  performanceTests = signal<PerformanceTest[]>([
    {
      id: 'default',
      name: 'Default Change Detection',
      description: 'Standard Angular change detection with no optimizations',
      strategy: 'default',
      itemCount: 0,
      renderTime: 0,
      memoryUsage: 0,
      fpsAverage: 0,
      status: 'idle'
    },
    {
      id: 'onpush',
      name: 'OnPush Strategy',
      description: 'OnPush change detection with immutable data patterns',
      strategy: 'onpush',
      itemCount: 0,
      renderTime: 0,
      memoryUsage: 0,
      fpsAverage: 0,
      status: 'idle'
    },
    {
      id: 'signals',
      name: 'Signals-Based',
      description: 'Fine-grained reactivity using Angular Signals',
      strategy: 'signals',
      itemCount: 0,
      renderTime: 0,
      memoryUsage: 0,
      fpsAverage: 0,
      status: 'idle'
    },
    {
      id: 'virtual',
      name: 'Virtual Scrolling',
      description: 'CDK Virtual Scrolling for large datasets',
      strategy: 'virtual',
      itemCount: 0,
      renderTime: 0,
      memoryUsage: 0,
      fpsAverage: 0,
      status: 'idle'
    }
  ]);

  // Monitoring state
  isMonitoring = signal(false);
  currentMetrics = signal<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    fpsAverage: 60,
    changeDetectionCycles: 0,
    domNodes: 0,
    timestamp: new Date()
  });

  // Test data
  testItemCount = signal(1000);
  testItems = signal<TestItem[]>([]);
  
  // Render strategies
  renderStrategies = signal<RenderStrategy[]>([
    {
      id: 'default',
      name: 'Default Change Detection',
      description: 'Angular\'s default change detection runs on every tick, checking all components.',
      pros: [
        'Simple to implement',
        'No additional configuration',
        'Works with any data patterns',
        'Automatic updates'
      ],
      cons: [
        'Performance degrades with scale',
        'Unnecessary checks on unchanged data',
        'Can cause frame drops',
        'Memory intensive'
      ],
      bestFor: [
        'Small applications',
        'Prototypes',
        'Simple forms',
        'Static content'
      ]
    },
    {
      id: 'onpush',
      name: 'OnPush Change Detection',
      description: 'Only runs change detection when inputs change or events are triggered.',
      pros: [
        '60-90% fewer CD cycles',
        'Better performance at scale',
        'Predictable update patterns',
        'Lower memory usage'
      ],
      cons: [
        'Requires immutable patterns',
        'More complex state management',
        'Manual change detection needed',
        'Learning curve'
      ],
      bestFor: [
        'Large lists',
        'Complex components',
        'Data-heavy apps',
        'Performance-critical features'
      ]
    },
    {
      id: 'signals',
      name: 'Signals-Based Reactivity',
      description: 'Fine-grained reactivity that only updates when specific signals change.',
      pros: [
        'Automatic optimization',
        'Fine-grained updates',
        'Excellent performance',
        'Simple mental model'
      ],
      cons: [
        'Newer API (Angular 16+)',
        'Migration effort required',
        'Limited ecosystem support',
        'Learning new patterns'
      ],
      bestFor: [
        'Modern applications',
        'Complex state management',
        'Real-time updates',
        'Performance optimization'
      ]
    },
    {
      id: 'virtual',
      name: 'Virtual Scrolling',
      description: 'Only renders visible items, handling massive datasets efficiently.',
      pros: [
        'Handles 100K+ items',
        'Constant performance',
        'Low memory footprint',
        'Smooth scrolling'
      ],
      cons: [
        'Complex implementation',
        'Limited layout flexibility',
        'Accessibility challenges',
        'CDK dependency'
      ],
      bestFor: [
        'Large datasets',
        'Infinite scrolling',
        'Data tables',
        'Chat applications'
      ]
    }
  ]);

  // Computed values
  isRunningTests = computed(() => 
    this.performanceTests().some(test => test.status === 'running')
  );

  completedTests = computed(() => 
    this.performanceTests().filter(test => test.status === 'completed')
  );

  bestStrategy = computed(() => {
    const completed = this.completedTests();
    if (completed.length === 0) return null;
    
    return completed.reduce((best, current) => 
      current.renderTime < best.renderTime ? current : best
    );
  });

  visibleTestItems = computed(() => {
    const items = this.testItems();
    // Simulate different rendering strategies
    switch (this.activeStrategy) {
      case 'virtual':
        return items.slice(0, 50); // Virtual scrolling shows limited items
      case 'onpush':
        return items.filter(item => item.isActive); // OnPush might filter
      default:
        return items.slice(0, 100); // Limit for demo purposes
    }
  });

  private monitoringInterval?: number;
  private fpsFrames: number[] = [];
  private lastFrameTime = 0;
  private chartData: { time: number; renderTime: number; fps: number; memory: number }[] = [];
  private chartContext?: CanvasRenderingContext2D;

  constructor() {
    // Effect to update metrics when monitoring (moved to constructor for proper injection context)
    effect(() => {
      if (this.isMonitoring()) {
        this.updateMetrics();
      }
    });
  }

  ngOnInit() {
    this.generateTestData();
  }

  ngAfterViewInit() {
    this.initializeChart();
  }

  runAllTests() {
    const itemCounts = {
      small: 1000,
      medium: 5000,
      large: 10000,
      xlarge: 25000
    };

    const itemCount = itemCounts[this.testScale as keyof typeof itemCounts];
    
    this.performanceTests.update(tests =>
      tests.map(test => ({ ...test, status: 'idle' as const, itemCount }))
    );

    // Run tests sequentially
    this.runTestSequence(0);
  }

  private async runTestSequence(index: number) {
    const tests = this.performanceTests();
    if (index >= tests.length) return;

    const test = tests[index];
    
    // Update test status to running
    this.performanceTests.update(tests =>
      tests.map(t => t.id === test.id ? { ...t, status: 'running' as const } : t)
    );

    // Simulate test execution
    await this.executePerformanceTest(test);

    // Run next test
    setTimeout(() => this.runTestSequence(index + 1), 500);
  }

  private async executePerformanceTest(test: PerformanceTest): Promise<void> {
    return new Promise(resolve => {
      const startTime = performance.now();
      const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Simulate different performance characteristics
      const baseTime = Math.random() * 100 + 50;
      const strategyMultipliers = {
        default: 1.0,
        onpush: 0.3,
        signals: 0.2,
        virtual: 0.1
      };

      const multiplier = strategyMultipliers[test.strategy];
      const renderTime = Math.round(baseTime * multiplier * (test.itemCount / 1000));
      const memoryUsage = Math.round((test.itemCount * 0.1 * multiplier) + Math.random() * 10);
      const fpsAverage = Math.round(60 - (renderTime / 10));

      setTimeout(() => {
        this.performanceTests.update(tests =>
          tests.map(t => t.id === test.id ? {
            ...t,
            status: 'completed' as const,
            renderTime: renderTime,
            memoryUsage: memoryUsage,
            fpsAverage: fpsAverage
          } : t)
        );
        resolve();
      }, 1000 + Math.random() * 1000);
    });
  }

  clearResults() {
    this.performanceTests.update(tests =>
      tests.map(test => ({
        ...test,
        status: 'idle' as const,
        renderTime: 0,
        memoryUsage: 0,
        fpsAverage: 0
      }))
    );
  }

  startMonitoring() {
    this.isMonitoring.set(true);
    this.chartData = []; // Reset chart data
    this.monitoringInterval = window.setInterval(() => {
      this.updateMetrics();
      this.updateChart();
    }, 100);
  }

  stopMonitoring() {
    this.isMonitoring.set(false);
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  triggerStressTest() {
    // Simulate heavy operations
    for (let i = 0; i < 1000; i++) {
      this.updateRandomItems();
    }
  }

  private updateMetrics() {
    const now = performance.now();
    const itemCount = this.testItemCount();
    const strategy = this.activeStrategy;
    
    // Calculate FPS
    if (this.lastFrameTime) {
      const fps = 1000 / (now - this.lastFrameTime);
      this.fpsFrames.push(fps);
      if (this.fpsFrames.length > 60) {
        this.fpsFrames.shift();
      }
    }
    this.lastFrameTime = now;

    const avgFps = this.fpsFrames.length > 0 
      ? Math.round(this.fpsFrames.reduce((a, b) => a + b, 0) / this.fpsFrames.length)
      : 60;

    // More realistic render time simulation based on item count and strategy
    const baseRenderTime = Math.max(8, itemCount / 100); // Base time increases with item count
    
    // Strategy performance multipliers
    const strategyMultipliers = {
      'default': 1.0 + (itemCount / 5000), // Gets worse with more items
      'onpush': 0.4 + (itemCount / 10000), // Much better, slight degradation
      'signals': 0.3 + (itemCount / 15000), // Best performance
      'virtual': 0.2 // Constant performance regardless of item count
    };
    
    const multiplier = strategyMultipliers[strategy as keyof typeof strategyMultipliers] || 1.0;
    const simulatedRenderTime = Math.round(baseRenderTime * multiplier + Math.random() * 5);
    
    // Simulate FPS impact from render time
    const simulatedFps = Math.max(15, Math.min(60, 60 - Math.floor(simulatedRenderTime / 2)));
    
    const memoryUsage = Math.round(((performance as any).memory?.usedJSHeapSize || 0) / 1024 / 1024);
    
    const metrics: PerformanceMetrics = {
      renderTime: simulatedRenderTime,
      memoryUsage,
      fpsAverage: simulatedFps,
      changeDetectionCycles: Math.round(Math.random() * 10 + 1),
      domNodes: document.querySelectorAll('*').length,
      timestamp: new Date()
    };

    this.currentMetrics.set(metrics);
    
    // Add to chart data
    this.chartData.push({
      time: Date.now(),
      renderTime,
      fps: avgFps,
      memory: memoryUsage
    });
    
    // Keep only last 100 data points
    if (this.chartData.length > 100) {
      this.chartData.shift();
    }
  }

  generateTestData() {
    const count = this.testItemCount();
    const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
    const complexities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    
    const items: TestItem[] = [];
    
    for (let i = 1; i <= count; i++) {
      items.push({
        id: i,
        name: `Test Item ${i}`,
        value: Math.random() * 1000 + 10,
        category: categories[Math.floor(Math.random() * categories.length)],
        isActive: Math.random() > 0.3,
        lastUpdated: new Date(),
        complexity: complexities[Math.floor(Math.random() * complexities.length)]
      });
    }
    
    this.testItems.set(items);
  }

  updateItemCount(event: any) {
    const count = parseInt(event.target.value);
    this.testItemCount.set(count);
  }

  updateRandomItems() {
    const items = this.testItems();
    const updateCount = Math.min(100, items.length);
    
    const updatedItems = items.map(item => {
      if (Math.random() < updateCount / items.length) {
        return {
          ...item,
          value: Math.random() * 1000 + 10,
          lastUpdated: new Date()
        };
      }
      return item;
    });
    
    this.testItems.set(updatedItems);
  }

  sortItems() {
    const items = [...this.testItems()];
    items.sort((a, b) => b.value - a.value);
    this.testItems.set(items);
  }

  getPerformanceLevel(): string {
    const metrics = this.currentMetrics();
    const itemCount = this.testItemCount();
    const strategy = this.activeStrategy;
    
    // Calculate performance based on item count and strategy
    let expectedRenderTime = 16; // Base 60fps target
    
    // Adjust expectations based on item count
    if (itemCount > 5000) expectedRenderTime = 33; // 30fps acceptable for large datasets
    if (itemCount > 8000) expectedRenderTime = 50; // 20fps acceptable for very large datasets
    
    // Strategy multipliers for expected performance
    const strategyMultipliers = {
      'default': 1.0,
      'onpush': 0.6,
      'signals': 0.4,
      'virtual': 0.2
    };
    
    const multiplier = strategyMultipliers[strategy as keyof typeof strategyMultipliers] || 1.0;
    const adjustedExpectedTime = expectedRenderTime * multiplier;
    
    // More realistic thresholds
    if (metrics.renderTime <= adjustedExpectedTime && metrics.fpsAverage >= 55) return 'excellent';
    if (metrics.renderTime <= adjustedExpectedTime * 1.5 && metrics.fpsAverage >= 45) return 'good';
    if (metrics.renderTime <= adjustedExpectedTime * 2.5 && metrics.fpsAverage >= 30) return 'fair';
    return 'poor';
  }

  private initializeChart() {
    const canvas = this.chartCanvas?.nativeElement;
    if (canvas) {
      this.chartContext = canvas.getContext('2d') || undefined;
      this.drawChart();
    }
  }
  
  private updateChart() {
    if (this.isMonitoring()) {
      this.drawChart();
    }
  }
  
  private drawChart() {
    const canvas = this.chartCanvas?.nativeElement;
    const ctx = this.chartContext;
    
    if (!canvas || !ctx || this.chartData.length === 0) {
      return;
    }
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw background grid
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (chartWidth / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    if (this.chartData.length < 2) return;
    
    // Draw render time line (blue)
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const maxRenderTime = Math.max(...this.chartData.map(d => d.renderTime), 100);
    
    this.chartData.forEach((point, index) => {
      const x = padding + (chartWidth / (this.chartData.length - 1)) * index;
      const y = height - padding - (point.renderTime / maxRenderTime) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw FPS line (green)
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    this.chartData.forEach((point, index) => {
      const x = padding + (chartWidth / (this.chartData.length - 1)) * index;
      const y = height - padding - (point.fps / 60) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    // Y-axis labels
    ctx.fillText('100ms', 5, padding + 5);
    ctx.fillText('50ms', 5, padding + chartHeight / 2 + 5);
    ctx.fillText('0ms', 5, height - padding + 5);
    
    // Legend
    ctx.fillStyle = '#007bff';
    ctx.fillRect(width - 150, 20, 15, 3);
    ctx.fillStyle = '#000';
    ctx.fillText('Render Time', width - 130, 25);
    
    ctx.fillStyle = '#28a745';
    ctx.fillRect(width - 150, 35, 15, 3);
    ctx.fillStyle = '#000';
    ctx.fillText('FPS', width - 130, 40);
    
    // Title
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Real-time Performance Monitor', width / 2, 15);
  }

  trackByTestId(index: number, test: PerformanceTest): string {
    return test.id;
  }

  trackByItemId(index: number, item: TestItem): number {
    return item.id;
  }
}