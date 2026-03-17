import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-botao-voltar',
  templateUrl: './botao-voltar.component.html',
  styleUrls: ['./botao-voltar.component.scss'],
  standalone: false
})
export class BotaoVoltarComponent {
  @Input() textoBotao = 'Voltar';
  @Input() confirmacao = true;

  constructor(private location: Location) { }

  voltar() {
    if(this.confirmacao == true) {
      const c = confirm('Deseja cancelar');
      if (c) {
        this.location.back();
      }
    } else {
      this.location.back();
    }
    
  }
}
