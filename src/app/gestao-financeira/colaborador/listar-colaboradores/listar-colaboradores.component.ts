import { Component, OnInit } from '@angular/core';
import { Colaborador, Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiColaboradorService } from 'src/app/shared/services/api-colaborador.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-listar-colaboradores',
  templateUrl: './listar-colaboradores.component.html',
  styleUrls: ['./listar-colaboradores.component.scss'],
  standalone: false
})
export class ListarColaboradoresComponent implements OnInit {
  public lstFederacoes: Indicador[] = [];
  public filtroFederacao: number = 0;
  public disableFederacoes = true;

  public lstColaboradores: Colaborador[] = [];
  public usuarioLogado: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private apiIndicadorService: ApiIndicadorService,
    private apiColaborador: ApiColaboradorService,
    private storageService: StorageService,
    private alertService: AlertService,
    private _segurancaService: SegurancaCheckService,
    private _modal: ModalService,
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.listarColaboradores();
  }

  carregarListaFederacoes() {
    if (this.usuarioLogado.tipoUsuarioSigla === 'UsuarioFederacao') {
      this.apiIndicadorService
        .buscarIndicadorPorId(this.usuarioLogado.idFiliacao)
        .subscribe((federacao) => {
          this.lstFederacoes.push(federacao);
      }, (error) => {
        console.log('Erro ao carregar lista de federações:');
        console.log(error);
      });
    } else {
      this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('Federacao').subscribe((lstFederacoes) => {
        this.lstFederacoes.push(
          {
              idIndicador: 0,
              nome: null,
              sigla: 'Todas',
              valor: null,
              idIndicadorTipo: null,
              indicadorTipo: null,
              ativo: null
        });
        let siglas = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < lstFederacoes.length; i++) { siglas.push(lstFederacoes[i].sigla); }
        siglas = siglas.sort();
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < siglas.length; i++) {
          const obj = lstFederacoes.filter(
            item => {
              return item.sigla === siglas[i];
            });
          // tslint:disable-next-line: align
          this.lstFederacoes.push(obj[0]);
        }

        const userSisprec = JSON.parse(localStorage.getItem('userSisprec'));
        // seta a federação do usuário
        this.filtroFederacao = userSisprec.idFiliacao;
        this.disableFederacoes = false;

      }, (error) => {
        console.log('Erro ao carregar lista de federações:');
        console.log(error);
      });
    }
  }

  listarColaboradores() {
    this.apiColaborador.listarTodosColaboradores(this.usuarioLogado.idFiliacao).subscribe(
      lstColaboradores => {
        this.lstColaboradores = lstColaboradores;
      },
      error => {
        console.log('Erro ao carregar lista de colaboradores:');
        console.log(error);
      }
    );
  }



  excluir(id) {
    let resultado$ = this.alertService.exibirConfirmacaoAlerta(
      "Tem certeza de que deseja deletar este colaborador?",
      tipo.atencao
    );
    resultado$.subscribe((resultado) => {
      if (resultado) {
        const obj = {
          idColaborador: id,
          idUsuarioDesativacao: this.usuarioLogado.idUsuario,
        };

        this.apiColaborador.desativarColaborador(obj).subscribe(
          (retorno) => {
            if (retorno) {
              this._modal.alert(
                "Colaborador deletado com sucesso.","Sucesso","s"
              );
              this.listarColaboradores();
            } else {
              this._modal.alert(
                "Ocorreu um erro ao deletar este Colaborador.","Erro","e"
              );
            }
          },
          (error) => {
            console.log("Erro ao deletar Colaborador:");
            this._modal.alert(
              "Ocorreu um erro ao deletar este Colaborador.","Erro","e"
            );
          }
        );
      }
    });
  }
}
