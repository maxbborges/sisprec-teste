// tslint:disable: max-line-length
import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appExibirEsconderSenha]',
  standalone: false
})
export class ExibirEsconderSenhaDirective {
  private exibirSenha = false;

  public botaoExibir: string;
  public botaoEsconder: string;

  constructor(private elementRef: ElementRef) {
    this.botaoExibir = `
      <button type="button" class="btn btn-outline-secondary" title="Exibir senha" alt="Exibir senha"><i class="fas fa-eye"></i></button>
      `;
    this.botaoEsconder = `
      <button type="button" class="btn btn-outline-secondary" title="Esconder senha" alt="Esconder senha"><i class="fas fa-eye-slash"></i></button>
      `;
    this.setup();
  }

  setup() {
    const parent = this.elementRef.nativeElement.parentNode;
    const span = document.createElement('div');
    span.className = 'input-group-append';
    span.innerHTML = this.botaoExibir;
    span.addEventListener('click', event => {
      this.toggle(span);
    });
    parent.appendChild(span);
  }

  toggle(span: HTMLElement) {
    this.exibirSenha = !this.exibirSenha;
    if (this.exibirSenha) {
      this.elementRef.nativeElement.setAttribute('type', 'text');
      span.innerHTML = this.botaoEsconder;
    } else {
      this.elementRef.nativeElement.setAttribute('type', 'password');
      span.innerHTML = this.botaoExibir;
    }
  }
}
