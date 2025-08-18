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
  ],
  template: `
    <div class="showcase-app">
      <header class="app-header">
        <h1>🚀 Angular Modern Patterns Showcase</h1>
        <p class="subtitle">
          Comprehensive examples: Signals, NgRx, RxJS, Web Components,
          Performance & Accessibility
        </p>

        <nav class="quick-nav">
          <button
            *ngFor="let section of sections; let i = index"
            (click)="scrollToSection(section.id)"
            class="nav-button"
            [class.active]="activeSection === section.id"
          >
            {{ section.icon }} {{ section.title }}
          </button>
        </nav>
      </header>

      <main class="app-main">
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
      </main>

      <footer class="app-footer">
        <div class="footer-content">
          <h3>🎯 Key Takeaways for Your Article</h3>
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
          </div>

          <div class="article-note">
            <p>
              💡 <strong>Pro tip:</strong> Each demo includes detailed
              explanations and best practices. Use the browser DevTools to
              inspect the implementation details and see the patterns in action!
            </p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      .showcase-app {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .app-header {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 30px 20px;
        text-align: center;
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .app-header h1 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 2.5rem;
        font-weight: 700;
      }

      .subtitle {
        color: #495057;
        font-size: 1.1rem;
        margin: 0 0 30px 0;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
        line-height: 1.5;
      }

      .quick-nav {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
        max-width: 1000px;
        margin: 0 auto;
      }

      .nav-button {
        padding: 10px 20px;
        background: #f8f9fa;
        border: 2px solid #e9ecef;
        border-radius: 25px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        color: #495057;
      }

      .nav-button:hover {
        background: #e9ecef;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .nav-button.active {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }

      .app-main {
        padding: 0;
      }

      .showcase-section {
        margin-bottom: 0;
      }

      .app-footer {
        background: #2c3e50;
        color: white;
        padding: 40px 20px;
      }

      .footer-content {
        max-width: 1200px;
        margin: 0 auto;
      }

      .footer-content h3 {
        text-align: center;
        margin-bottom: 30px;
        font-size: 1.8rem;
      }

      .takeaways-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .takeaway-card {
        background: rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .takeaway-card h4 {
        margin: 0 0 10px 0;
        color: #ecf0f1;
        font-size: 1.1rem;
      }

      .takeaway-card p {
        margin: 0;
        color: #ecf0f1;
        line-height: 1.5;
      }

      .article-note {
        background: rgba(52, 152, 219, 0.2);
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #3498db;
        text-align: center;
      }

      .article-note p {
        margin: 0;
        font-size: 1.1rem;
        line-height: 1.6;
      }

      @media (max-width: 768px) {
        .app-header h1 {
          font-size: 2rem;
        }

        .subtitle {
          font-size: 1rem;
        }

        .quick-nav {
          flex-direction: column;
          align-items: center;
        }

        .nav-button {
          width: 200px;
        }

        .takeaways-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class App implements OnInit {
  sections = [
    { id: "signals", title: "Signals", icon: "🎯" },
    { id: "ngrx", title: "NgRx", icon: "🏪" },
    { id: "rxjs", title: "RxJS", icon: "🌊" },
    { id: "web-components", title: "Web Components", icon: "🧩" },
    { id: "performance", title: "Performance", icon: "⚡" },
    { id: "accessibility", title: "Accessibility", icon: "♿" },
  ];

  activeSection = "signals";

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
