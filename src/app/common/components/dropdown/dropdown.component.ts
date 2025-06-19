import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  imports: [],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  options = input<string[]>([]);
  isOpen = input<boolean>(false);
  onSelect = output<string>();

  selectOption(option: string) {
    this.onSelect.emit(option);
  }
}
