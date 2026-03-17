import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { MotivoService } from 'src/app/services/motivo.service';
import { Util } from 'src/app/shared/helpers/util';
import { ListarExtratoFiltrado } from 'src/app/shared/models/commands/cmdLancamento';
import { Lancamento, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-analisar-conta-investimento',
  templateUrl: './analisar-conta-investimento.component.html',
  styleUrls: ['./analisar-conta-investimento.component.scss'],
  standalone: false
})
export class AnalisarContaInvestimentoComponent implements OnInit {

  public lstLancamentos: Lancamento[] = [];
  public lstTipo: any[] = [];
  public lstTipoAnalise: any[] = [];
  public msg = '';
  public strExercicio = '';
  public strStatusAtual = '';
  public strSaldo = 0;
  public loaditems = false;
  public cmdFiltrarListaExtrato: ListarExtratoFiltrado;

  usuario: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private indicadorService: ApiIndicadorService,
    private apiLancamentoService: ApiLancamentoService,
    private excelService: ExcelService,
    private storageService: StorageService,
    private motivoService: MotivoService,
    private location: Location,
    private _segurancaService: SegurancaCheckService
  ) {
    this.loaditems = true;
  }

  ngOnInit() {

    this.usuario = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);

    this.carregarMotivos();
    this.carregarTiposAnalise();

    const params = this.route.snapshot.params;
    this.carregarLancamentos(params.anoExercicio, params.idFederacao, params.mesExercicio, params.idPrestacaoContas);
  }

  carregarMotivos() {
    this.motivoService.obterTodos()
    .pipe(map(x => x.filter(y => y.ativo)))
    .subscribe(
      result => {
        this.lstTipo = result;
      }
    );
  }

  carregarTiposAnalise() {
    this.indicadorService.listarTodosIndicadoresPorTipoSigla('Analise').subscribe(
      result => {
        result = result.filter(item => item.sigla.includes('Presidente') == false);
        this.lstTipoAnalise = result.sort((a, b) => {
          if (a.idIndicador < b.idIndicador) { return -1; }
        });
      }
    );
  }

  voltar(){
    this.location.back();
  }

  carregarLancamentos(fAno: number, idfederacao: any, fMes: any, idprestacaocontas: any) {

    this.cmdFiltrarListaExtrato = {
      ano: fAno,
      idFederacao: idfederacao,
      mes: fMes,
      idTipoConta: 1007,
      idPrestacaoContas: idprestacaocontas
    };

    this.apiLancamentoService.listarExtratoFiltrado(this.cmdFiltrarListaExtrato).subscribe((lancamentos) => {
      if (lancamentos.length > 0) {
        this.lstLancamentos = lancamentos;
        this.msg = '';

        // if (lancamentos.length > 0) {
        //   this.strStatusAtual = lancamentos[0].statusAtualPrestacaoContas;
        // } else {
        //   this.strStatusAtual = '--';
        // }
      } else {
        this.lstLancamentos = [];
        this.msg = 'Não foi encontrado nenhum lançamento para a pesquisa realizada.';
      }

      this.loaditems = false;
    }, (error) => {
      console.log('Erro ao carregar extrato filtrado:');
      console.log(error);
      this.lstLancamentos = [];
      this.msg = 'Ocorreu um erro ao pesquisar os lançamentos deste exercício. Tente novamente mais tarde.';
    }, () => {
    });

    this.apiLancamentoService.obterSaldos(this.cmdFiltrarListaExtrato)
      .subscribe(x => {
        this.strExercicio = x.prestacaoContas.mesExercicio + '/' + x.prestacaoContas.anoExercicio;
        this.strSaldo = x.saldos.saldoAtualCI;
        this.strStatusAtual = x.prestacaoContas.nomeStatusAtualPrestacaoContas;
      });
  }

  alteraStatusLancamento(idLancamento: any, analise: any, index: number) {

    const tr = document.getElementById(idLancamento);
    // tr.classList.remove('bg-warning');   // remove the class
    tr.style.backgroundColor = '';

    if (analise.sigla === 'RetornadoAjustes') {
      // tr.classList.add('bg-warning');   // add the class
      tr.style.backgroundColor = '#ffff00';
    }

    this.apiLancamentoService.alterarAnalise(idLancamento, analise.idIndicador, this.storageService.getUsuarioLogado().idUsuario).subscribe((data) => {
      if (!data) {
        console.log('Falha ao alterar o status');
      } else {
        let selectdropdownlist: any;
        selectdropdownlist = document.getElementById(idLancamento + 'MotivoRetornoParaAjustes');
        selectdropdownlist.value = '';

        let textarea: any;
        this.alteraObservacaoRetornoParaAjustes(idLancamento, "");
        textarea = document.getElementById(idLancamento + 'ObservacaoRetornoParaAjustes');
        textarea.value = '';
        if (analise.sigla !== 'RetornadoAjustes') {
          selectdropdownlist.style.display = 'none';
          textarea.style.display = 'none';
        } else {
          selectdropdownlist.style.display = 'block';
          textarea.style.display = 'block';
        }
      }
    });
  }

  alteraMotivoRetornoParaAjustes(idLancamento: any, motivo: any) {
    // console.log(idLancamento + ' ' + motivo.target.value);
    if (motivo.target.value !== '' && motivo.target.value !== 0) {
      this.apiLancamentoService.alterarMotivoRetornoParaAjustes(idLancamento, motivo.target.value, this.storageService.getUsuarioLogado().idUsuario).subscribe((data) => {
        if (!data) {
          console.log('Falha ao alterar o status');
        }
      });
    }
  }

  alteraObservacaoRetornoParaAjustes(idLancamento: any, observacao: string) {
    this.apiLancamentoService.alterarObservacaoRetornoParaAjustes(idLancamento, observacao, this.storageService.getUsuarioLogado().idUsuario ).subscribe((data) => {
    });
  }

  maskDate(date: string) {
    return Util.formatStringDate(date);
  }

  exportarClick() {

    this.excelService.exportAsExcelFile(this.lstLancamentos, 'Lancamentos');
  }

  ativarBotaoAnalisar(lancamento: any) {

    const perfil = this.storageService.getUsuarioLogado().tipoUsuarioSigla;
    const status = lancamento.siglaStatusAtualPrestacaoContas;

    if (
      status === 'EnviadaAnalise' ||
      status === 'Reanalise' ||
      (status === 'AprovadaConferenciaDocumentacao' && perfil === 'UsuarioGestorFiscal')
    ) {
      return false;
    }
    return true;

  }

}
