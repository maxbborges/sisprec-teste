import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlterarPrestacaoContas, PrestacaoContas, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { environment } from 'src/environments/environment';

@Component({ templateUrl: './modal-retornar-para-ajustes-prestacao-de-contas.component.html',
  standalone: false
})
export class ModalRetornarParaAjustesPrestacaoDeContasComponent implements OnInit {

  usuario: Usuario;
  env = environment;

  @Input() prestacaoContas: PrestacaoContas;

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
      idStatusAtualPrestacaoContas: 2019, // Retornada para Ajustes
      versao: this.prestacaoContas.versao ? this.prestacaoContas.versao + 1 : 1,
      idUsuarioCadastro: this.usuario.idUsuario,
      idFederacao: this.prestacaoContas.idFederacao,
      mesExercicio: this.prestacaoContas.mesExercicio,
      anoExercicio: this.prestacaoContas.anoExercicio
    };

    this.apiPrestacaoContasService
      .alterarPrestacaoContas(alterarPrestacaoContas)
      .subscribe(x => {
        if (x) {
          this.retorno.emit(true);
        }
      });
    this.ngbActiveModal.close();
  }

  cancelar() {
    this.ngbActiveModal.close();
  }

}
