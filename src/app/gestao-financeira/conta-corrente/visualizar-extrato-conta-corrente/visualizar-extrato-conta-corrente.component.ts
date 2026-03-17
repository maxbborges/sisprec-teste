import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListarLancamentoSaidaItem } from 'src/app/shared/models/commands/cmdItensLancamento';
import { DesativarLancamento, LancamentoDespesa, ListarExtratoFiltrado } from 'src/app/shared/models/commands/cmdLancamento';
import { FiltroDetalhePrestacaoContas, Lancamento, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiItemLancamentoService } from 'src/app/shared/services/api-item-lancamento.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-visualizar-extrato-conta-corrente',
  templateUrl: './visualizar-extrato-conta-corrente.component.html',
  styleUrls: ['./visualizar-extrato-conta-corrente.component.scss'],
  standalone: false
})
export class VisualizarExtratoContaCorrenteComponent implements OnInit {
  public usuarioLogado: Usuario;
  public idTipoConta = 0;
  public saldoAtual = 0;
  public msg = 'Selecione os filtros';
  public loading = false;
  public podeEditar = false;
  public saldoAnterior = 0;
  public saldoParaConta = 0;


  // Filtros
  public filtroAno = 0;
  public filtroMes = 0;
  public filtroAjuste = null;
  public filtroIdFederacao = 0;
  public lstLancamentos: Lancamento[] = [];
  public lstLancamentosDespesas: LancamentoDespesa[] = [];

  public urlDownload = environment.urlApiSisprec + 'arquivo/porId/';
  acaoBloqueada: boolean = false;
  public submited = false;

  constructor(
    private storageService: StorageService,
    private apiLancamentoService: ApiLancamentoService,
    private apiIndicadorService: ApiIndicadorService,
    private apiPrestacaoService: ApiPrestacaoContasService,
    private apiItemLancamentoService: ApiItemLancamentoService,
    private alertService: AlertService,
    private excelService: ExcelService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);

