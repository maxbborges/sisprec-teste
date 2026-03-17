import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlterarStatusPrestacaoContas, PrestacaoContas, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';

@Component({
  selector: 'app-modal-retornar-status-prestacao-de-contas',
  templateUrl: './modal-retornar-status-prestacao-de-contas.component.html',
  standalone: false
})
export class ModalRetornarStatusPrestacaoDeContasComponent implements OnInit {
  @Input() prestacaoContas: PrestacaoContas;
  @Output() retorno: EventEmitter<boolean> = new EventEmitter<boolean>();

  usuario: Usuario;
  public objAlteracao: AlterarStatusPrestacaoContas;

  constructor(
    private ngbActiveModal: NgbActiveModal,
    private apiPrestacaoContasService: ApiPrestacaoContasService,
    private apiIndicadorService: ApiIndicadorService
  ) { }

  ngOnInit() {
    if (localStorage.userSisprec) {
      this.usuario = JSON.parse(localStorage.userSisprec);
    }
  }

  sim() {
    this.objAlteracao = {
      idPrestacaoContas: this.prestacaoContas.idPrestacaoContas,
      idUsuarioCadastro: this.usuario.idUsuario,

    };

    if (this.usuario.tipoUsuarioSigla === 'UsuarioConferenciaDoc') {
      this.apiIndicadorService.visualizarIndicadorPorSigla('EnviadaAnalise').subscribe(
        result => {
          this.objAlteracao.idStatusAtualPrestacaoContas = result.idIndicador;
          this.apiPrestacaoContasService
            .alterarStatusPrestacaoContas(this.objAlteracao)
            .subscribe(x => {
              if (x) {
                this.retorno.emit(true);
              }
            });
          this.ngbActiveModal.close();
        }
      );
    } else {
      this.apiIndicadorService.visualizarIndicadorPorSigla('AprovadaConferenciaDocumentacao').subscribe(
        result => {
          this.objAlteracao.idStatusAtualPrestacaoContas = result.idIndicador;
          this.apiPrestacaoContasService
            .alterarStatusPrestacaoContas(this.objAlteracao)
            .subscribe(x => {
              if (x) {
                this.retorno.emit(true);
              }
            });
          this.ngbActiveModal.close();
        }
      );
    }
  }

  cancelar() {
    this.ngbActiveModal.close();
  }


}
