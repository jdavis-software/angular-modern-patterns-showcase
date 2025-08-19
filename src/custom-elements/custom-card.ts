export class CustomCard extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'subtitle', 'theme'];
  }

  private shadow = this.attachShadow({ mode: 'open' });

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    this.render();
  }

  private render() {
    const title = this.getAttribute('title') ?? '';
    const subtitle = this.getAttribute('subtitle') ?? '';
    const theme = this.getAttribute('theme') ?? 'default';

    this.shadow.innerHTML = `
      <style>
        :host { display: block; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .header { padding: 16px; background: #f8f9fa; }
        .header.primary { background: #007bff; color: white; }
        .content { padding: 16px; }
        .actions { padding: 16px; border-top: 1px solid #e0e0e0; text-align: right; }
      </style>
      <div class="card">
        <div class="header ${theme}" part="header">
          <h3 class="title">${title}</h3>
          ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
        </div>
        <div class="content" part="content"><slot name="content"></slot></div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
      </div>`;
  }
}

