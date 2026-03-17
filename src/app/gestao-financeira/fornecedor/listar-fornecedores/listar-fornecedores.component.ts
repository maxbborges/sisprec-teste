import { Component, OnInit } from '@angular/core';
import { Fornecedor, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiFornecedorService } from 'src/app/shared/services/api-fornecedor.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-listar-fornecedores',
  templateUrl: './listar-fornecedores.component.html',
  styleUrls: ['./listar-fornecedores.component.scss'],
  standalone: false
})
export class ListarFornecedoresComponent implements OnInit {
  public lstFornecedores: Fornecedor[] = [];
  public usuarioLogado: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private apiFornecedor: ApiFornecedorService,
    private storageService: StorageService,
    private alertService: AlertService,
    private _segurancaService: SegurancaCheckService,
    private _modal: ModalService,
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.listarFornecedores();
  }

  listarFornecedores() {
    this.apiFornecedor.listarTodosFornecedores(this.usuarioLogado.idFiliacao).subscribe(
      lstFornecedores => {
        this.lstFornecedores = lstFornecedores;
      },
      error => {
        console.log('Erro ao carregar lista de fornecedores:');
        console.log(error);
      }
    );
  }



  excluir(id) {
    console.log("Excluindo lançamento:");

    let resultado$ = this.alertService.exibirConfirmacaoAlerta(
      "Tem certeza de que deseja deletar este fornecedor?",
      tipo.atencao
    );
    resultado$.subscribe((resultado) => {
      if (resultado) {
        const obj = {
          idFornecedor: id,
          idUsuarioDesativacao: this.usuarioLogado.idUsuario,
        };

        this.apiFornecedor.desativarFornecedor(obj).subscribe(
          (retorno) => {
            if (retorno) {
              this._modal.alert(
                "Fornecedor deletado com sucesso.","Sucesso","s"
              );
              this.listarFornecedores();
            } else {
              this._modal.alert(
                "Ocorreu um erro ao deletar este Fornecedor.","Erro","e"
              );
            }
          },
          (error) => {
            console.log("Erro ao deletar Fornecedor:");
            this._modal.alert(
              "Ocorreu um erro ao deletar este Fornecedor.","Erro","e"
            );
          }
        );
      }
    });
  }
}
