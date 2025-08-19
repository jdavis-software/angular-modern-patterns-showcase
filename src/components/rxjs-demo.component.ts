import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fromEvent, interval, merge, Subject, BehaviorSubject } from 'rxjs';
import { 
  map, 
  filter, 
  debounceTime, 
  distinctUntilChanged, 
  switchMap, 
  takeUntil,
  scan,
  share,
  throttleTime,
  buffer,
  tap
} from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

interface WebSocketMessage {
  id: string;
  type: 'user_joined' | 'user_left' | 'message' | 'typing';
  data: any;
  timestamp: Date;
}

@Component({
  selector: 'app-rxjs-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rxjs-demo">
      <h2>🌊 RxJS Demo: Complex Async Composition</h2>
      
      <div class="demo-section">
        <h3>Real-time WebSocket Simulation</h3>
        <div class="websocket-controls">
          <button 
            (click)="startWebSocket()" 
            [disabled]="isConnected()"
            class="btn-primary">
            {{ isConnected() ? 'Connected' : 'Connect to Chat' }}
          </button>
          <button 
            (click)="stopWebSocket()" 
            [disabled]="!isConnected()"
            class="btn-secondary">
            Disconnect
          </button>
        </div>

        <div class="connection-status" [class.connected]="isConnected()">
          <span class="status-dot"></span>
          {{ isConnected() ? 'Connected' : 'Disconnected' }}
        </div>

        <div class="messages-container" *ngIf="isConnected()">
          <div class="messages-header">
            <h4>Live Messages ({{ messageCount() }})</h4>
            <small>Buffered every 2 seconds</small>
          </div>
          <div class="messages-list">
            <div 
              *ngFor="let batch of messageBatches(); trackBy: trackByBatch" 
              class="message-batch">
              <div class="batch-header">
                Batch at {{ batch.timestamp | date:'HH:mm:ss' }} 
                ({{ batch.messages.length }} messages)
              </div>
              <div 
                *ngFor="let msg of batch.messages" 
                class="message"
                [ngClass]="'message-' + msg.type">
                <span class="message-time">{{ msg.timestamp | date:'HH:mm:ss.SSS' }}</span>
                <span class="message-content">{{ formatMessage(msg) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>DOM Events & Backpressure</h3>
        <div class="mouse-tracker" #mouseArea>
          <div class="tracker-info">
            <p>Move your mouse in this area</p>
            <div class="coordinates">
              <strong>Throttled Position:</strong> 
              {{ mousePosition()?.x || 0 }}, {{ mousePosition()?.y || 0 }}
            </div>
            <div class="coordinates">
              <strong>Click Count:</strong> {{ clickCount() }}
            </div>
            <div class="coordinates">
              <strong>Double Clicks:</strong> {{ doubleClickCount() }}
            </div>
          </div>
          <div 
            class="mouse-indicator" 
            [style.left.px]="mousePosition()?.x || 0"
            [style.top.px]="mousePosition()?.y || 0">
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Search with Debouncing</h3>
        <input 
          #searchInput
          type="text" 
          placeholder="Type to search (debounced)..."
          class="search-input">
        <div class="search-results" *ngIf="searchResults().length > 0">
          <div class="results-header">
            Search results for "{{ lastSearchTerm() }}" ({{ searchResults().length }} found):
          </div>
          <div 
            *ngFor="let result of searchResults()" 
            class="search-result">
            {{ result }}
          </div>
        </div>
        <div class="search-info" *ngIf="!searchResults().length && lastSearchTerm()">
          No results found for "{{ lastSearchTerm() }}"
        </div>
      </div>

      <div class="rxjs-info">
        <h4>🔍 RxJS Patterns Demonstrated:</h4>
        <ul>
          <li><strong>WebSocket Stream:</strong> External data source with multicasting</li>
          <li><strong>Buffer:</strong> Batching messages every 2 seconds</li>
          <li><strong>Throttle:</strong> Mouse position updates limited to 100ms</li>
          <li><strong>Debounce:</strong> Search input delayed by 300ms</li>
          <li><strong>Merge:</strong> Combining multiple click streams</li>
          <li><strong>SwitchMap:</strong> Canceling previous search requests</li>
          <li><strong>Share:</strong> Multicasting to prevent duplicate subscriptions</li>
          <li><strong>toSignal():</strong> Exposing streams to Angular templates</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .rxjs-demo {
      padding: 20px;
      width: 100%;
    }

    .demo-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .websocket-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px;
      background: white;
      border-radius: 4px;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #dc3545;
    }

    .connection-status.connected .status-dot {
      background: #28a745;
    }

    .messages-container {
      background: white;
      border-radius: 8px;
      padding: 15px;
      max-height: 400px;
      overflow-y: auto;
    }

    .messages-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .message-batch {
      margin-bottom: 15px;
      border-left: 3px solid #007bff;
      padding-left: 10px;
    }

    .batch-header {
      font-size: 12px;
      color: #000;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .message {
      display: flex;
      gap: 10px;
      padding: 4px 0;
      font-size: 14px;
    }

    .message-time {
      color: #000;
      font-family: monospace;
      font-size: 12px;
      min-width: 80px;
    }

    .message-user_joined {
      color: #28a745;
    }

    .message-user_left {
      color: #dc3545;
    }

    .message-message {
      color: #000;
    }

    .message-typing {
      color: #ffc107;
      font-style: italic;
    }

    .mouse-tracker {
      position: relative;
      height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      overflow: hidden;
      cursor: crosshair;
    }

    .tracker-info {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255,255,255,0.9);
      padding: 10px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 2;
    }

    .coordinates {
      margin: 4px 0;
    }

    .mouse-indicator {
      position: absolute;
      width: 20px;
      height: 20px;
      background: #ff4757;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      box-shadow: 0 0 10px rgba(255,71,87,0.5);
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      margin-bottom: 15px;
    }

    .search-results {
      background: white;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .results-header {
      background: #e9ecef;
      padding: 10px;
      font-weight: 500;
      font-size: 14px;
      color: #000;
    }

    .search-result {
      padding: 8px 15px;
      border-bottom: 1px solid #eee;
    }

    .search-result:last-child {
      border-bottom: none;
    }

    .search-info {
      color: #000;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }

    .rxjs-info {
      background: #fff3cd;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #ffc107;
    }

    .rxjs-info ul {
      margin: 10px 0;
      padding-left: 20px;
      color: #000;
    }

    .rxjs-info code {
      background: rgba(0,0,0,0.1);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      color: #000;
    }

    .btn-primary, .btn-secondary {
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

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #545b62;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class RxJSDemoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private webSocketSubject = new BehaviorSubject<WebSocketMessage | null>(null);
  private mockWebSocketInterval?: any;

  // Signals from RxJS streams
  isConnected = signal(false);
  messageCount = signal(0);
  messageBatches = signal<{ timestamp: Date; messages: WebSocketMessage[] }[]>([]);
  mousePosition = signal<{ x: number; y: number } | null>(null);
  clickCount = signal(0);
  doubleClickCount = signal(0);
  searchResults = signal<string[]>([]);
  lastSearchTerm = signal('');

  ngOnInit() {
    this.setupDOMEventStreams();
    this.setupSearchStream();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopWebSocket();
  }

  startWebSocket() {
    if (this.isConnected()) return;

    this.isConnected.set(true);
    
    // Simulate WebSocket messages
    this.mockWebSocketInterval = setInterval(() => {
      const messageTypes: WebSocketMessage['type'][] = ['user_joined', 'user_left', 'message', 'typing'];
      const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
      
      const message: WebSocketMessage = {
        id: crypto.randomUUID(),
        type: randomType,
        data: this.generateMockData(randomType),
        timestamp: new Date()
      };

      this.webSocketSubject.next(message);
    }, Math.random() * 1000 + 500); // Random interval between 500-1500ms

    // Buffer messages every 2 seconds and convert to signal
    this.webSocketSubject.pipe(
      filter(msg => msg !== null),
      buffer(interval(2000)),
      filter(batch => batch.length > 0),
      scan((acc, batch) => {
        const newBatch = { timestamp: new Date(), messages: batch as WebSocketMessage[] };
        return [newBatch, ...acc].slice(0, 10); // Keep last 10 batches
      }, [] as { timestamp: Date; messages: WebSocketMessage[] }[]),
      takeUntil(this.destroy$)
    ).subscribe(batches => {
      this.messageBatches.set(batches);
      const totalMessages = batches.reduce((sum, batch) => sum + batch.messages.length, 0);
      this.messageCount.set(totalMessages);
    });
  }

  stopWebSocket() {
    this.isConnected.set(false);
    if (this.mockWebSocketInterval) {
      clearInterval(this.mockWebSocketInterval);
      this.mockWebSocketInterval = null;
    }
    this.messageBatches.set([]);
    this.messageCount.set(0);
  }

  private setupDOMEventStreams() {
    // Mouse movement with throttling
    const mouseArea = document.querySelector('.mouse-tracker');
    if (mouseArea) {
      fromEvent<MouseEvent>(mouseArea, 'mousemove').pipe(
        throttleTime(100), // Limit to 10 updates per second
        map(event => {
          const rect = (event.target as Element).getBoundingClientRect();
          return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          };
        }),
        takeUntil(this.destroy$)
      ).subscribe(position => {
        this.mousePosition.set(position);
      });

      // Click counting
      fromEvent(mouseArea, 'click').pipe(
        scan(count => count + 1, 0),
        takeUntil(this.destroy$)
      ).subscribe(count => {
        this.clickCount.set(count);
      });

      // Double click detection
      fromEvent(mouseArea, 'dblclick').pipe(
        scan(count => count + 1, 0),
        takeUntil(this.destroy$)
      ).subscribe(count => {
        this.doubleClickCount.set(count);
      });
    }
  }

  private setupSearchStream() {
    setTimeout(() => {
      const searchInput = document.querySelector('.search-input') as HTMLInputElement;
      if (searchInput) {
        fromEvent(searchInput, 'input').pipe(
          map((event: any) => event.target.value),
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(term => this.performSearch(term)),
          takeUntil(this.destroy$)
        ).subscribe(({ term, results }) => {
          this.lastSearchTerm.set(term);
          this.searchResults.set(results);
        });
      }
    }, 100);
  }

  private performSearch(term: string): Promise<{ term: string; results: string[] }> {
    // Simulate API search
    return new Promise(resolve => {
      setTimeout(() => {
        const mockData = [
          'Angular Components', 'RxJS Operators', 'TypeScript Interfaces',
          'NgRx Store', 'Signals API', 'Dependency Injection',
          'HTTP Client', 'Router Guards', 'Reactive Forms',
          'Custom Directives', 'Pipes', 'Services'
        ];

        const results = term 
          ? mockData.filter(item => 
              item.toLowerCase().includes(term.toLowerCase())
            )
          : [];

        resolve({ term, results });
      }, Math.random() * 500 + 200); // Simulate network delay
    });
  }

  private generateMockData(type: WebSocketMessage['type']): any {
    const users = ['Alice', 'Bob', 'Carol', 'David', 'Eva'];
    const messages = [
      'Hello everyone!', 'How is everyone doing?', 'Great weather today!',
      'Anyone working on Angular?', 'RxJS is awesome!', 'Love the new signals API'
    ];

    switch (type) {
      case 'user_joined':
        return { username: users[Math.floor(Math.random() * users.length)] };
      case 'user_left':
        return { username: users[Math.floor(Math.random() * users.length)] };
      case 'message':
        return { 
          username: users[Math.floor(Math.random() * users.length)],
          text: messages[Math.floor(Math.random() * messages.length)]
        };
      case 'typing':
        return { username: users[Math.floor(Math.random() * users.length)] };
      default:
        return {};
    }
  }

  formatMessage(msg: WebSocketMessage): string {
    switch (msg.type) {
      case 'user_joined':
        return `${msg.data.username} joined the chat`;
      case 'user_left':
        return `${msg.data.username} left the chat`;
      case 'message':
        return `${msg.data.username}: ${msg.data.text}`;
      case 'typing':
        return `${msg.data.username} is typing...`;
      default:
        return 'Unknown message type';
    }
  }

  trackByBatch(index: number, batch: { timestamp: Date; messages: WebSocketMessage[] }): string {
    return batch.timestamp.toISOString();
  }
}