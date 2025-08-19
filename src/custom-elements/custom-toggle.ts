export class CustomToggle extends HTMLElement {
  static get observedAttributes() {
    return ['checked', 'disabled'];
  }

  private shadow = this.attachShadow({ mode: 'open' });

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    this.updateState();
  }

  private render() {
    this.shadow.innerHTML = `
      <style>
        :host { display: inline-block; }
        .toggle {
          position: relative;
          width: 50px;
          height: 24px;
          background: #ccc;
          border-radius: 12px;
          cursor: pointer;
          border: none;
          outline: none;
          transition: background-color 0.2s ease;
        }
        .toggle.checked { background: #007bff; }
        .toggle.disabled { opacity: 0.5; cursor: not-allowed; }
        .thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .toggle.checked .thumb { transform: translateX(26px); }
      </style>
      <button class="toggle" part="toggle"><div class="thumb" part="thumb"></div></button>
    `;
    this.shadow.querySelector('.toggle')?.addEventListener('click', () => this.handleToggle());
    this.updateState();
  }

  private handleToggle() {
    if (this.hasAttribute('disabled')) return;
    const isChecked = this.hasAttribute('checked');
    if (isChecked) {
      this.removeAttribute('checked');
    } else {
      this.setAttribute('checked', '');
    }
    this.dispatchEvent(new CustomEvent('toggle', {
      detail: { checked: !isChecked },
      bubbles: true
    }));
  }

  private updateState() {
    const toggle = this.shadow.querySelector('.toggle');
    if (toggle) {
      toggle.classList.toggle('checked', this.hasAttribute('checked'));
      toggle.classList.toggle('disabled', this.hasAttribute('disabled'));
    }
  }
}

