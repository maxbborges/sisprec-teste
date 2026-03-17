import { Injectable } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Observable } from 'rxjs';

import { AlertComponent } from 'src/app/shared/components/alert/alert.component';
import { ConfirmComponent } from 'src/app/shared/components/confirm/confirm.component';
import { AppUtil } from 'src/app/shared/utils/app.util';

@Injectable()
export class ModalService {

  constructor(
    private ngbModal: NgbModal
  ) { }

  alert(
    detalhe?: string,
    resumo?: string,
    severidade: string = null,
    nomeBotao: string = 'Ok'
  ): Observable<boolean> {

    const inputModal = this.ngbModal.open(
      AlertComponent, {
      ariaLabelledBy: 'ssModalAlert',
      windowClass: AppUtil.severidade(severidade).cor,
      container: 'body'
    });
    inputModal.componentInstance.severidade = severidade;
    inputModal.componentInstance.resumo = resumo;
    inputModal.componentInstance.detalhe = detalhe;
    inputModal.componentInstance.nomeBotao = nomeBotao;

    return inputModal.componentInstance.retorno;

  }

  confirm(
    detalhe?: string,
    resumo?: string,
    severidade: string = null,
    nomePrimeiroBotao: string = 'Sim',
    nomeSegundoBotao: string = 'Não'
  ): Observable<boolean> {

    const inputModal = this.ngbModal.open(
      ConfirmComponent, {
      ariaLabelledBy: 'ssModalConfirm',
      windowClass: AppUtil.severidade(severidade).cor,
      container: 'body'
    });
    inputModal.componentInstance.severidade = severidade;
    inputModal.componentInstance.resumo = resumo;
    inputModal.componentInstance.detalhe = detalhe;
    inputModal.componentInstance.nomePrimeiroBotao = nomePrimeiroBotao;
    inputModal.componentInstance.nomeSegundoBotao = nomeSegundoBotao;

    return inputModal.componentInstance.retorno;

  }

  public close(){
    this.ngbModal.dismissAll();
  }

}
