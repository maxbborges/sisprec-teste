import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { range } from 'rxjs';
import { map, toArray } from 'rxjs/operators';

import { RelatorioService } from '../services/relatorio.service';
import { Util } from '../shared/helpers/util';
import { Indicador, Usuario } from '../shared/models/responses/sisprec-response';
import { ApiIndicadorService } from '../shared/services/api-indicador.service';
import { ExcelService } from '../shared/services/excel.service';
import { StorageService } from '../shared/services/storage.service';

@Component({ templateUrl: './relatorio-analise-prestacao-contas.component.html',
  standalone: false
})
export class RelatorioAnalisePrestacaoContasComponent implements OnInit {
  anoExercicioSelecionado: string;
  anosExercicio: number[] = [] as number[];
  botaoBaixarDesativado = true;
  carregando: boolean = false as boolean;
  datePipe = new DatePipe('pt-BR');
  detalhadoOuConsolidadoSelecionado: string;
  federacaolecionada: string;
  federacoes: Indicador[] = [] as Indicador[];
  historicosPrestacaoContas: any[] = [] as any[];
  idFederacao: number;
  mesExercicioSelecionado: string;
  mesesExercicio: { idMes: number, nome: string }[] = [] as { idMes: number, nome: string }[];
  prestacoesContas: any[] = [] as any[];
  relatorioAnalisePrestacaoContasForm: FormGroup = {} as FormGroup;
  resultadoNaoEncontrado = false;
  usuario: Usuario;

  constructor(
    private apiIndicadorService: ApiIndicadorService,
    private fb: FormBuilder,
    private relatorioService: RelatorioService,
    private storageService: StorageService,
    private excelService: ExcelService
  ) { }

  ngOnInit(): void {

    this.usuario = this.storageService.getUsuarioLogado();

    this.idFederacao = this.usuario.idFiliacao;

    range(1, 12).pipe(
      map(x => ({ idMes: x, nome: Util.mes(x) })),
      toArray())
      .subscribe(x => this.mesesExercicio = x);

    const ano = 2020;
    const anoAtual = new Date().getFullYear();

    range(ano, (anoAtual + 1) - ano)
      .pipe(toArray())
      .subscribe(x => this.anosExercicio = x);

    this.apiIndicadorService
      .listarTodosIndicadoresPorTipoSigla('Federacao')
      .pipe(map(x => x.filter(y => y.sigla !== 'DEX')))
      .subscribe(x => this.federacoes = x);

    this.relatorioAnalisePrestacaoContasForm = this.fb.group({
      detalhadoOuConsolidado: ['detalhado', [Validators.required]],
      idFederacao: [['UsuarioFederacao', 'UsuarioPresidente'].includes(this.usuario.tipoUsuarioSigla) ? this.idFederacao.toString() : '0', [Validators.required]],
      mesExercicio: ['0', [Validators.required]],
      anoExercicio: ['0', [Validators.required]]
    });

  }

  pesquisar(): void {

    this.historicosPrestacaoContas = [];
    this.prestacoesContas = [];

    this.relatorioAnalisePrestacaoContasForm.disable();
    this.botaoBaixarDesativado = true;
    this.resultadoNaoEncontrado = false;

    this.detalhadoOuConsolidadoSelecionado = this.v.detalhadoOuConsolidado;
    this.federacaolecionada = this.v.idFederacao;
    this.mesExercicioSelecionado = this.v.mesExercicio;
    this.anoExercicioSelecionado = this.v.anoExercicio;

    const o = {
      idFederacao: this.v.idFederacao,
      anoExercicio: this.v.anoExercicio,
      mesExercicio: this.v.mesExercicio
    };

    if (this.v.detalhadoOuConsolidado === 'detalhado') {
      this.relatorioService
        .obterTodosHistoricosPrestacaoContas(o)
        .subscribe(x => {
          this.historicosPrestacaoContas = x;
          this.relatorioAnalisePrestacaoContasForm.enable();
          if (x.length > 0) {
            this.botaoBaixarDesativado = false;
          } else {
            this.resultadoNaoEncontrado = true;
          }
        }, () => {
          this.relatorioAnalisePrestacaoContasForm.enable();
        });
    } else {
      this.relatorioService
        .obterTodasPrestacoesContas(o)
        .subscribe(x => {
          this.historicosPrestacaoContas = [];
          this.prestacoesContas = x;
          this.relatorioAnalisePrestacaoContasForm.enable();
          if (x.length > 0) {
            this.botaoBaixarDesativado = false;
          } else {
            this.resultadoNaoEncontrado = true;
          }
        }, () => {
          this.relatorioAnalisePrestacaoContasForm.enable();
        });
    }

  }

