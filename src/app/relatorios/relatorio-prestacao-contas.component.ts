import { formatCurrency } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { DateUtils } from 'src/app/shared/helpers/Data';
import { Util } from 'src/app/shared/helpers/util';
import { RelatorioPrestacaoContasResponse, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { ApiRelatorioService } from 'src/app/shared/services/api-relatorio.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  templateUrl: './relatorio-prestacao-contas.component.html',
  standalone: false
})
export class RelatorioPrestacaoContasComponent implements OnInit {

  formPesquisa: FormGroup;
  usuario: Usuario;

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private apiRelatorioService: ApiRelatorioService,
    private fb: FormBuilder,
    private storageService: StorageService
  ) {
    this.usuario = this.storageService.getUsuarioLogado();
  }

  ngOnInit() {

    this.formPesquisa = this.fb.group({
      mesExercicio: ['', Validators.required],
      anoExercicio: ['', Validators.required],
      idFederacao: this.usuario.idFiliacao
    });

  }

  gerar() {

    if (this.formPesquisa.invalid) {
      return;
    }

    this.apiRelatorioService
      .visualizarRelatorioPrestacaoContas(
        this.formPesquisa.value.mesExercicio,
        this.formPesquisa.value.anoExercicio,
        this.formPesquisa.value.idFederacao
      )
      .subscribe(
        x => this.criarPdf(x),
        e => console.log(e)
      );

  }

  private criarPdf(relatorioPrestacaoContas: RelatorioPrestacaoContasResponse) {

    const relatorioPrestacaoContasLancamentos = [];

    relatorioPrestacaoContas.relatorioPrestacaoContasLancamentosResponse.forEach(y => {
      relatorioPrestacaoContasLancamentos.push([
        DateUtils.format(y.dataCC, 'dd/MM/yyyy'),
        y.descricaoCC.trim(),
        y.entradaCC ? formatCurrency(y.entradaCC, this.locale, 'R$') : '',
        y.saidaCC ? formatCurrency(y.saidaCC, this.locale, 'R$') : ''
      ]);
    });

    relatorioPrestacaoContasLancamentos.push([
      { content: 'TOTAIS', colSpan: 2 },
      formatCurrency(relatorioPrestacaoContas.totalEntradasExtratoCC, this.locale, 'R$'),
      formatCurrency(relatorioPrestacaoContas.totalSaidasExtratoCC, this.locale, 'R$')
    ]);

    const doc: any = new jsPDF('p', 'px', 'a4');

    doc.setFontSize(15);
    doc.text('RELATÓRIO DE PRESTAÇÃO DE CONTAS', 30, 30);

    doc.setFontSize(10);
    doc.text(this.usuario.filiacaoSigla.toUpperCase() + ' - ' + this.usuario.filiacao.toUpperCase(), 30, 50);

    doc.setFontSize(12);
    doc.text(Util.mes(parseInt(this.formPesquisa.value.mesExercicio, 10)) + '/' + this.formPesquisa.value.anoExercicio, 30, 70);

    autoTable(doc, {
      head: [['Data', 'Descricao', 'Entradas', 'Saidas']],
      body: relatorioPrestacaoContasLancamentos,
      startY: 75,
      theme: 'grid',
      showHead: 'firstPage'
    });

    doc.setFontSize(15);
    doc.text('Resumo Financeiro', 30, doc.lastAutoTable.finalY + 25);

    doc.setFontSize(12);
    doc.text('Conta Corrente', 30, doc.lastAutoTable.finalY + 45);

    autoTable(doc, {
      body: [
        {
          texto: 'SALDO ANTERIOR',
          valor: formatCurrency(relatorioPrestacaoContas.saldoAnteriorCC, this.locale, 'R$')
        },
        {
          texto: 'ENTRADAS',
          valor: formatCurrency(relatorioPrestacaoContas.totalEntradasCC, this.locale, 'R$')
        },
        {
          texto: 'SAÍDAS',
          valor: formatCurrency(relatorioPrestacaoContas.totalSaidasCC, this.locale, 'R$')
        },
        {
          texto: 'SALDO ATUAL',
          valor: formatCurrency(relatorioPrestacaoContas.saldoAtualCC, this.locale, 'R$')
        }
      ],
      theme: 'grid',
      startY: doc.lastAutoTable.finalY + 50
    });

    doc.text('Conta Investimento', 30, doc.lastAutoTable.finalY + 20);

    autoTable(doc, {
      body: [
        {
          texto: 'SALDO ANTERIOR',
          valor: formatCurrency(relatorioPrestacaoContas.saldoAnteriorCI, this.locale, 'R$')
        },
        {
          texto: 'ENTRADAS',
          valor: formatCurrency(relatorioPrestacaoContas.totalEntradasCI, this.locale, 'R$')
        },
        {
          texto: 'SAÍDAS',
          valor: formatCurrency(relatorioPrestacaoContas.totalSaidasCI, this.locale, 'R$')
        },
        {
          texto: 'RENDIMENTOS',
          valor: formatCurrency(relatorioPrestacaoContas.totalRendimentosCI, this.locale, 'R$')
        },
        {
          texto: 'IR',
          valor: formatCurrency(relatorioPrestacaoContas.totalIRCI, this.locale, 'R$')
        },
        {
          texto: 'IOF',
          valor: formatCurrency(relatorioPrestacaoContas.totalIOFCI, this.locale, 'R$')
        },
        {
          texto: 'SALDO ATUAL',
          valor: formatCurrency(relatorioPrestacaoContas.saldoAtualCI, this.locale, 'R$')
        }
      ],
      theme: 'grid',
      startY: doc.lastAutoTable.finalY + 25
    });

    doc.text('Resumo Financeiro', 30, doc.lastAutoTable.finalY + 20);

    autoTable(doc, {
      body: [
        {
          texto: 'SALDO CONTA CORRENTE',
          valor: formatCurrency(relatorioPrestacaoContas.saldoAtualCC, this.locale, 'R$')
        },
        {
          texto: 'SALDO CONTA INVESTIMENTO',
          valor: formatCurrency(relatorioPrestacaoContas.saldoAtualCI, this.locale, 'R$')
        },
        {
          texto: 'SALDO ATUAL',
          valor: formatCurrency(relatorioPrestacaoContas.saldoAtualCCCI, this.locale, 'R$')
        }
      ],
      theme: 'grid',
      startY: doc.lastAutoTable.finalY + 25
    });

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');

  }

}
