import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Accessibility } from 'lucide-angular';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  disabled?: boolean;
  submenu?: MenuItem[];
}

interface TabItem {
  id: string;
  label: string;
  content: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-accessibility-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="accessibility-demo">
      <h2><lucide-icon [img]="AccessibilityIcon" size="24"></lucide-icon> Accessibility Demo: A11y Best Practices</h2>
      
      <div class="demo-section">
        <h3>Semantic HTML & ARIA</h3>
        
        <div class="form-example">
          <h4>Accessible Form</h4>
          <form (ngSubmit)="onSubmit()" #accessibleForm="ngForm">
            <div class="form-group">
              <label for="username">Username *</label>
              <input 
                id="username"
                name="username"
                type="text"
                [(ngModel)]="formData.username"
                required
                aria-describedby="username-help username-error"
                [attr.aria-invalid]="usernameInvalid"
                class="form-input"
                #usernameInput>
              <div id="username-help" class="help-text">
                Must be at least 3 characters long
              </div>
              <div 
                id="username-error" 
                class="error-text"
                [attr.aria-live]="usernameInvalid ? 'polite' : null"
                *ngIf="usernameInvalid">
                Username is required and must be at least 3 characters
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email Address *</label>
              <input 
                id="email"
                name="email"
                type="email"
                [(ngModel)]="formData.email"
                required
                aria-describedby="email-help email-error"
                [attr.aria-invalid]="emailInvalid"
                class="form-input">
              <div id="email-help" class="help-text">
                We'll never share your email
              </div>
              <div 
                id="email-error" 
                class="error-text"
                [attr.aria-live]="emailInvalid ? 'polite' : null"
                *ngIf="emailInvalid">
                Please enter a valid email address
              </div>
            </div>

            <fieldset class="form-group">
              <legend>Notification Preferences</legend>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="formData.emailNotifications"
                    name="emailNotifications">
                  <span class="checkmark" aria-hidden="true"></span>
                  Email notifications
                </label>
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="formData.smsNotifications"
                    name="smsNotifications">
                  <span class="checkmark" aria-hidden="true"></span>
                  SMS notifications
                </label>
              </div>
            </fieldset>

            <div class="form-actions">
              <button 
                type="submit" 
                class="btn-primary"
                [disabled]="!accessibleForm.form.valid">
                Submit Form
              </button>
              <button 
                type="button" 
                class="btn-secondary"
                (click)="resetForm(accessibleForm)">
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="demo-section">
        <h3>Keyboard Navigation & Focus Management</h3>
        
        <div class="navigation-example">
          <h4>Accessible Menu with Roving Tabindex</h4>
          <nav 
            class="accessible-menu"
            role="menubar"
            aria-label="Main navigation"
            (keydown)="handleMenuKeydown($event)">
            <button
              *ngFor="let item of menuItems; let i = index"
              [id]="'menu-item-' + item.id"
              class="menu-item"
              role="menuitem"
              [tabindex]="activeMenuIndex === i ? 0 : -1"
              [attr.aria-expanded]="item.submenu ? (expandedMenuId === item.id) : null"
              [attr.aria-haspopup]="item.submenu ? 'true' : null"
              [disabled]="item.disabled"
              (click)="handleMenuClick(item, i)"
              (focus)="activeMenuIndex = i">
              <span class="menu-icon" aria-hidden="true">{{ item.icon }}</span>
              {{ item.label }}
            </button>
          </nav>

          <div 
            *ngIf="expandedMenuId"
            class="submenu"
            role="menu"
            [attr.aria-labelledby]="'menu-item-' + expandedMenuId">
            <button
              *ngFor="let subitem of getSubmenuItems(expandedMenuId)"
              class="submenu-item"
              role="menuitem"
              (click)="handleSubmenuClick(subitem)">
              {{ subitem.label }}
            </button>
          </div>
        </div>

        <div class="tabs-example">
          <h4>Accessible Tab Panel</h4>
          <div class="tab-container">
            <div 
              class="tab-list" 
              role="tablist" 
              aria-label="Content sections"
              (keydown)="handleTabKeydown($event)">
              <button
                *ngFor="let tab of tabItems; let i = index"
                [id]="'tab-' + tab.id"
                class="tab-button"
                role="tab"
                [tabindex]="activeTabIndex === i ? 0 : -1"
                [attr.aria-selected]="activeTabIndex === i"
                [attr.aria-controls]="'panel-' + tab.id"
                [disabled]="tab.disabled"
                (click)="selectTab(i)"
                (focus)="activeTabIndex = i">
                {{ tab.label }}
              </button>
            </div>

