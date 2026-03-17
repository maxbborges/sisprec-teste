import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiEstimativaDeCustoService } from 'src/app/shared/services/api-estimativa-de-custo.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({ templateUrl: './modal-cadastrar-analise-e-motivo-valores.component.html',
  standalone: false
})
export class ModalCadastrarAnaliseEMotivoValoresComponent implements OnInit {

  form: FormGroup;

  enviando = false;

  @Input() idCadastro: string;
  @Output() retorno: EventEmitter<boolean> = new EventEmitter<boolean>();

  usuario: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private ngbActiveModal: NgbActiveModal,
    private api: ApiEstimativaDeCustoService,
    private storage: StorageService,
    private fb: FormBuilder,
    private m: ModalService,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit() {

    this.form = this.fb.group({
      idCadastroStatus: ['', [Validators.required]],
      motivo: ['', [Validators.required]]
    });

    this.form.controls.motivo.disable();

    this.usuario = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);

  }

  get c() {

    return this.form.controls;

  }

  sim() {

    this.enviando = true;

    if (this.form.invalid) {
      this.m.alert('Campo obrigatório não preenchido.');
      return;
    }

    this.m.confirm('Tem certeza que deseja salvar esta análise?').subscribe(resultado => {

      if (!resultado) {
        return;
      }

      this.api.alterarCadastroStatus({
        idCadastro: this.idCadastro,
        idCadastroStatus: this.form.value.idCadastroStatus,
        idUsuario: this.usuario.idUsuario,
        motivo: this.form.value.motivo
      }).subscribe(
        x => {
          this.retorno.emit(x);
          this.ngbActiveModal.close();
        },
        () => {
          this.retorno.emit(false);
          this.ngbActiveModal.close();
        }
      );

    });

  }

  cancelar() {

    this.m.confirm('Tem certeza que deseja cancelar a ação?').subscribe(resultado => {

      if (!resultado) {
        return;
      }

      this.ngbActiveModal.close();

    });

  }

  desativarCampoMotivo(evento: any) {

    evento.target.value === '2146' ? this.form.controls.motivo.disable() : this.form.controls.motivo.enable();

  }

}
