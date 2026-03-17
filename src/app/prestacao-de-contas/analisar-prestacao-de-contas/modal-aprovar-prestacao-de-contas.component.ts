import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlterarPrestacaoContas, PrestacaoContas, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { environment } from 'src/environments/environment';

@Component({ templateUrl: './modal-aprovar-prestacao-de-contas.component.html',
  standalone: false
})
export class ModalAprovarPrestacaoDeContasComponent implements OnInit {

  usuario: Usuario;
  env = environment;

  @Input() prestacaoContas: PrestacaoContas;
  @Input() msgRetorno: string;
  @Output() retorno: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private ngbActiveModal: NgbActiveModal,
    private apiPrestacaoContasService: ApiPrestacaoContasService
  ) { }

  ngOnInit() {

    if (localStorage.userSisprec) {
      this.usuario = JSON.parse(localStorage.userSisprec);
    }
  }

  sim() {

    const alterarPrestacaoContas: AlterarPrestacaoContas = {
      idPrestacaoContas: this.prestacaoContas.idPrestacaoContas,
      idStatusAtualPrestacaoContas: this.getStatusAtualPrestacaoContas(),
      versao: 0,
      idFederacao: this.prestacaoContas.idFederacao,
      mesExercicio: this.prestacaoContas.mesExercicio,
      anoExercicio: this.prestacaoContas.anoExercicio,
      idUsuarioCadastro: this.usuario.idUsuario
    };

    this.apiPrestacaoContasService
      .alterarPrestacaoContas(alterarPrestacaoContas)
      .subscribe(x => {
        if (x) {
          this.retorno.emit(true);
          this.ngbActiveModal.close();
        }
      });

    this.ngbActiveModal.close();
  }

  cancelar() {
    this.ngbActiveModal.close();
  }

  getStatusAtualPrestacaoContas() {
    switch (this.usuario.idTipoUsuario) {
      case this.env.idPerfilGestorFiscal: // Gestor Fiscal
        return 2022; // Aprovada Gestor Fiscal
      case this.env.idPerfilConferenciaDoc: // Conferência da Documentação
        return 2021; // Aprovada Conferência da Documentação
    }
  }
}
