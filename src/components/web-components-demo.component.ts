import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule, Puzzle } from 'lucide-angular';
import { registerCustomElements } from '../custom-elements/register';

@Component({
  selector: 'app-web-components-demo',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
template: `
  <div class="web-components-demo">
    <h2>
      <lucide-icon [img]="PuzzleIcon" size="24"></lucide-icon>
      Web Components Demo: Angular Elements & Custom Elements
    </h2>
    
    <div class="demo-section">
      <h3>Native Custom Elements</h3>
      <p>These are native web components that work with any framework:</p>
      
      <!-- Custom Progress Ring -->
      <div class="component-showcase">
        <h4>Custom Progress Ring</h4>
        <custom-progress-ring 
          value="75" 
          max="100"
          size="120"
          stroke-width="8"
          color="#007bff">
        </custom-progress-ring>
        <p>A reusable progress ring component with Shadow DOM styling</p>
      </div>

      <!-- Custom Card Component -->
      <div class="component-showcase">
        <h4>Custom Card Component</h4>
        <custom-card 
          title="Web Components" 
          subtitle="Framework Agnostic"
          theme="primary">
          <p slot="content">
            This card component uses slots for flexible content projection.
            It demonstrates how Shadow DOM encapsulates styles while allowing
            content composition.
          </p>
          <div slot="actions">
            <button class="card-button primary">Learn More</button>
            <button class="card-button secondary">Share</button>
          </div>
        </custom-card>
      </div>

      <!-- Custom Toggle Switch -->
      <div class="component-showcase">
        <h4>Custom Toggle Switch</h4>
        <div class="toggle-demo">
          <custom-toggle 
            id="notifications"
            (toggle)="onToggleChange('notifications', $event)">
          </custom-toggle>
          <label for="notifications">Enable Notifications</label>
        </div>
        <div class="toggle-demo">
          <custom-toggle 
            id="darkmode"
            checked
            (toggle)="onToggleChange('darkmode', $event)">
          </custom-toggle>
          <label for="darkmode">Dark Mode</label>
        </div>
        <p>Status: {{ toggleStates | json }}</p>
      </div>
    </div>

    <div class="demo-section">
      <h3>Angular Elements Integration</h3>
      <p>Angular components can be converted to custom elements using Angular Elements:</p>
      
      <div class="code-example">
        <h4>Creating an Angular Element:</h4>
        <pre ngNonBindable><code>{{ angularElementCode }}</code></pre>
      </div>

      <div class="integration-notes">
        <h4>🔍 Integration Considerations:</h4>
        <ul>
          <li><strong>Shadow DOM:</strong> Encapsulates styles but requires CSS custom properties for theming</li>
          <li><strong>Event Handling:</strong> Use CustomEvent with proper TypeScript typing</li>
          <li><strong>Slots:</strong> Enable flexible content projection patterns</li>
          <li><strong>Lifecycle:</strong> connectedCallback, disconnectedCallback, attributeChangedCallback</li>
          <li><strong>Focus Management:</strong> Handle focus trapping and keyboard navigation</li>
          <li><strong>Accessibility:</strong> Ensure ARIA attributes work across Shadow DOM boundaries</li>
        </ul>
      </div>
    </div>

    <div class="demo-section">
      <h3>Styling Strategies</h3>
      <div class="styling-examples">
        <div class="styling-method">
          <h4>CSS Custom Properties (Recommended)</h4>
          <pre ngNonBindable><code>{{ cssCustomPropsCode }}</code></pre>
        </div>
        
        <div class="styling-method">
          <h4>Part Pseudo-element</h4>
          <pre ngNonBindable><code>{{ cssPartCode }}</code></pre>
        </div>
      </div>
    </div>

    <div class="web-components-info">
      <h4>🔍 Web Components Best Practices:</h4>
      <ul>
        <li><strong>Shadow DOM:</strong> Use for style encapsulation, mind the styling boundaries</li>
        <li><strong>Custom Properties:</strong> Primary method for external styling control</li>
        <li><strong>Events:</strong> Use CustomEvent with detail typing for Angular integration</li>
        <li><strong>Slots:</strong> Enable flexible content composition patterns</li>
        <li><strong>Accessibility:</strong> Ensure focus management and ARIA work across boundaries</li>
        <li><strong>Performance:</strong> Lazy load heavy components, use efficient change detection</li>
      </ul>
    </div>
  </div>
`,

  styles: [`
    .web-components-demo {
      padding: 20px;
      width: 100%;
    }

    .demo-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .component-showcase {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .component-showcase h4 {
      margin-top: 0;
      color: #000;
      border-bottom: 2px solid #007bff;
      padding-bottom: 8px;
    }

    .toggle-demo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 10px 0;
    }

    .toggle-demo label {
      font-weight: 500;
      cursor: pointer;
    }

    .code-example {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }

    .code-example h4 {
      margin-top: 0;
      color: #000;
    }

    .code-example pre {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      border-left: 4px solid #007bff;
    }

    .code-example code {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.4;
    }

    .integration-notes {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }

    .integration-notes h4 {
      margin-top: 0;
      color: #000;
    }

    .integration-notes ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .integration-notes li {
      margin: 8px 0;
    }

    .styling-examples {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin: 15px 0;
    }

    .styling-method {
      background: white;
      padding: 15px;
      border-radius: 8px;
    }

    .styling-method h4 {
      margin-top: 0;
      color: #000;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
    }

    .styling-method pre {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 13px;
    }

    .web-components-info {
      background: #e1f5fe;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #0288d1;
    }

    .web-components-info ul {
      margin: 10px 0;
      padding-left: 20px;
      color: #000;
    }

    .web-components-info code {
      background: rgba(0,0,0,0.1);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      color: #000;
    }

    /* Styles for slotted content */
    .card-button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-right: 8px;
      transition: background-color 0.2s;
    }

    .card-button.primary {
      background: #007bff;
      color: white;
    }

    .card-button.primary:hover {
      background: #0056b3;
    }

    .card-button.secondary {
      background: #6c757d;
      color: white;
    }

    .card-button.secondary:hover {
      background: #545b62;
    }

    @media (max-width: 600px) {
      .styling-examples {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WebComponentsDemoComponent {
  PuzzleIcon = Puzzle;
  
  toggleStates: Record<string, boolean> = {
    notifications: false,
    darkmode: true
  };

  angularElementCode = `// Convert Angular component to custom element
import { createCustomElement } from '@angular/elements';
import { MyComponent } from './my-component';

const customElement = createCustomElement(MyComponent, { injector });
customElements.define('my-custom-element', customElement);

// Use in any framework or vanilla HTML
<my-custom-element 
  [property]="value"
  (customEvent)="handler($event)">
</my-custom-element>`;

  cssCustomPropsCode = `/* Host component defines custom properties */
custom-card {
  --card-bg: #ffffff;
  --card-border: #e0e0e0;
  --card-text: #333333;
  --card-radius: 8px;
}

/* Inside Shadow DOM */
:host {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #ccc);
  color: var(--card-text, #000);
  border-radius: var(--card-radius, 4px);
}`;

  cssPartCode = `/* Expose parts for external styling */
/* Inside component */
<div part="header">Header</div>
<div part="content">Content</div>

/* External styling */
custom-card::part(header) {
  background: #007bff;
  color: white;
}

custom-card::part(content) {
  padding: 20px;
}`;

  constructor(@Inject(PLATFORM_ID) private pid: Object) {
    if (isPlatformBrowser(this.pid)) {
      registerCustomElements();
    }
  }

  onToggleChange(id: string, event: any) {
    this.toggleStates[id] = event.detail.checked;
  }
}
