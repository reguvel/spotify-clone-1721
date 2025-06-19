import { Component, Input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-icon-button',
  imports: [FaIconComponent],
  template: `
    <button class="icon-button">
      <fa-icon [icon]="icon" [size]="size"></fa-icon>
    </button>
  `,
  styles: [
    `
      .icon-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      fa-icon {
        color: var(--spotify-gray);
        transition: color 0.2s ease, transform 0.2s ease;
      }

      .icon-button:hover fa-icon {
        color: var(--spotify-white);
        transform: scale(1.05);
      }
    `
  ]
})
export class IconButtonComponent {
  @Input() icon!: IconDefinition;
  @Input() size: 'xs' | 'sm' | 'lg' | '2x' | '3x' = 'lg'; // Default size
}