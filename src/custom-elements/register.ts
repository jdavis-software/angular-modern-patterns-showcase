import { CustomProgressRing } from './custom-progress-ring';
import { CustomCard } from './custom-card';
import { CustomToggle } from './custom-toggle';

export function registerCustomElements() {
  if (typeof window === 'undefined' || !('customElements' in window)) return;

  const defs: Array<[string, CustomElementConstructor]> = [
    ['custom-progress-ring', CustomProgressRing],
    ['custom-card', CustomCard],
    ['custom-toggle', CustomToggle],
  ];

  for (const [tag, ctor] of defs) {
    if (!customElements.get(tag)) {
      customElements.define(tag, ctor);
    }
  }
}

