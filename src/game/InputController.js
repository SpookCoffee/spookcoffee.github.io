/** Keyboard AND basic touch input. Keep input logic away from the vehicle model. */
export class InputController {
  constructor() {
    this.pressed = new Set();
    this.touch = new Set();
    this.known = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D']);
    window.addEventListener('keydown', event => {
      if (this.known.has(event.key) && !(event.target instanceof HTMLInputElement)) event.preventDefault();
      this.pressed.add(event.key.toLowerCase());
    });
    window.addEventListener('keyup', event => this.pressed.delete(event.key.toLowerCase()));
    window.addEventListener('blur', () => { this.pressed.clear(); this.touch.clear(); });
    document.querySelectorAll('[data-key]').forEach(button => {
      const key = button.dataset.key;
      const start = event => { event.preventDefault(); button.setPointerCapture?.(event.pointerId); this.touch.add(key); };
      const end = event => { event.preventDefault(); this.touch.delete(key); };
      button.addEventListener('pointerdown', start);
      button.addEventListener('pointerup', end);
      button.addEventListener('pointercancel', end);
      button.addEventListener('lostpointercapture', () => this.touch.delete(key));
    });
  }
  get forward() { return this.pressed.has('w') || this.pressed.has('arrowup') || this.touch.has('forward'); }
  get backward() { return this.pressed.has('s') || this.pressed.has('arrowdown') || this.touch.has('backward'); }
  get left() { return this.pressed.has('a') || this.pressed.has('arrowleft') || this.touch.has('left'); }
  get right() { return this.pressed.has('d') || this.pressed.has('arrowright') || this.touch.has('right'); }
  get brake() { return this.pressed.has(' '); }
}