  baixarExcel(): void {

    this.v.detalhadoOuConsolidado === 'detalhado' ?
      this.criarExcelRelatorioDetalhado(this.historicosPrestacaoContas) :
      this.criarExcelRelatorioConsolidado(this.prestacoesContas);

  }

  baixarPdf(): void {

    this.v.detalhadoOuConsolidado === 'detalhado' ?
      this.criarPdfRelatorioDetalhado(this.historicosPrestacaoContas) :
      this.criarPdfRelatorioConsolidado(this.prestacoesContas);

  }

  colocarNomeMes(numero: number): string {

    return Util.mes(numero);

  }

  private criarPdfRelatorioDetalhado(relatorioAnalisePrestacaoContas: any): void {

    const doc: any = new jsPDF('l', 'px', 'a4');

    doc.setFontSize(12);

    doc.text('RELATÓRIO DE ANÁLISE DA PRESTAÇÃO DE CONTAS DETALHADO', 10, 15);

    doc.setFontSize(10);

    relatorioAnalisePrestacaoContas.forEach((x, k) => {

      const relatorios = [];

      x.itensHistoricoPrestacaoContasResponseModel.forEach(y => {
        relatorios.push([
          this.datePipe.transform(y.dataCadastro, 'short'),
          y.nomeUsuarioCadastro,
          y.versao ? y.nomeStatusPrestacaoContas + ' - Versão: ' + y.versao : y.nomeStatusPrestacaoContas,
          y.itensRetornadoContaCorrente,
          y.itensRetornadoDespesaReceita,
          y.itensRetornadoContaInvestimento,
          y.itensRetornadoDocumentacao
        ]);
      });

      autoTable(doc, {
        margin: 10,
        head: [
          [{
            content:
              `Federação: ${x.siglaFederacao} | Mês: ${x.mesExercicio} - ${Util.mes(x.mesExercicio)} | Ano: ${x.anoExercicio}`, colSpan: 7
          }],
          [
            { content: 'Data', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
            { content: 'Usuário', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
            { content: 'Status da Prestação de Contas', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
            { content: 'Conta Corrente', styles: { halign: 'center' } },
            { content: 'Despesa/Receita', styles: { halign: 'center' } },
            { content: 'Conta Investimento', styles: { halign: 'center' } },
            { content: 'Documentação', styles: { halign: 'center' } }
          ],
          [{ content: 'Item(ns) Retornado(s)', colSpan: 4, styles: { halign: 'center' } }]
        ],
        body: relatorios,
        startY: k === 0 ? 25 : doc.lastAutoTable.finalY + 10,
        theme: 'grid'
      });

    });


    doc.save(`Relatório de Análise da Prestação de Contas Detalhado - ${this.escreverNomeArquivo}.pdf`);

  }

  private criarPdfRelatorioConsolidado(relatorioAnalisePrestacaoContas: any): void {

    const relatorios = [];
    const doc: any = new jsPDF('l', 'px', 'a4');

    doc.setFontSize(12);

    doc.text('RELATÓRIO DE ANÁLISE DA PRESTAÇÃO DE CONTAS CONSOLIDADO', 10, 15);

    doc.setFontSize(10);

    relatorioAnalisePrestacaoContas.forEach(x => {
      relatorios.push([
        x.siglaFederacao,
        x.anoExercicio,
        x.mesExercicio + ' - ' + Util.mes(x.mesExercicio),
        this.datePipe.transform(x.dataEnvioPrestacaoContas, 'short'),
        x.quantidadeIteracoes,
        x.totalItensAnalisados,
        x.totalItensRetornados,
        x.contaCorrente,
        x.despesaReceita,
        x.contaInvestimento,
        x.documentacao
      ]);
    });

    autoTable(doc, {
      margin: 10,
      head: [[
        'Federação',
        'Ano',
        'Mês',
        'Data de Envio da Prestação de Contas',
        'Quantidade de Iterações',
        'Total de Itens Analisados',
        'Total de Itens Retornados',
        'Conta Corrente',
        'Despesa/Receita',
        'Conta Investimento',
        'Documentação'
      ]],
      body: relatorios,
      startY: 25,
      theme: 'grid'
    });

    doc.save(`Relatório de Análise da Prestação de Contas Consolidado - ${this.escreverNomeArquivo}.pdf`);

  }

  private criarExcelRelatorioDetalhado(relatorioAnalisePrestacaoContas: any): void {

    const relatorio = [];

    relatorioAnalisePrestacaoContas.forEach((x, k) => {

      x.itensHistoricoPrestacaoContasResponseModel.forEach(y => {

        relatorio.push({
          Federacao: x.siglaFederacao,
          Mes: `${x.mesExercicio} - ${Util.mes(x.mesExercicio)}`,
          Ano: x.anoExercicio,
          Data: this.datePipe.transform(y.dataCadastro, 'short'),
          Usuario: y.nomeUsuarioCadastro,
          'Status da Prestacao de Contas':
            y.versao ? y.nomeStatusPrestacaoContas + ' - Versão: ' + y.versao : y.nomeStatusPrestacaoContas,
          'Conta Corrente Item(ns) Retornado(s)': y.itensRetornadoContaCorrente,
          'Despesa/Receita Item(ns) Retornado(s)': y.itensRetornadoDespesaReceita,
          'Conta Investimento Item(ns) Retornado(s)': y.itensRetornadoContaInvestimento,
          'Documentacao Item(ns) Retornado(s)': y.itensRetornadoDocumentacao
        });

      });

      if ((relatorioAnalisePrestacaoContas.length - 1) !== k) {
        relatorio.push({
          Federacao: '',
          Mes: '',
          Ano: '',
          Data: '',
          Usuario: '',
          'Status da Prestacao de Contas': '',
          'Conta Corrente Item(ns) Retornado(s)': '',
          'Despesa/Receita Item(ns) Retornado(s)': '',
          'Conta Investimento Item(ns) Retornado(s)': '',
          'Documentacao Item(ns) Retornado(s)': ''
        });
        relatorio.push({
          Federacao: 'Federacao',
          Mes: 'Mes',
          Ano: 'Ano',
          Data: 'Data',
          Usuario: 'Usuario',
          'Status da Prestacao de Contas': 'Status da Prestacao de Contas',
          'Conta Corrente Item(ns) Retornado(s)': 'Conta Corrente Item(ns) Retornado(s)',
          'Despesa/Receita Item(ns) Retornado(s)': 'Despesa/Receita Item(ns) Retornado(s)',
          'Conta Investimento Item(ns) Retornado(s)': 'Conta Investimento Item(ns) Retornado(s)',
          'Documentacao Item(ns) Retornado(s)': 'Documentacao Item(ns) Retornado(s)'
        });
      }
    });

    this.excelService.exportAsExcelFile(
      relatorio,
      `Relatório de Análise da Prestação de Contas Detalhado - ${this.escreverNomeArquivo}`
    );
  }

  private criarExcelRelatorioConsolidado(relatorioAnalisePrestacaoContas: any): void {

    const relatorio = [];

    relatorioAnalisePrestacaoContas.forEach(x => {

        relatorio.push({
          Federacao: x.siglaFederacao,
          Ano: x.anoExercicio,
          Mes: `${x.mesExercicio} - ${Util.mes(x.mesExercicio)}`,
          'Data de Envio da Prestacao de Contas': this.datePipe.transform(x.dataEnvioPrestacaoContas, 'short'),
          'Quantidade de Iteracoes': x.quantidadeIteracoes,
          'Total de Itens Analisados': x.totalItensAnalisados,
          'Total de Itens Retornados': x.totalItensRetornados,
          'Conta Corrente': x.contaCorrente,
          'Despesa/Receita': x.despesaReceita,
          'Conta Investimento': x.contaInvestimento,
          Documentacao: x.documentacao
        });

    });

    this.excelService.exportAsExcelFile(
      relatorio,
      `Relatório de Análise da Prestação de Contas Consolidado - ${this.escreverNomeArquivo}`
    );

  }

  verificarIguaisTodasSelecoes(): boolean {

    return !(this.detalhadoOuConsolidadoSelecionado === this.v.detalhadoOuConsolidado
      && this.federacaolecionada === this.v.idFederacao
      && this.mesExercicioSelecionado === this.v.mesExercicio
      && this.anoExercicioSelecionado === this.v.anoExercicio);
  }


  private get escreverNomeArquivo(): string {

    const federacao = this.v.idFederacao === '0' ? 'Todas federações' :
      this.federacoes.find(x => x.idIndicador === parseInt(this.v.idFederacao, 10)).sigla;
    const mesExercicio = this.v.mesExercicio === '0' ? 'Todos meses' : Util.mes(parseInt(this.v.mesExercicio, 10));
    const anoExercicio = this.v.anoExercicio === '0' ? 'Todos anos' : this.v.anoExercicio;

    return `${federacao} - ${mesExercicio} - ${anoExercicio}`;
  }

  get v() {

    return this.relatorioAnalisePrestacaoContasForm.value;

  }

}
