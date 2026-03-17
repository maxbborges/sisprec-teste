import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

@Component({
  templateUrl: './confirmacao.component.html',
  standalone: false
})
export class ConfirmacaoComponent implements OnInit {

  @Input() titulo: string;
  @Input() corpo: string;
  @Input() btCancelar = 'Cancelar';
  @Input() btConfirmar = 'Ok';

  retorno: Subject<Boolean> = new Subject<Boolean>();

  icone: string;

  constructor(
    private ngbActiveModal: NgbActiveModal
  ) { }

  ngOnInit() {
  }

  cancelar(){
    this.fechar(false);
  }

  confirmar(){
    this.fechar(true);
  }
  
  private fechar(valor: boolean){
    this.ngbActiveModal.close(valor);
    this.retorno.next(valor);
    this.retorno.complete();
  }

}
