import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-verificar-caps-lock-ativo',
  templateUrl: './verificar-caps-lock-ativo.component.html',
  styleUrls: ['./verificar-caps-lock-ativo.component.scss'],
  standalone: false
})
export class VerificarCapsLockAtivoComponent {
  public capslockOn: boolean;

  /**
   * Verifica se o Caps Lock esta ativo
   */
  @HostListener('window:click', ['$event']) onClick(event) {
    if (event.getModifierState && event.getModifierState('CapsLock')) {
      this.capslockOn = true;
    } else {
      this.capslockOn = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
    if (event.getModifierState && event.getModifierState('CapsLock')) {
      this.capslockOn = true;
    } else {
      this.capslockOn = false;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event) {
    if (event.getModifierState && event.getModifierState('CapsLock')) {
      this.capslockOn = true;
    } else {
      this.capslockOn = false;
    }
  }
}
