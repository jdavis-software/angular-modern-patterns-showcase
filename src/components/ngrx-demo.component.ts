import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { 
  selectUsers, 
  selectOnlineUsers, 
  selectTodos, 
  selectCompletedTodos,
  selectLoading 
} from '../store/app.selectors';
import { 
  loadUsers, 
  loadUsersSuccess, 
  addTodo, 
  toggleTodo 
} from '../store/app.state';
import { User, Todo } from '../types';

@Component({
  selector: 'app-ngrx-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ngrx-demo">
      <h2>🏪 NgRx Demo: App-wide State Management</h2>
      
      <div class="demo-section">
        <h3>Users Management</h3>
        <button 
          (click)="loadMockUsers()" 
          [disabled]="loading()"
          class="btn-primary">
          {{ loading() ? 'Loading...' : 'Load Users' }}
        </button>
        
        <div class="users-grid" *ngIf="users().length > 0">
          <div 
            *ngFor="let user of users(); trackBy: trackByUserId" 
            class="user-card"
            [class.online]="user.isOnline">
            <div class="user-info">
              <strong>{{ user.name }}</strong>
              <small>{{ user.email }}</small>
            </div>
            <div class="user-status">
              <span class="status-indicator" [class.online]="user.isOnline"></span>
              {{ user.isOnline ? 'Online' : 'Offline' }}
            </div>
          </div>
        </div>

        <div class="stats" *ngIf="users().length > 0">
          <div class="stat">
            <strong>{{ users().length }}</strong>
            <span>Total Users</span>
          </div>
          <div class="stat">
            <strong>{{ onlineUsers().length }}</strong>
            <span>Online Now</span>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Todos Management</h3>
        
        <div class="add-todo" *ngIf="users().length > 0">
          <select [(ngModel)]="selectedUserId" class="user-select">
            <option value="">Select User</option>
            <option *ngFor="let user of users()" [value]="user.id">
              {{ user.name }}
            </option>
          </select>
          <input 
            [(ngModel)]="newTodoTitle" 
            placeholder="Todo title"
            class="todo-input">
          <button 
            (click)="addNewTodo()"
            [disabled]="!selectedUserId || !newTodoTitle.trim()"
            class="btn-primary">
            Add Todo
          </button>
        </div>

        <div class="todos-list" *ngIf="todos().length > 0">
          <div 
            *ngFor="let todo of todos(); trackBy: trackByTodoId" 
            class="todo-item"
            [class.completed]="todo.completed">
            <input 
              type="checkbox" 
              [checked]="todo.completed"
              (change)="toggleTodoStatus(todo.id)"
              class="todo-checkbox">
            <span class="todo-title">{{ todo.title }}</span>
            <small class="todo-user">
              by {{ getUserName(todo.userId) }}
            </small>
          </div>
        </div>

        <div class="todos-stats" *ngIf="todos().length > 0">
          <div class="stat">
            <strong>{{ todos().length }}</strong>
            <span>Total Todos</span>
          </div>
          <div class="stat">
            <strong>{{ completedTodos().length }}</strong>
            <span>Completed</span>
          </div>
          <div class="stat">
            <strong>{{ todos().length - completedTodos().length }}</strong>
            <span>Remaining</span>
          </div>
        </div>
      </div>

      <div class="ngrx-info">
        <h4>🔍 What's happening with NgRx:</h4>
        <ul>
          <li><strong>Store:</strong> Centralized app state with time-travel debugging</li>
          <li><strong>Actions:</strong> Dispatched events (loadUsers, addTodo, toggleTodo)</li>
          <li><strong>Reducers:</strong> Pure functions updating state immutably</li>
          <li><strong>Selectors:</strong> Memoized state queries with derived data</li>
          <li><strong>Signal Integration:</strong> Using <code>toSignal()</code> for template ergonomics</li>
          <li><strong>DevTools:</strong> Open Redux DevTools to see actions & state changes!</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .ngrx-demo {
      padding: 20px;
      width: 100%;
    }

    .demo-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }

    .user-card {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #dc3545;
      transition: border-color 0.3s;
    }

    .user-card.online {
      border-left-color: #28a745;
    }

    .user-info strong {
      display: block;
      margin-bottom: 4px;
      color: #000;
    }

    .user-info small {
      color: #495057;
    }

    .user-status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
      font-size: 14px;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #dc3545;
    }

    .status-indicator.online {
      background: #28a745;
    }

    .stats, .todos-stats {
      display: flex;
      gap: 20px;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .stat {
      background: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      min-width: 100px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .stat strong {
      display: block;
      font-size: 1.5em;
      color: #007bff;
      margin-bottom: 4px;
    }

    .stat span {
      font-size: 0.9em;
      color: #000;
    }

    .add-todo {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .user-select, .todo-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      flex: 1;
      min-width: 150px;
    }

    .todos-list {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .todo-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      transition: background-color 0.2s;
    }

    .todo-item:hover {
      background: #f8f9fa;
    }

    .todo-item:last-child {
      border-bottom: none;
    }

    .todo-item.completed {
      opacity: 0.7;
    }

    .todo-item.completed .todo-title {
      text-decoration: line-through;
    }

    .todo-checkbox {
      width: 18px;
      height: 18px;
    }

    .todo-title {
      flex: 1;
      font-weight: 500;
      color: #000;
    }

    .todo-user {
      color: #495057;
      font-style: italic;
    }

    .ngrx-info {
      background: #e8f5e8;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #28a745;
    }

    .ngrx-info ul {
      margin: 10px 0;
      color: #000;
    }

    .ngrx-info code {
      background: rgba(0,0,0,0.1);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      color: #000;
    }

    .btn-primary {
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 600px) {
      .users-grid {
        grid-template-columns: 1fr;
      }

      .add-todo {
        flex-direction: column;
      }

      .stats, .todos-stats {
        justify-content: center;
      }
    }
  `]
})
export class NgRxDemoComponent {
  private store = inject(Store);

  // Bridge NgRx selectors to signals for template ergonomics
  users = toSignal(this.store.select(selectUsers), { initialValue: [] });
  onlineUsers = toSignal(this.store.select(selectOnlineUsers), { initialValue: [] });
  todos = toSignal(this.store.select(selectTodos), { initialValue: [] });
  completedTodos = toSignal(this.store.select(selectCompletedTodos), { initialValue: [] });
  loading = toSignal(this.store.select(selectLoading), { initialValue: false });

  selectedUserId = '';
  newTodoTitle = '';

  loadMockUsers() {
    this.store.dispatch(loadUsers());
    
    // Simulate API call
    setTimeout(() => {
      const mockUsers: User[] = [
        { id: '1', name: 'Alice Johnson', email: 'alice@example.com', isOnline: true },
        { id: '2', name: 'Bob Smith', email: 'bob@example.com', isOnline: false },
        { id: '3', name: 'Carol Davis', email: 'carol@example.com', isOnline: true },
        { id: '4', name: 'David Wilson', email: 'david@example.com', isOnline: true },
        { id: '5', name: 'Eva Brown', email: 'eva@example.com', isOnline: false }
      ];
      
      this.store.dispatch(loadUsersSuccess({ users: mockUsers }));
    }, 1000);
  }

  addNewTodo() {
    if (!this.selectedUserId || !this.newTodoTitle.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: this.newTodoTitle.trim(),
      completed: false,
      userId: this.selectedUserId
    };

    this.store.dispatch(addTodo({ todo: newTodo }));
    this.newTodoTitle = '';
  }

  toggleTodoStatus(id: string) {
    this.store.dispatch(toggleTodo({ id }));
  }

  getUserName(userId: string): string {
    const user = this.users().find(u => u.id === userId);
    return user?.name || 'Unknown User';
  }

  trackByUserId(index: number, user: User): string {
    return user.id;
  }

  trackByTodoId(index: number, todo: Todo): string {
    return todo.id;
  }
}