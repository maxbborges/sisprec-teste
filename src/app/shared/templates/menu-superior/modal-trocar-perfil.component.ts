import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SegurancaCheckService } from "../../seguranca/seguranca-check-service";

import { Usuario } from "./../../models/responses/sisprec-response";
import { ApiIndicadorService } from "./../../services/api-indicador.service";
import { ApiUsuarioService } from "./../../services/api-usuario.service";
import { StorageService } from "./../../services/storage.service";

@Component({
  selector: "app-modal-trocar-perfil",
  templateUrl: "./modal-trocar-perfil.component.html",
  standalone: false
})
export class ModalTrocarPerfilComponent implements OnInit {
  formTrocarPerfil: FormGroup;
  usuarioLogado: Usuario;
  usuario: Usuario;
  acaoBloqueada: boolean = false;
  constructor(
    private apiIndicadorService: ApiIndicadorService,
    private apiUsuarioService: ApiUsuarioService,
    private fb: FormBuilder,
    private ngbActiveModal: NgbActiveModal,
    private storageService: StorageService,
    private _segurancaService: SegurancaCheckService
  ) {}

  ngOnInit(): void {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);

    this.apiUsuarioService
      .VisualizarUsuario(this.usuarioLogado.idUsuario)
      .subscribe((usuario) => (this.usuario = usuario));
    this.formTrocarPerfil = this.fb.group({
      idTipoUsuario: [this.usuarioLogado.idTipoUsuario],
    });
  }

  trocarPerfil() {
    this.apiIndicadorService
      .buscarIndicadorPorId(this.formTrocarPerfil.value.idTipoUsuario)
      .subscribe((tipoUsuario) => {
        this.usuarioLogado.idTipoUsuario = tipoUsuario.idIndicador;
        this.usuarioLogado.tipoUsuario = tipoUsuario.nome;
        this.usuarioLogado.tipoUsuarioSigla = tipoUsuario.sigla;
        this.storageService.setUsuarioLogado(this.usuarioLogado);
        this.ngbActiveModal.close();
      });
  }

  cancelar(): void {
    this.ngbActiveModal.close();
  }
}