            <div
              *ngFor="let tab of tabItems; let i = index"
              [id]="'panel-' + tab.id"
              class="tab-panel"
              role="tabpanel"
              [attr.aria-labelledby]="'tab-' + tab.id"
              [attr.hidden]="activeTabIndex !== i ? true : null"
              tabindex="0">
              <p>{{ tab.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Live Regions & Dynamic Content</h3>
        
        <div class="live-region-example">
          <h4>Status Updates</h4>
          <div class="status-controls">
            <button 
              (click)="addStatusMessage('info')"
              class="btn-primary">
              Add Info Message
            </button>
            <button 
              (click)="addStatusMessage('success')"
              class="btn-success">
              Add Success Message
            </button>
            <button 
              (click)="addStatusMessage('error')"
              class="btn-danger">
              Add Error Message
            </button>
            <button 
              (click)="clearMessages()"
              class="btn-secondary">
              Clear All
            </button>
          </div>

          <!-- Polite live region for non-urgent updates -->
          <div 
            id="status-polite"
            aria-live="polite" 
            aria-atomic="false"
            class="sr-only">
            {{ politeMessage }}
          </div>

          <!-- Assertive live region for urgent updates -->
          <div 
            id="status-assertive"
            aria-live="assertive" 
            aria-atomic="true"
            class="sr-only">
            {{ assertiveMessage }}
          </div>

          <div class="status-messages" aria-label="Status messages">
            <div
              *ngFor="let message of statusMessages; trackBy: trackByMessageId"
              class="status-message"
              [ngClass]="'status-' + message.type"
              role="status">
              <span class="message-icon" aria-hidden="true">{{ getMessageIcon(message.type) }}</span>
              <span class="message-text">{{ message.text }}</span>
              <button 
                class="close-button"
                (click)="removeMessage(message.id)"
                aria-label="Close message">
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Focus Trapping Modal</h3>
        
        <button 
          (click)="openModal()"
          class="btn-primary">
          Open Accessible Modal
        </button>

        <div 
          *ngIf="isModalOpen"
          class="modal-overlay"
          (click)="closeModal()"
          (keydown)="handleModalKeydown($event)">
          
          <div 
            class="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            (click)="$event.stopPropagation()"
            #modalContent>
            
            <div class="modal-header">
              <h3 id="modal-title">Accessible Modal Dialog</h3>
              <button 
                class="close-button"
                (click)="closeModal()"
                aria-label="Close modal"
                #modalCloseButton>
                ×
              </button>
            </div>
            
            <div class="modal-body">
              <p id="modal-description">
                This modal demonstrates proper focus management, keyboard navigation,
                and ARIA attributes for accessibility.
              </p>
              
              <div class="modal-form">
                <label for="modal-input">Enter some text:</label>
                <input 
                  id="modal-input"
                  type="text"
                  class="form-input"
                  [(ngModel)]="modalInputValue"
                  #modalInput>
              </div>
            </div>
            
            <div class="modal-footer">
              <button 
                class="btn-primary"
                (click)="saveModal()">
                Save Changes
              </button>
              <button 
                class="btn-secondary"
                (click)="closeModal()">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="accessibility-info">
        <h4>♿ Accessibility Features Demonstrated:</h4>
        <ul>
          <li><strong>Semantic HTML:</strong> Proper use of headings, labels, fieldsets, and landmarks</li>
          <li><strong>ARIA Attributes:</strong> roles, properties, and states for enhanced semantics</li>
          <li><strong>Keyboard Navigation:</strong> Full keyboard support with logical tab order</li>
          <li><strong>Focus Management:</strong> Visible focus indicators and focus trapping</li>
          <li><strong>Live Regions:</strong> Dynamic content announcements for screen readers</li>
          <li><strong>Form Accessibility:</strong> Proper labeling, validation, and error handling</li>
          <li><strong>Roving Tabindex:</strong> Efficient keyboard navigation in composite widgets</li>
          <li><strong>Color Independence:</strong> Information not conveyed by color alone</li>
        </ul>
        
        <div class="testing-tools">
          <h4>🔧 Recommended Testing Tools:</h4>
          <ul>
            <li><strong>axe-core:</strong> Automated accessibility testing</li>
            <li><strong>NVDA/JAWS:</strong> Screen reader testing</li>
            <li><strong>Keyboard Only:</strong> Navigate without mouse</li>
            <li><strong>High Contrast:</strong> Test with high contrast mode</li>
            <li><strong>Color Blindness:</strong> Test with color vision simulators</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .accessibility-demo {
      padding: 20px;
      width: 100%;
    }

    .demo-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .form-example {
      background: white;
      padding: 20px;
      border-radius: 8px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 5px;
      color: #000;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
      background: white;
      color: #000;
    }

    .form-input[aria-invalid="true"] {
      border-color: #dc3545;
      background: white;
      color: #000;
    }

    .form-input[aria-invalid="true"]:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
      background: white;
      color: #000;
    }

    .help-text {
      font-size: 14px;
      color: #000;
      margin-top: 5px;
    }

    .error-text {
      font-size: 14px;
      color: #dc3545;
      margin-top: 5px;
      font-weight: 500;
    }

    fieldset {
      border: 2px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      margin: 0;
    }

    legend {
      font-weight: 600;
      padding: 0 10px;
      color: #000;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-weight: normal;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .navigation-example {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .accessible-menu {
      display: flex;
      gap: 2px;
      background: #e9ecef;
      padding: 4px;
      border-radius: 6px;
      margin-bottom: 10px;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .menu-item:hover:not(:disabled) {
      background: #dee2e6;
    }

    .menu-item:focus {
      outline: 2px solid #007bff;
      outline-offset: 2px;
      background: #dee2e6;
    }

    .menu-item:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .menu-item[aria-expanded="true"] {
      background: #007bff;
      color: white;
    }

    .menu-icon {
      font-size: 16px;
    }

    .submenu {
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      padding: 4px;
    }

    .submenu-item {
      display: block;
      width: 100%;
      padding: 8px 12px;
      background: transparent;
      border: none;
      text-align: left;
      cursor: pointer;
      border-radius: 2px;
      transition: background-color 0.2s;
    }

    .submenu-item:hover {
      background: #f8f9fa;
    }

    .submenu-item:focus {
      outline: 2px solid #007bff;
      outline-offset: 1px;
      background: #f8f9fa;
    }

    .tabs-example {
      background: white;
      padding: 20px;
      border-radius: 8px;
    }

    .tab-container {
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .tab-list {
      display: flex;
      background: #f8f9fa;
      border-bottom: 1px solid #ddd;
    }

    .tab-button {
      padding: 12px 20px;
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .tab-button:hover:not(:disabled) {
      background: #e9ecef;
    }

    .tab-button:focus {
      outline: 2px solid #007bff;
      outline-offset: -2px;
    }

    .tab-button[aria-selected="true"] {
      background: white;
      border-bottom-color: #007bff;
      font-weight: 600;
    }

    .tab-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tab-panel {
      padding: 20px;
      background: white;
    }

    .tab-panel:focus {
      outline: 2px solid #007bff;
      outline-offset: -2px;
    }

    .live-region-example {
      background: white;
      padding: 20px;
      border-radius: 8px;
    }

    .status-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .status-messages {
      min-height: 100px;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
    }

    .status-message {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 10px;
    }

    .status-info {
      background: #d1ecf1;
      border-left: 4px solid #17a2b8;
      color: #0c5460;
    }

    .status-success {
      background: #d4edda;
      border-left: 4px solid #28a745;
      color: #155724;
    }

    .status-error {
      background: #f8d7da;
      border-left: 4px solid #dc3545;
      color: #721c24;
    }

    .message-text {
      flex: 1;
    }

    .close-button {
      background: transparent;
      border: none;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;
    }

    .close-button:hover {
      background: rgba(0,0,0,0.1);
    }

    .close-button:focus {
      outline: 2px solid #007bff;
      outline-offset: 1px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #ddd;
    }

    .modal-header h3 {
      margin: 0;
      color: #000;
    }

    .modal-body {
      padding: 20px;
    }

    .modal-form {
      margin-top: 15px;
    }

    .modal-form label {
      display: block;
      font-weight: 600;
      margin-bottom: 5px;
      color: #000;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 20px;
      border-top: 1px solid #ddd;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .accessibility-info {
      background: #e8f5e8;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #28a745;
    }

    .testing-tools {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(0,0,0,0.1);
    }

    .accessibility-info ul {
      margin: 10px 0;
      padding-left: 20px;
      color: #000;
    }

    .accessibility-info code {
      background: rgba(0,0,0,0.1);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      color: #000;
    }

    .btn-primary, .btn-secondary, .btn-success, .btn-danger {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
      font-weight: 500;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-primary:focus {
      outline: 2px solid #007bff;
      outline-offset: 2px;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #545b62;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover {
      background: #218838;
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
      .accessible-menu {
        flex-direction: column;
      }

      .tab-list {
        flex-direction: column;
      }

      .status-controls {
        flex-direction: column;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AccessibilityDemoComponent implements OnInit {
  @ViewChild('modalContent') modalContent!: ElementRef;
  AccessibilityIcon = Accessibility;
  @ViewChild('modalCloseButton') modalCloseButton!: ElementRef;
  @ViewChild('modalInput') modalInput!: ElementRef;

  // Form data
  formData = {
    username: '',
    email: '',
    emailNotifications: false,
    smsNotifications: true
  };

  // Menu navigation
  menuItems: MenuItem[] = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'products', label: 'Products', icon: '📦', submenu: [
      { id: 'electronics', label: 'Electronics', icon: '💻' },
      { id: 'clothing', label: 'Clothing', icon: '👕' },
      { id: 'books', label: 'Books', icon: '📚' }
    ]},
    { id: 'services', label: 'Services', icon: '🛠️', submenu: [
      { id: 'support', label: 'Support', icon: '💬' },
      { id: 'consulting', label: 'Consulting', icon: '🎯' }
    ]},
    { id: 'about', label: 'About', icon: 'ℹ️' },
    { id: 'contact', label: 'Contact', icon: '📞', disabled: true }
  ];

  activeMenuIndex = 0;
  expandedMenuId: string | null = null;

  // Tab navigation
  tabItems: TabItem[] = [
    { 
      id: 'overview', 
      label: 'Overview', 
      content: 'This is the overview tab content. It provides a general introduction to the topic and sets the context for the detailed information in other tabs.' 
    },
    { 
      id: 'details', 
      label: 'Details', 
      content: 'Here you\'ll find detailed information about the subject. This includes technical specifications, in-depth analysis, and comprehensive explanations.' 
    },
    { 
      id: 'examples', 
      label: 'Examples', 
      content: 'This tab contains practical examples and use cases. These examples help illustrate the concepts and provide real-world applications.' 
    },
    { 
      id: 'resources', 
      label: 'Resources', 
      content: 'Additional resources, links, and references can be found here. This includes documentation, tutorials, and external links for further learning.',
      disabled: true 
    }
  ];

  activeTabIndex = 0;

  // Live regions
  statusMessages: Array<{id: string, type: 'info' | 'success' | 'error', text: string}> = [];
  politeMessage = '';
  assertiveMessage = '';
  private messageCounter = 0;

  // Modal
  isModalOpen = false;
  modalInputValue = '';
  private previousActiveElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  ngOnInit() {
    // Initialize with some sample messages
    this.addStatusMessage('info');
  }

  // Form validation
  get usernameInvalid(): boolean {
    return this.formData.username.length > 0 && this.formData.username.length < 3;
  }

  get emailInvalid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.formData.email.length > 0 && !emailRegex.test(this.formData.email);
  }

  onSubmit() {
    if (!this.usernameInvalid && !this.emailInvalid && this.formData.username && this.formData.email) {
      this.addStatusMessage('success');
      this.assertiveMessage = 'Form submitted successfully!';
      setTimeout(() => this.assertiveMessage = '', 3000);
    }
  }

  resetForm(form: any) {
    form.resetForm();
    this.formData = {
      username: '',
      email: '',
      emailNotifications: false,
      smsNotifications: true
    };
    this.politeMessage = 'Form has been reset';
    setTimeout(() => this.politeMessage = '', 3000);
  }

  // Menu navigation
  handleMenuKeydown(event: KeyboardEvent) {
    const menuItems = Array.from(document.querySelectorAll('.menu-item:not([disabled])')) as HTMLElement[];
    
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.activeMenuIndex = (this.activeMenuIndex + 1) % menuItems.length;
        menuItems[this.activeMenuIndex].focus();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.activeMenuIndex = this.activeMenuIndex === 0 ? menuItems.length - 1 : this.activeMenuIndex - 1;
        menuItems[this.activeMenuIndex].focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        const currentItem = this.menuItems[this.activeMenuIndex];
        this.handleMenuClick(currentItem, this.activeMenuIndex);
        break;
      case 'Escape':
        this.expandedMenuId = null;
        break;
    }
  }

  handleMenuClick(item: MenuItem, index: number) {
    if (item.disabled) return;
    
    this.activeMenuIndex = index;
    
    if (item.submenu) {
      this.expandedMenuId = this.expandedMenuId === item.id ? null : item.id;
    } else {
      this.expandedMenuId = null;
      this.politeMessage = `Navigated to ${item.label}`;
      setTimeout(() => this.politeMessage = '', 3000);
    }
  }

  handleSubmenuClick(item: MenuItem) {
    this.expandedMenuId = null;
    this.politeMessage = `Navigated to ${item.label}`;
    setTimeout(() => this.politeMessage = '', 3000);
  }

  getSubmenuItems(menuId: string): MenuItem[] {
    const menu = this.menuItems.find(item => item.id === menuId);
    return menu?.submenu || [];
  }

  // Tab navigation
  handleTabKeydown(event: KeyboardEvent) {
    const tabButtons = Array.from(document.querySelectorAll('.tab-button:not([disabled])')) as HTMLElement[];
    
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.activeTabIndex = (this.activeTabIndex + 1) % tabButtons.length;
        this.selectTab(this.activeTabIndex);
        tabButtons[this.activeTabIndex].focus();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.activeTabIndex = this.activeTabIndex === 0 ? tabButtons.length - 1 : this.activeTabIndex - 1;
        this.selectTab(this.activeTabIndex);
        tabButtons[this.activeTabIndex].focus();
        break;
      case 'Home':
        event.preventDefault();
        this.activeTabIndex = 0;
        this.selectTab(0);
        tabButtons[0].focus();
        break;
      case 'End':
        event.preventDefault();
        this.activeTabIndex = tabButtons.length - 1;
        this.selectTab(this.activeTabIndex);
        tabButtons[this.activeTabIndex].focus();
        break;
    }
  }

  selectTab(index: number) {
    if (this.tabItems[index]?.disabled) return;
    
    this.activeTabIndex = index;
    this.politeMessage = `Selected ${this.tabItems[index].label} tab`;
    setTimeout(() => this.politeMessage = '', 2000);
  }

  // Live regions
  addStatusMessage(type: 'info' | 'success' | 'error') {
    this.messageCounter++;
    const messages = {
      info: `Information message ${this.messageCounter}: This is an informational update.`,
      success: `Success message ${this.messageCounter}: Operation completed successfully!`,
      error: `Error message ${this.messageCounter}: Something went wrong, please try again.`
    };

    const message = {
      id: `msg-${this.messageCounter}`,
      type,
      text: messages[type]
    };

    this.statusMessages.push(message);

    // Update appropriate live region
    if (type === 'error') {
      this.assertiveMessage = message.text;
      setTimeout(() => this.assertiveMessage = '', 5000);
    } else {
      this.politeMessage = message.text;
      setTimeout(() => this.politeMessage = '', 3000);
    }

    // Auto-remove after 10 seconds
    setTimeout(() => {
      this.removeMessage(message.id);
    }, 10000);
  }

  removeMessage(id: string) {
    this.statusMessages = this.statusMessages.filter(msg => msg.id !== id);
  }

  clearMessages() {
    this.statusMessages = [];
    this.politeMessage = 'All messages cleared';
    setTimeout(() => this.politeMessage = '', 2000);
  }

  getMessageIcon(type: string): string {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌'
    };
    return icons[type as keyof typeof icons] || 'ℹ️';
  }

  trackByMessageId(index: number, message: any): string {
    return message.id;
  }

  // Modal focus management
  openModal() {
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.isModalOpen = true;
    
    setTimeout(() => {
      this.setupFocusTrap();
      this.modalCloseButton.nativeElement.focus();
    }, 100);
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalInputValue = '';
    
    // Restore focus to the element that opened the modal
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }

  saveModal() {
    this.politeMessage = `Modal saved with value: ${this.modalInputValue}`;
    this.closeModal();
    setTimeout(() => this.politeMessage = '', 3000);
  }

  handleModalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private setupFocusTrap() {
    const modal = this.modalContent.nativeElement;
    this.focusableElements = Array.from(
      modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el: any) => !el.disabled && !el.hidden) as HTMLElement[];
  }

  private trapFocus(event: KeyboardEvent) {
    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
}