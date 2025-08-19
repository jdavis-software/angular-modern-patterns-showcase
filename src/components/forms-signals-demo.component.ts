import { Component, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith, combineLatest } from 'rxjs';

interface UserFormModel {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    age: number;
  };
  preferences: {
    newsletter: boolean;
    notifications: string;
    theme: string;
  };
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string[]>;
  touchedFields: string[];
  dirtyFields: string[];
  validationProgress: number;
}

@Component({
  selector: 'app-forms-signals-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="forms-signals-demo">
      <h2>📝 Forms + Signals Demo: Typed Models & Derived Validity</h2>
      
      <div class="demo-section">
        <h3>Real-time Form Validation Dashboard</h3>
        
        <div class="validation-dashboard">
          <div class="validation-metrics">
            <div class="metric-card" [class.valid]="formValidation().isValid">
              <div class="metric-icon">{{ formValidation().isValid ? '✅' : '❌' }}</div>
              <div class="metric-label">Form Status</div>
              <div class="metric-value">{{ formValidation().isValid ? 'Valid' : 'Invalid' }}</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">📊</div>
              <div class="metric-label">Validation Progress</div>
              <div class="metric-value">{{ formValidation().validationProgress }}%</div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="formValidation().validationProgress"></div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">✏️</div>
              <div class="metric-label">Fields Touched</div>
              <div class="metric-value">{{ formValidation().touchedFields.length }}/{{ totalFields() }}</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">🔄</div>
              <div class="metric-label">Fields Modified</div>
              <div class="metric-value">{{ formValidation().dirtyFields.length }}/{{ totalFields() }}</div>
            </div>
          </div>

          <div class="form-preview" *ngIf="formData()">
            <h4>Live Form Data Preview</h4>
            <pre class="json-preview">{{ formData() | json }}</pre>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Typed Reactive Form with Signal Integration</h3>
        
        <form [formGroup]="userForm" class="typed-form">
          <!-- Personal Information Section -->
          <fieldset class="form-section">
            <legend>Personal Information</legend>
            <div formGroupName="personalInfo" class="form-grid">
              <div class="form-field">
                <label for="firstName">First Name *</label>
                <input 
                  id="firstName"
                  formControlName="firstName"
                  type="text"
                  class="form-input"
                  [class.error]="hasError('personalInfo.firstName')"
                  [class.success]="isValid('personalInfo.firstName')">
                <div class="field-status">
                  <span *ngIf="hasError('personalInfo.firstName')" class="error-message">
                    {{ getErrorMessage('personalInfo.firstName') }}
                  </span>
                  <span *ngIf="isValid('personalInfo.firstName')" class="success-message">
                    ✓ Valid
                  </span>
                </div>
              </div>

              <div class="form-field">
                <label for="lastName">Last Name *</label>
                <input 
                  id="lastName"
                  formControlName="lastName"
                  type="text"
                  class="form-input"
                  [class.error]="hasError('personalInfo.lastName')"
                  [class.success]="isValid('personalInfo.lastName')">
                <div class="field-status">
                  <span *ngIf="hasError('personalInfo.lastName')" class="error-message">
                    {{ getErrorMessage('personalInfo.lastName') }}
                  </span>
                  <span *ngIf="isValid('personalInfo.lastName')" class="success-message">
                    ✓ Valid
                  </span>
                </div>
              </div>

              <div class="form-field">
                <label for="email">Email Address *</label>
                <input 
                  id="email"
                  formControlName="email"
                  type="email"
                  class="form-input"
                  [class.error]="hasError('personalInfo.email')"
                  [class.success]="isValid('personalInfo.email')">
                <div class="field-status">
                  <span *ngIf="hasError('personalInfo.email')" class="error-message">
                    {{ getErrorMessage('personalInfo.email') }}
                  </span>
                  <span *ngIf="isValid('personalInfo.email')" class="success-message">
                    ✓ Valid email format
                  </span>
                </div>
              </div>

              <div class="form-field">
                <label for="age">Age *</label>
                <input 
                  id="age"
                  formControlName="age"
                  type="number"
                  min="18"
                  max="120"
                  class="form-input"
                  [class.error]="hasError('personalInfo.age')"
                  [class.success]="isValid('personalInfo.age')">
                <div class="field-status">
                  <span *ngIf="hasError('personalInfo.age')" class="error-message">
                    {{ getErrorMessage('personalInfo.age') }}
                  </span>
                  <span *ngIf="isValid('personalInfo.age')" class="success-message">
                    ✓ Valid age
                  </span>
                </div>
              </div>
            </div>
          </fieldset>

          <!-- Preferences Section -->
          <fieldset class="form-section">
            <legend>Preferences</legend>
            <div formGroupName="preferences" class="form-grid">
              <div class="form-field checkbox-field">
                <label class="checkbox-label">
                  <input 
                    formControlName="newsletter"
                    type="checkbox"
                    class="checkbox-input">
                  <span class="checkmark"></span>
                  Subscribe to newsletter
                </label>
              </div>

              <div class="form-field">
                <label for="notifications">Notification Frequency</label>
                <select 
                  id="notifications"
                  formControlName="notifications"
                  class="form-select">
                  <option value="never">Never</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                  <option value="immediate">Immediate</option>
                </select>
              </div>

              <div class="form-field">
                <label for="theme">Preferred Theme</label>
                <select 
                  id="theme"
                  formControlName="theme"
                  class="form-select">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </fieldset>

          <!-- Address Section -->
          <fieldset class="form-section">
            <legend>Address Information</legend>
            <div formGroupName="address" class="form-grid">
              <div class="form-field full-width">
                <label for="street">Street Address *</label>
                <input 
                  id="street"
                  formControlName="street"
                  type="text"
                  class="form-input"
                  [class.error]="hasError('address.street')"
                  [class.success]="isValid('address.street')">
                <div class="field-status">
                  <span *ngIf="hasError('address.street')" class="error-message">
                    {{ getErrorMessage('address.street') }}
                  </span>
                  <span *ngIf="isValid('address.street')" class="success-message">
                    ✓ Valid
                  </span>
                </div>
              </div>

              <div class="form-field">
                <label for="city">City *</label>
                <input 
                  id="city"
                  formControlName="city"
                  type="text"
                  class="form-input"
                  [class.error]="hasError('address.city')"
                  [class.success]="isValid('address.city')">
                <div class="field-status">
                  <span *ngIf="hasError('address.city')" class="error-message">
                    {{ getErrorMessage('address.city') }}
                  </span>
                  <span *ngIf="isValid('address.city')" class="success-message">
                    ✓ Valid
                  </span>
                </div>
              </div>

              <div class="form-field">
                <label for="zipCode">ZIP Code *</label>
                <input 
                  id="zipCode"
                  formControlName="zipCode"
                  type="text"
                  class="form-input"
                  [class.error]="hasError('address.zipCode')"
                  [class.success]="isValid('address.zipCode')">
                <div class="field-status">
                  <span *ngIf="hasError('address.zipCode')" class="error-message">
                    {{ getErrorMessage('address.zipCode') }}
                  </span>
                  <span *ngIf="isValid('address.zipCode')" class="success-message">
                    ✓ Valid ZIP
                  </span>
                </div>
              </div>

              <div class="form-field">
                <label for="country">Country *</label>
                <select 
                  id="country"
                  formControlName="country"
                  class="form-select"
                  [class.error]="hasError('address.country')"
                  [class.success]="isValid('address.country')">
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="AU">Australia</option>
                </select>
                <div class="field-status">
                  <span *ngIf="hasError('address.country')" class="error-message">
                    {{ getErrorMessage('address.country') }}
                  </span>
                  <span *ngIf="isValid('address.country')" class="success-message">
                    ✓ Valid
                  </span>
                </div>
              </div>
            </div>
          </fieldset>

          <div class="form-actions">
            <button 
              type="button"
              (click)="resetForm()"
              class="btn-secondary">
              Reset Form
            </button>
            <button 
              type="button"
              (click)="fillSampleData()"
              class="btn-secondary">
              Fill Sample Data
            </button>
            <button 
              type="button"
              (click)="submitForm()"
              [disabled]="!formValidation().isValid"
              class="btn-primary">
              Submit Form
            </button>
          </div>
        </form>
      </div>

      <div class="forms-info">
        <h4>📝 Forms + Signals Patterns Demonstrated:</h4>
        <ul>
          <li><strong>Typed Form Models:</strong> Strongly typed interfaces for form structure</li>
          <li><strong>Signal Integration:</strong> Converting form streams to signals with <code>toSignal()</code></li>
          <li><strong>Derived Validity:</strong> Computed validation state from form changes</li>
          <li><strong>Real-time Feedback:</strong> Instant validation and progress tracking</li>
          <li><strong>Nested Form Groups:</strong> Complex form structure with type safety</li>
          <li><strong>Custom Validators:</strong> Business logic validation with clear error messages</li>
          <li><strong>Form State Management:</strong> Tracking touched, dirty, and validation states</li>
          <li><strong>Reactive Updates:</strong> Live preview of form data changes</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .forms-signals-demo {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .demo-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .validation-dashboard {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .validation-metrics {
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
      border-left: 4px solid #dc3545;
      transition: border-color 0.3s;
    }

    .metric-card.valid {
      border-left-color: #28a745;
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

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      margin-top: 8px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #28a745);
      transition: width 0.3s ease;
    }

    .form-preview {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-preview h4 {
      margin-top: 0;
      color: #000;
    }

    .json-preview {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      color: #000;
    }

    .typed-form {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-section {
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .form-section legend {
      font-weight: 600;
      font-size: 1.1rem;
      color: #000;
      padding: 0 10px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-field label {
      font-weight: 500;
      margin-bottom: 5px;
      color: #000;
    }

    .form-input, .form-select {
      padding: 10px 12px;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
    }

    .form-input.error, .form-select.error {
      border-color: #dc3545;
    }

    .form-input.error:focus, .form-select.error:focus {
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
    }

    .form-input.success, .form-select.success {
      border-color: #28a745;
    }

    .form-input.success:focus, .form-select.success:focus {
      box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.25);
    }

    .checkbox-field {
      flex-direction: row;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-weight: normal;
    }

    .checkbox-input {
      width: 18px;
      height: 18px;
    }

    .field-status {
      margin-top: 5px;
      min-height: 20px;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      font-weight: 500;
    }

    .success-message {
      color: #28a745;
      font-size: 12px;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }

    .btn-primary, .btn-secondary {
      padding: 10px 20px;
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

    .forms-info {
      background: #e8f5e8;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #28a745;
    }

    .forms-info ul {
      margin: 10px 0;
      padding-left: 20px;
      color: #000;
    }

    .forms-info code {
      background: rgba(0,0,0,0.1);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      color: #000;
    }

    @media (max-width: 768px) {
      .validation-dashboard {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class FormsSignalsDemoComponent {
  // Typed reactive form
  userForm = new FormGroup({
    personalInfo: new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      age: new FormControl<number | null>(null, [Validators.required, Validators.min(18), Validators.max(120)])
    }),
    preferences: new FormGroup({
      newsletter: new FormControl(false),
      notifications: new FormControl('weekly'),
      theme: new FormControl('light')
    }),
    address: new FormGroup({
      street: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]),
      country: new FormControl('', [Validators.required])
    })
  });

  // Convert form streams to signals
  formData = toSignal(
    this.userForm.valueChanges.pipe(
      startWith(this.userForm.value)
    ),
    { initialValue: this.userForm.value }
  );

  formStatus = toSignal(
    this.userForm.statusChanges.pipe(
      startWith(this.userForm.status)
    ),
    { initialValue: this.userForm.status }
  );

  // Computed validation state
  formValidation = computed(() => {
    const form = this.userForm;
    const allControls = this.getAllControls(form);
    const totalControls = allControls.length;
    const validControls = allControls.filter(control => control.valid).length;
    
    const touchedFields: string[] = [];
    const dirtyFields: string[] = [];
    
    // Collect touched and dirty field paths
    this.collectFieldStates(form, touchedFields, dirtyFields, '');

    const errors: Record<string, string[]> = {};
    this.collectErrors(form, errors, '');

    return {
      isValid: form.valid,
      errors,
      touchedFields,
      dirtyFields,
      validationProgress: Math.round((validControls / totalControls) * 100)
    } as FormValidationState;
  });

  totalFields = computed(() => this.getAllControls(this.userForm).length);

  // Effect to log form changes (moved to class property for proper injection context)
  private formEffect = effect(() => {
    console.log('📝 Form validation state:', this.formValidation());
    console.log('📊 Form data:', this.formData());
  });

  private getAllControls(formGroup: FormGroup): AbstractControl[] {
    let controls: AbstractControl[] = [];
    
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        controls = controls.concat(this.getAllControls(control));
      } else if (control) {
        controls.push(control);
      }
    });
    
    return controls;
  }

  private collectErrors(formGroup: FormGroup, errors: Record<string, string[]>, prefix: string) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (control instanceof FormGroup) {
        this.collectErrors(control, errors, fullKey);
      } else if (control && control.errors && control.touched) {
        errors[fullKey] = Object.keys(control.errors);
      }
    });
  }

  private collectFieldStates(formGroup: FormGroup, touchedFields: string[], dirtyFields: string[], prefix: string) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (control instanceof FormGroup) {
        this.collectFieldStates(control, touchedFields, dirtyFields, fullKey);
      } else if (control) {
        if (control.touched) {
          touchedFields.push(fullKey);
        }
        if (control.dirty) {
          dirtyFields.push(fullKey);
        }
      }
    });
  }
  hasError(fieldPath: string): boolean {
    const control = this.userForm.get(fieldPath);
    return !!(control && control.errors && control.touched);
  }

  isValid(fieldPath: string): boolean {
    const control = this.userForm.get(fieldPath);
    return !!(control && control.valid && control.touched);
  }

  getErrorMessage(fieldPath: string): string {
    const control = this.userForm.get(fieldPath);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) return 'Please enter a valid format';
    
    return 'Invalid input';
  }

  resetForm() {
    this.userForm.reset();
    // Reset to default values
    this.userForm.patchValue({
      preferences: {
        newsletter: false,
        notifications: 'weekly',
        theme: 'light'
      }
    });
  }

  fillSampleData() {
    this.userForm.patchValue({
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        age: 30
      },
      preferences: {
        newsletter: true,
        notifications: 'daily',
        theme: 'dark'
      },
      address: {
        street: '123 Main Street',
        city: 'New York',
        zipCode: '10001',
        country: 'US'
      }
    });
    
    // Mark all fields as touched to show validation
    this.userForm.markAllAsTouched();
  }

  submitForm() {
    if (this.userForm.valid) {
      const formData = this.userForm.value as UserFormModel;
      console.log('✅ Form submitted:', formData);
      alert('Form submitted successfully! Check the console for details.');
    }
  }
}