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

