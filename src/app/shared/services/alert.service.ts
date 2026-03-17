import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmacaoComponent } from '../components/confirmacao/confirmacao.component';
   

@Injectable({
  providedIn: 'root'
})

export class AlertService {

  private tipos: Array<string> = ['', 'Sucesso', 'Erro', 'Atenção'];

  private retorno: boolean;

  constructor(private ngbModal: NgbModal) { }

  public getRetorno(){
    return this.retorno;
  }

  exibirAlerta(texto: string, tipoAlerta: tipo = 0): void {
    window.alert(texto);
  }

  exibirConfirmacao(texto: string, tipoAlerta: tipo = 0){
    return window.confirm(texto);
  }

  //tipoConfirmacao: tipo = 0
  exibirConfirmacaoAlerta(texto: string, tipoConfirmacao: tipo, okTexto?: string, cancelarTexto?: string)  {
    const modalRef = this.ngbModal.open(ConfirmacaoComponent, { 
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
    
    modalRef.componentInstance.titulo = this.tipos[tipoConfirmacao];
    modalRef.componentInstance.corpo = texto;
    
    if(okTexto){
      modalRef.componentInstance.btConfirmar = okTexto;
    }

    if(cancelarTexto){
      modalRef.componentInstance.btCancelar = cancelarTexto;
    }

    return modalRef.componentInstance.retorno.asObservable();
  }
}


export enum tipo {
  nenhum = 0,
  sucesso = 1,
  erro = 2,
  atencao = 3
}
