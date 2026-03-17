import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AppUtil } from 'src/app/shared/utils/app.util';

@Component({
  templateUrl: './confirm.component.html',
  standalone: false
})
export class ConfirmComponent implements OnInit {

  @Input() severidade: string;
  @Input() detalhe: string;
  @Input() resumo: string;
  @Input() nomePrimeiroBotao: string;
  @Input() nomeSegundoBotao: string;

  @Output() retorno = new EventEmitter<boolean>();

  icone: string;

  constructor(
    private ngbActiveModal: NgbActiveModal
  ) { }

  ngOnInit() {

    this.icone = AppUtil.severidade(this.severidade).icone;

  }

  confirmar(resposta: boolean) {

    this.retorno.emit(resposta);
    this.ngbActiveModal.close();

  }
}