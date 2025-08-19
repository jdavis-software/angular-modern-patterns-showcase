export class CustomProgressRing extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'max', 'size', 'stroke-width', 'color'];
  }

  private shadow = this.attachShadow({ mode: 'open' });

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    this.render();
  }

  private render() {
    const value = Number(this.getAttribute('value') ?? 0);
    const max = Number(this.getAttribute('max') ?? 100);
    const size = Number(this.getAttribute('size') ?? 120);
    const stroke = Number(this.getAttribute('stroke-width') ?? 8);
    const color = this.getAttribute('color') ?? '#007bff';
    const radius = (size - stroke) / 2;
    const circ = 2 * Math.PI * radius;
    const pct = Math.max(0, Math.min(1, value / max));

    this.shadow.innerHTML = `
      <style>:host{display:inline-block}</style>
      <svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="#e5e7eb" stroke-width="${stroke}" fill="none"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="${color}" stroke-width="${stroke}" fill="none"
          stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - pct)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
      </svg>`;
  }
}

