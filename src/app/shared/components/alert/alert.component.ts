import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AppUtil } from 'src/app/shared/utils/app.util';

@Component({
  templateUrl: './alert.component.html',
  standalone: false
})
export class AlertComponent implements OnInit {

  @Input() severidade: string;
  @Input() detalhe: string;
  @Input() resumo: string;
  @Input() nomeBotao: string;

  @Output() retorno = new EventEmitter<boolean>();

  icone: string;

  constructor(
    private ngbActiveModal: NgbActiveModal
  ) { }

  ngOnInit() {

    this.icone = AppUtil.severidade(this.severidade).icone;

  }

  ok() {

    this.retorno.emit(true);
    this.ngbActiveModal.close();

  }

}
