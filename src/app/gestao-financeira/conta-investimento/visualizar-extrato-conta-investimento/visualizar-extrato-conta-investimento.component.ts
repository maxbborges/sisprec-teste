import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DesativarLancamento, ListarExtratoFiltrado } from 'src/app/shared/models/commands/cmdLancamento';
import { FiltroDetalhePrestacaoContas, Lancamento, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-visualizar-extrato-conta-investimento',
  templateUrl: './visualizar-extrato-conta-investimento.component.html',
  styleUrls: ['./visualizar-extrato-conta-investimento.component.scss'],
  standalone: false
})
export class VisualizarExtratoContaInvestimentoComponent implements OnInit {

  public usuarioLogado: Usuario;
  public idTipoConta = 0;

  public msg = 'Selecione os filtros';
  public loading = false;
  public mostraDetalhe = false;

  public saldoAnterior: number;
  public iof: number;
  public irrf: number;
  public resgate: number;
  public aplicacao: number;
  public rendimento: number;
  public saldoAtual: number;

  public podeEditar = false;
  //

  // Filtros
  public filtroAno = 0;
  public filtroMes = 0;
  public filtroIdFederacao = 0;
  public lstLancamentos: Lancamento[] = [];
  acaoBloqueada: boolean = false;

  constructor(
    private storageService: StorageService,
    private apiLancamentoService: ApiLancamentoService,
    private apiIndicadorService: ApiIndicadorService,
    private apiPrestacaoService: ApiPrestacaoContasService,
    private alertService: AlertService,
    private excelService: ExcelService,
    private _segurancaService: SegurancaCheckService,
    private router: Router
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.filtroIdFederacao = this.usuarioLogado.idFiliacao;
    this.carregatTipoConta();
  }

  carregatTipoConta() {
    this.apiIndicadorService.visualizarIndicadorPorSigla('TipoContaInvestimento').subscribe((indicador) => {
      this.idTipoConta = indicador.idIndicador;
    }, (error) => {
      console.log('Erro ao carregar tipo de conta:');
      console.log(error);
    });
  }

  carregarLancamentos() {
    this.loading = true;
    const cmdFiltrarListaExtrato: ListarExtratoFiltrado = {
      ano: this.filtroAno,
      idFederacao: this.filtroIdFederacao,
      mes: this.filtroMes,
      idTipoConta: this.idTipoConta,
      idPrestacaoContas: null
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

    this.iof = 0;
    this.irrf = 0;
    this.resgate = 0;
    this.aplicacao = 0;
    this.rendimento = 0;

    this.apiLancamentoService
      .listarExtratoFiltrado(cmdFiltrarListaExtrato)
      .subscribe(lancamentos => {
        if (lancamentos.length > 0) {
          this.lstLancamentos = lancamentos;
          this.lstLancamentos
            .forEach(item => {
              if (item.itemLancamento === 'IOF') {
                this.iof += item.valor;
              }
              if (item.itemLancamento === 'APLICAÇÃO') {
                this.aplicacao += item.valor;
              }
              if (item.itemLancamento === 'IRRF' || item.itemLancamento === 'COBRANÇA DE IR') {
                this.irrf += item.valor;
              }
              if (item.itemLancamento === 'RESGATE') {
                this.resgate += item.valor;
              }
              if (item.itemLancamento === 'RENDIMENTO BRUTO NO MÊS') {
                this.rendimento += item.valor;
              }
              this.saldoAtual = lancamentos[lancamentos.length - 1].saldo;
            });
          this.msg = '';
          this.mostraDetalhe = true;
        } else {
          this.lstLancamentos = [];
          this.podeEditar = true;
          this.msg = 'Não foi encontrado nenhum lançamento para a pesquisa realizada.';
        }
      },
        error => {
          console.log('Erro ao carregar extrato filtrado:');
          console.log(error);
          this.lstLancamentos = [];
          this.msg = 'Ocorreu um erro ao pesquisar os lançamentos deste exercício. Tente novamente mais tarde.';
          this.loading = false;
        },
        () => {
          this.loading = false;
          this.verificaStatusPrestacao();
        });
  }

  cadastrarLancamentoRedirecionar() {
    this.router.navigate(['/gestaoFinanceira/conta-investimento/cadastrarLancamento/' + this.filtroAno + '/' + this.filtroMes]);
  }

  excluirLancamento(idLancamento: string) {
    console.log('Excluindo lançamento:');
    console.log(idLancamento);
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
            obj.push({
              tipoLancamento: element.tipoLancamento,
              anoExercicio: element.anoExercicio,
              mesExercicio: element.mesExercicio,
              dataEvento: element.dataEvento,
              valor: element.valor,
              saldo: element.saldo,
              itemLancamento: element.itemLancamento,
              federacao: element.federacao
            });
          });
          this.excelService.exportAsExcelFile(obj, 'Lancamentos');
        }
      }
    );
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
        console.log(data);
        if (data.length > 0) {
          console.log(data);
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
