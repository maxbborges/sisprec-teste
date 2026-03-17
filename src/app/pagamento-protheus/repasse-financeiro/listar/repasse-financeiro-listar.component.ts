import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Observable } from "rxjs";
import { Indicador, Usuario } from "src/app/shared/models/responses/sisprec-response";
import { SegurancaCheckService } from "src/app/shared/seguranca/seguranca-check-service";
import { AlertService, tipo } from "src/app/shared/services/alert.service";
import { ApiIndicadorService } from "src/app/shared/services/api-indicador.service";
import { ApiPagamentoService } from 'src/app/shared/services/api-pagamento.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from "src/app/shared/services/storage.service";
import { CommandEnviarPagamento, CommandPesquisarPagamento, ListaPagamentos } from './../../../shared/models/commands/cmdPagamento';

@Component({
  selector: 'app-listar-repasse-financeiro',
  templateUrl: './repasse-financeiro-listar.component.html',
  standalone: false
})
export class ListarRepasseFinanceiroComponent implements OnInit {

  public form: FormGroup;
  public usuarioLogado: Usuario;
  public acaoBloqueada: boolean = false;
  public pagamentos: ListaPagamentos[] = [];
  public federacoes: Observable<Indicador[]>;
  public msg: string = 'Selecione um filtro para pesquisar.';

  constructor(
    private _formBuilder: FormBuilder,
    private alertService: AlertService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private _segurancaService: SegurancaCheckService,
    private ngbModal: NgbModal,
    private router: Router,
    private apiIndicadorService: ApiIndicadorService,
    private _apiService: ApiPagamentoService,
    private _modal: ModalService
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);

    this.inicializarForm();
    this.listarFederacoes();
  }

  private inicializarForm() {
    this.form = this._formBuilder.group({
      idFederacao: [''],
      dataInicial: [''],
      dataFinal: ['']
    });
  }

  private listarFederacoes() {
    this.federacoes = this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('Federacao');
  }

  pesquisar() {

    const filtros: CommandPesquisarPagamento = this.form.value;

    if (new Date(filtros.dataInicial) > new Date(filtros.dataFinal) )
      this._modal.alert('Data Inicial não pode ser maior para Data Final', 'Atenção', 'e')

    this._apiService.pesquisarPagamentos(filtros).subscribe(data => {
      if(data.length > 0) {
        this.pagamentos = data;
      } else {
        this.pagamentos = [];
        this.msg = 'Não foi encontrado nenhum lançamento para a pesquisa realizada.';
      }
    },
      () => this.erro()
    );
  }

  private erro() {
    this._modal.alert('Ocorreu um erro favor verifique.', 'Erro', 'e')
      .subscribe(() => this.form.enable());
  }
  public excluir(id){
    let resultado$ = this.alertService.exibirConfirmacaoAlerta(
          "Tem certeza de que deseja excluir este pagamento?",
          tipo.atencao
        );
        resultado$.subscribe((resultado) => {
          if (resultado) {
            const obj: CommandEnviarPagamento = {
              idPagamento: id,
              idUsuario: this.usuarioLogado.idUsuario,
            };
            this._apiService.excluirPagamentoById(obj).subscribe(
              (retorno) => {
                if (retorno.success) {
                  this._modal.alert(
                    "Pagamento deletado com sucesso.","Sucesso","s"
                  );
                  this.pesquisar();
                } else {
                  this._modal.alert(
                    "Ocorreu um erro ao deletar este Pagamento.","Erro","e"
                  );
                }
              },
              (error) => {
                console.log("Erro ao deletar Pagamento:");
                this._modal.alert(
                  "Ocorreu um erro ao deletar este Pagamento.","Erro","e"
                );
              }
            );
          }
        });
  }
  isPermitirExcluir(){
    return this.usuarioLogado.tipoUsuario == 'Desenvolvedor' || this.usuarioLogado.tipoUsuario.includes("Gestor");
  }
}
