import "@angular/compiler";
import { Component, OnInit } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideStore } from "@ngrx/store";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { CommonModule } from "@angular/common";
import { appReducer } from "./store/app.state";
import { SignalsDemoComponent } from "./components/signals-demo.component";
import { NgRxDemoComponent } from "./components/ngrx-demo.component";
import { RxJSDemoComponent } from "./components/rxjs-demo.component";
import { WebComponentsDemoComponent } from "./components/web-components-demo.component";
import { PerformanceDemoComponent } from "./components/performance-demo.component";
import { AccessibilityDemoComponent } from "./components/accessibility-demo.component";
import { FormsSignalsDemoComponent } from "./components/forms-signals-demo.component";
import { SSRHydrationDemoComponent } from "./components/ssr-hydration-demo.component";
import { RouterSignalsDemoComponent } from "./components/router-signals-demo.component";
import { PerformanceLabDemoComponent } from "./components/performance-lab-demo.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    SignalsDemoComponent,
    NgRxDemoComponent,
    RxJSDemoComponent,
    WebComponentsDemoComponent,
    PerformanceDemoComponent,
    AccessibilityDemoComponent,
    FormsSignalsDemoComponent,
    SSRHydrationDemoComponent,
    RouterSignalsDemoComponent,
    PerformanceLabDemoComponent,
  ],
  template: `
    <div class="showcase-app">
      <!-- Left Sidebar Navigation -->
      <nav class="sidebar-nav">
        <div class="sidebar-header">
          <h2>🚀 Angular Patterns</h2>
        </div>
        <div class="nav-sections">
          <a
            *ngFor="let section of sections"
            (click)="scrollToSection(section.id)"
            class="nav-link"
            [class.active]="activeSection === section.id"
            href="#{{ section.id }}"
          >
            <span class="nav-icon">{{ section.icon }}</span>
            <span class="nav-text">{{ section.title }}</span>
          </a>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="app-main">
        <header class="page-header">
          <h1>Angular Modern Patterns Showcase</h1>
          <p class="page-subtitle">
            Comprehensive examples: Signals, NgRx, RxJS, Web Components, Forms,
            SSR, Router, Performance Lab & Accessibility
          </p>
        </header>

        <section id="signals" class="showcase-section">
          <app-signals-demo></app-signals-demo>
        </section>

        <section id="ngrx" class="showcase-section">
          <app-ngrx-demo></app-ngrx-demo>
        </section>

        <section id="rxjs" class="showcase-section">
          <app-rxjs-demo></app-rxjs-demo>
        </section>

        <section id="web-components" class="showcase-section">
          <app-web-components-demo></app-web-components-demo>
        </section>

        <section id="performance" class="showcase-section">
          <app-performance-demo></app-performance-demo>
        </section>

        <section id="accessibility" class="showcase-section">
          <app-accessibility-demo></app-accessibility-demo>
        </section>

        <section id="forms-signals" class="showcase-section">
          <app-forms-signals-demo></app-forms-signals-demo>
        </section>

        <section id="ssr-hydration" class="showcase-section">
          <app-ssr-hydration-demo></app-ssr-hydration-demo>
        </section>

        <section id="router-signals" class="showcase-section">
          <app-router-signals-demo></app-router-signals-demo>
        </section>

        <section id="performance-lab" class="showcase-section">
          <app-performance-lab-demo></app-performance-lab-demo>
        </section>

        <section id="key-takeaways" class="showcase-section">
          <div class="key-takeaways-section">
            <h2>🎯 Key Takeaways for Your Article</h2>
            <div class="takeaways-grid">
              <div class="takeaway-card">
                <h4>🎯 Signals vs NgRx</h4>
                <p>
                  Signals for fine-grained local reactivity; NgRx for app-wide
                  state and complex effects
                </p>
              </div>
              <div class="takeaway-card">
                <h4>🌊 When to Use RxJS</h4>
                <p>
                  External streams, backpressure, multicasting, complex async
                  composition
                </p>
              </div>
              <div class="takeaway-card">
                <h4>🧩 Web Components</h4>
                <p>
                  Angular Elements for creation; mind Shadow DOM styling and event
                  contracts
                </p>
              </div>
              <div class="takeaway-card">
                <h4>⚡ Performance</h4>
                <p>
                  TrackBy, memoization, OnPush, defer non-critical work, measure
                  with DevTools
                </p>
              </div>
              <div class="takeaway-card">
                <h4>♿ Accessibility</h4>
                <p>
                  Semantic HTML first, roving tabindex, visible focus, Axe testing
                </p>
              </div>
              <div class="takeaway-card">
                <h4>📝 Forms + Signals</h4>
                <p>
                  Typed models, derived validity, real-time validation with signals
                </p>
              </div>
              <div class="takeaway-card">
                <h4>🚀 SSR & Hydration</h4>
                <p>
                  Platform detection, consistent rendering, performance optimization
                </p>
              </div>
              <div class="takeaway-card">
                <h4>🧭 Router + Signals</h4>
                <p>
                  Signal-based routing, prefetch strategies, performance monitoring
                </p>
              </div>
              <div class="takeaway-card">
                <h4>⚡ Performance Lab</h4>
                <p>
                  Render strategy comparison, real-time metrics, optimization techniques
                </p>
              </div>
            </div>

            <div class="article-note">
              <p>
                💡 <strong>Pro tip:</strong> Each demo includes detailed
                explanations and best practices. Use the browser DevTools to
                inspect the implementation details and see the patterns in action!
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .showcase-app {
      display: flex;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .sidebar-nav {
      width: 280px;
      background: white;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      position: fixed;
      height: 100vh;
      overflow-y: auto;
      z-index: 100;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .nav-sections {
      padding: 20px 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: #495057;
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }

    .nav-link:hover {
      background: #f8f9fa;
      color: #007bff;
      border-left-color: #007bff;
    }

    .nav-link.active {
      background: #e3f2fd;
      color: #1976d2;
      border-left-color: #1976d2;
      font-weight: 500;
    }

    .nav-icon {
      font-size: 1.2rem;
      width: 24px;
      text-align: center;
    }

    .nav-text {
      font-size: 0.95rem;
    }

    .app-main {
      flex: 1;
      margin-left: 280px;
      padding: 0;
    }

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    .page-header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .page-subtitle {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
      max-width: 800px;
      margin: 0 auto;
    }

    .showcase-section {
      margin: 0;
    }

    .key-takeaways-section {
      padding: 40px;
      background: white;
    }

    .key-takeaways-section h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #000;
    }

    .takeaways-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .takeaway-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #007bff;
      transition: transform 0.2s ease;
    }

    .takeaway-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .takeaway-card h4 {
      margin: 0 0 10px 0;
      color: #000;
    }

    .takeaway-card p {
      margin: 0;
      color: #000;
      line-height: 1.5;
    }

    .article-note {
      background: #e8f5e8;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #28a745;
      text-align: center;
    }

    .article-note p {
      margin: 0;
      color: #000;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .sidebar-nav {
        width: 100%;
        height: auto;
        position: relative;
      }

      .app-main {
        margin-left: 0;
      }

      .nav-sections {
        display: flex;
        overflow-x: auto;
        padding: 10px;
      }

      .nav-link {
        white-space: nowrap;
        min-width: 120px;
        justify-content: center;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .takeaways-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class App implements OnInit {
  activeSection = "signals";

  sections: { id: string; title: string; icon: string }[] = [
    { id: "signals", title: "Signals", icon: "📶" },
    { id: "ngrx", title: "NgRx", icon: "⚡" },
    { id: "rxjs", title: "RxJS", icon: "🔄" },
    { id: "web-components", title: "Web Components", icon: "🧩" },
    { id: "performance", title: "Performance", icon: "🚀" },
    { id: "accessibility", title: "Accessibility", icon: "♿" },
    { id: "forms-signals", title: "Forms + Signals", icon: "📝" },
    { id: "ssr-hydration", title: "SSR & Hydration", icon: "💧" },
    { id: "router-signals", title: "Router + Signals", icon: "🧭" },
    { id: "performance-lab", title: "Performance Lab", icon: "⚙️" },
    { id: "key-takeaways", title: "Key Takeaways", icon: "🎯" },
  ];

  ngOnInit() {
    // Set up intersection observer for active section tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        });
      },
      { threshold: 0.3 }
    );

    setTimeout(() => {
      this.sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          observer.observe(element);
        }
      });
    }, 1000);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }
}

bootstrapApplication(App, {
  providers: [
    provideStore({ app: appReducer }),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
  ],
});