    this.filtroIdFederacao = this.usuarioLogado.idFiliacao;
    this.carregatTipoConta();
  }

  obterFiltro(){
    this.route.queryParams
      .subscribe(params => {
        if(JSON.stringify(params) !== '{}'){
          this.filtroAno = params.ano;
          this.filtroMes = params.mes;
          this.filtroAjuste = params.ajuste == undefined ? null : params.ajuste;

          this.carregarLancamentos();
        }
    });
  }

  carregatTipoConta() {
    this.apiIndicadorService.visualizarIndicadorPorSigla('TipoContaCorrente').subscribe((indicador) => {
      this.idTipoConta = indicador.idIndicador;
      this.obterFiltro();
    }, (error) => {
      console.log('Erro ao carregar tipo de conta:');
      console.log(error);
    });
  }

  alterarUrl(){
    const filtro = 'ano=' + this.filtroAno + '&' + 'mes=' + this.filtroMes + (["null",null].includes(this.filtroAjuste) ? '' : ('&' +'ajuste=' + this.filtroAjuste));
    this.location.go('/gestaoFinanceira/conta-corrente/', filtro);
  }

  carregarLancamentos() {
    console.log("true")
    this.submited = true;
    this.loading = true;
    if(this.noValue(this.filtroAno) || this.noValue(this.filtroMes)){
      this.loading = false;
      return;
    }
    this.alterarUrl();
    const cmdFiltrarListaExtrato: ListarExtratoFiltrado = {
      ano: this.filtroAno,
      idFederacao: this.filtroIdFederacao,
      mes: this.filtroMes,
      idTipoConta: this.idTipoConta,
      idPrestacaoContas: null,
      comAjuste: this.filtroAjuste == "null" || this.filtroAjuste == null ? null : this.filtroAjuste == "true" ? true : false
    };

    console.log(cmdFiltrarListaExtrato)

    const filtroSaldoAnterior: ListarExtratoFiltrado = {
      ano: this.filtroAno,
      idFederacao: this.filtroIdFederacao,
      mes: this.filtroMes,
      idTipoConta: this.idTipoConta,
      idPrestacaoContas: null
    };

    // if (this.filtroMes.toString() === '1' && this.filtroAno.toString() === '2020') {
    //   this.saldoAnterior = 0.0;
    // } else {
    this.apiLancamentoService.obterSaldoAnterior(filtroSaldoAnterior).subscribe(
      result => {
        this.saldoAnterior = result;
      });
    // }

    console.log(cmdFiltrarListaExtrato)
    this.apiLancamentoService.listarExtratoFiltrado(
      cmdFiltrarListaExtrato

    ).subscribe((lancamentos) => {
      if (lancamentos.length > 0) {
        this.lstLancamentos = lancamentos;
        this.msg = '';
        //this.saldoParaConta = lancamentos[lancamentos.length - 1].saldo;

      } else {
        this.lstLancamentos = [];
        this.podeEditar = true;
        this.msg = 'Não foi encontrado nenhum lançamento para a pesquisa realizada.';
      }
    }, (error) => {
      console.log('Erro ao carregar extrato filtrado:');
      console.log(error);
      this.lstLancamentos = [];
      this.msg = 'Ocorreu um erro ao pesquisar os lançamentos deste exercício. Tente novamente mais tarde.';
      this.loading = false;
    }, () => {
      this.loading = false;
      this.saldoAtual = this.saldoParaConta;
      this.verificaStatusPrestacao();
    });
  }

  noValue(variable) {
    return [0, null, "null", undefined, ""].includes(variable);
  }

  carregarDespesas() {
    this.loading = true;
    const cmdListarLancamentoSaidaItem: ListarLancamentoSaidaItem = {
      ano: this.filtroAno.toString(),
      idFederacao: this.filtroIdFederacao,
      mes: this.filtroMes.toString(),
    };

    const filtroSaldoAnterior: ListarExtratoFiltrado = {
      ano: this.filtroAno,
      idFederacao: this.filtroIdFederacao,
      mes: this.filtroMes,
      idTipoConta: this.idTipoConta,
      idPrestacaoContas: null
    };

    // if (this.filtroMes.toString() === '1' && this.filtroAno.toString() === '2020') {
    //   this.saldoAnterior = 0.0;
    // } else {
    this.apiLancamentoService.obterSaldoAnterior(filtroSaldoAnterior).subscribe(
      result => {
        this.saldoAnterior = result;
      });
    // }

    this.apiItemLancamentoService.listarLancamentoSaidaItem(
      cmdListarLancamentoSaidaItem
    ).subscribe((lancamentosDespesa) => {
      console.clear();
      if (lancamentosDespesa.length > 0) {
        this.lstLancamentosDespesas = lancamentosDespesa;
        this.msg = '';
        //this.saldoParaConta = lancamentosDespesa[lancamentosDespesa.length - 1].saldo;

      } else {
        this.lstLancamentosDespesas = [];
        this.podeEditar = true;
        this.msg = 'Não foi encontrado nenhum lançamento para a pesquisa realizada.';
      }
    }, (error) => {
      this.lstLancamentos = [];
      this.msg = 'Ocorreu um erro ao pesquisar os lançamentos deste exercício. Tente novamente mais tarde.';
      this.loading = false;
    }, () => {
      this.loading = false;
      this.saldoAtual = this.saldoParaConta;
      this.verificaStatusPrestacao();
    });
  }
  
  cadastrarLancamentoRedirecionar(){
    this.router.navigate(['/gestaoFinanceira/conta-corrente/cadastrarLancamento/' + this.filtroAno + '/' + this.filtroMes]);
  }

  excluirLancamento(idLancamento: string) {
    if (this.alertService.exibirConfirmacao('Tem certeza de que deseja deletar este lançamento?', tipo.atencao)) {
      const cmdDesativacao: DesativarLancamento = {
        idLancamento,
        idUsuarioDesativacao: this.usuarioLogado.idUsuario
      };
      this.apiLancamentoService.desativarLancamento(cmdDesativacao).subscribe((retorno) => {
        if (retorno) {
          this.alertService.exibirAlerta('Lançamento deletado com sucesso.', tipo.sucesso);
          this.carregarLancamentos();
        } else {
          this.alertService.exibirAlerta('Ocorreu um erro ao deletar este lançamento.', tipo.erro);
        }
      }, (error) => {
        console.log('Erro ao deletar lançamento:');
        console.log(error);
        this.alertService.exibirAlerta('Ocorreu um erro ao deletar este lançamento.', tipo.erro);
      });
    }
  }

  exportarClick() {

    const obj: any[] = [];

    const cmdFiltrarListaExtrato: ListarExtratoFiltrado = {
      ano: this.filtroAno,
      idFederacao: this.filtroIdFederacao,
      mes: this.filtroMes,
      idTipoConta: this.idTipoConta,
      idPrestacaoContas: null
    };

    this.apiLancamentoService.listarExtratoFiltrado(cmdFiltrarListaExtrato).subscribe(
      result => {

        if (result.length > 0) {
          result.forEach(element => {
            // tslint:disable-next-line: max-line-length
            obj.push({ tipoLancamento: element.tipoLancamento, anoExercicio: element.anoExercicio, mesExercicio: element.mesExercicio, dataEvento: element.dataEvento, valor: element.valor, saldo: element.saldo, federacao: element.federacao });
          });
          this.excelService.exportAsExcelFile(obj, 'Lancamentos');
        }
      }
    );

  }

  cadastrarLancamento(){
    this.router.navigate(['gestaoFinanceira/conta-corrente/cadastrarLancamento'])
  }

  verificaStatusPrestacao() {
    const cmdFiltrarListaExtrato: FiltroDetalhePrestacaoContas = {
      anoExercicio: this.filtroAno,
      idFederacao: this.filtroIdFederacao,
      mesExercicio: this.filtroMes,
      sigla: null
    };
    this.apiPrestacaoService.verificaStatusPrestacaoContas(cmdFiltrarListaExtrato).subscribe(
      data => {
        if (data.length > 0) {
          if (data[0].status !== 'RetornadaAjustes') {
            this.podeEditar = false;
          } else {
            this.podeEditar = true;
          }
        } else {
          this.podeEditar = true;
        }
      }
    );
  }
}
