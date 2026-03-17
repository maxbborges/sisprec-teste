import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { formatCurrency } from "@angular/common";
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { environment } from "../../environments/environment";
import { DateUtils } from "../shared/helpers/Data";
import { Util } from "../shared/helpers/util";
import { RelatorioPrestacaoContasResponse } from "../shared/models/responses/sisprec-response";

@Injectable({ providedIn: "root" })
export class RelatorioService {
  urlApi = `${environment.urlApiSisprec}`;

  constructor(private httpClient: HttpClient) {}

  obterTodosHistoricosPrestacaoContas(requestModel: any): Observable<any[]> {
    console.log(`${this.urlApi}/historicos-prestacao-contas`, {
      params: requestModel,
    });
    return this.httpClient.get<any[]>(
      `${this.urlApi}/historicos-prestacao-contas`,
      { params: requestModel }
    );
  }

  obterTodasPrestacoesContas(requestModel: any): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.urlApi}/prestacoes-contas`, {
      params: requestModel,
    });
  }

  public criarPdf(relatorioPrestacaoContas: RelatorioPrestacaoContasResponse, locale: string, usuario: any, mesExercicio: string, anoExercicio: number, isVerArquivo:boolean = true) {

    const relatorioPrestacaoContasLancamentos = [];

    relatorioPrestacaoContas.relatorioPrestacaoContasLancamentosResponse.forEach(y => {
      relatorioPrestacaoContasLancamentos.push([
        DateUtils.format(y.dataCC, 'dd/MM/yyyy'),
        y.descricaoCC.trim(),
        y.entradaCC ? formatCurrency(y.entradaCC, locale, 'R$') : '',
        y.saidaCC ? formatCurrency(y.saidaCC, locale, 'R$') : ''
      ]);
    });

    relatorioPrestacaoContasLancamentos.push([
      { content: 'TOTAIS', colSpan: 2 },
      formatCurrency(relatorioPrestacaoContas.totalEntradasExtratoCC, locale, 'R$'),
      formatCurrency(relatorioPrestacaoContas.totalSaidasExtratoCC, locale, 'R$')
    ]);

    const doc: any = new jsPDF('p', 'px', 'a4');

    doc.setFontSize(15);
    doc.text('RELATÓRIO DE PRESTAÇÃO DE CONTAS', 30, 30);

    doc.setFontSize(10);
    doc.text(usuario.filiacaoSigla.toUpperCase() + ' - ' + usuario.filiacao.toUpperCase(), 30, 50);

    doc.setFontSize(12);
    doc.text(Util.mes(parseInt(mesExercicio, 10)) + '/' + anoExercicio, 30, 70);

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
          valor: formatCurrency(relatorioPrestacaoContas.saldoAnteriorCC, locale, 'R$')
        },
        {
          texto: 'ENTRADAS',
          valor: formatCurrency(relatorioPrestacaoContas.totalEntradasCC, locale, 'R$')
        },
        {
          texto: 'SAÍDAS',
          valor: formatCurrency(relatorioPrestacaoContas.totalSaidasCC, locale, 'R$')
        },
        {
          texto: 'SALDO ATUAL',
          valor: formatCurrency(relatorioPrestacaoContas.saldoAtualCC, locale, 'R$')
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
          valor: formatCurrency(relatorioPrestacaoContas.saldoAnteriorCI, locale, 'R$')
        },
        {
          texto: 'ENTRADAS',
          valor: formatCurrency(relatorioPrestacaoContas.totalEntradasCI, locale, 'R$')
        },
        {
          texto: 'SAÍDAS',
          valor: formatCurrency(relatorioPrestacaoContas.totalSaidasCI, locale, 'R$')
        },
        {
          texto: 'RENDIMENTOS',
          valor: formatCurrency(relatorioPrestacaoContas.totalRendimentosCI, locale, 'R$')
        },
        {
          texto: 'IR',
          valor: formatCurrency(relatorioPrestacaoContas.totalIRCI, locale, 'R$')
        },
        {
          texto: 'IOF',
          valor: formatCurrency(relatorioPrestacaoContas.totalIOFCI, locale, 'R$')
        },
        {
          texto: 'SALDO ATUAL',
          valor: formatCurrency(relatorioPrestacaoContas.saldoAtualCI, locale, 'R$')
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
          valor: formatCurrency(relatorioPrestacaoContas.saldoAtualCC, locale, 'R$')
        },
        {
          texto: 'SALDO CONTA INVESTIMENTO',
          valor: formatCurrency(relatorioPrestacaoContas.saldoAtualCI, locale, 'R$')
        },
        {
          texto: 'SALDO ATUAL',
          valor: formatCurrency(relatorioPrestacaoContas.saldoAtualCCCI, locale, 'R$')
        }
      ],
      theme: 'grid',
      startY: doc.lastAutoTable.finalY + 25
    });

    if (isVerArquivo === true) {
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      return pdfBlob;
    } else {
      return doc.output('blob');
    }

  }
}
