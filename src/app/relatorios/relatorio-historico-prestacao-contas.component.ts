import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { jsPDF } from "jspdf";
import { autoTable } from 'jspdf-autotable';
import {
  CategoriasParaRelatorio,
  Indicador,
  Usuario
} from "../shared/models/responses/sisprec-response";
import { StorageService } from "../shared/services/storage.service";

import { DatePipe, formatCurrency } from "@angular/common";

import { range } from "rxjs";
import { map, toArray } from "rxjs/operators";
import { Util } from "src/app/shared/helpers/util";
import { environment } from "src/environments/environment";
import * as XLSX from "xlsx";
import {
  RelatorioHistoricoDespesa,
  RelatorioHistoricoDocumentacao
} from "../shared/models/commands/cmdLancamento";
import { ListarNomeDocumentoFiltrado } from "../shared/models/commands/cmdNomeDocumento";
import { ApiIndicadorService } from "../shared/services/api-indicador.service";
import { ApiNomeDocumentoService } from "../shared/services/api-nome-documento.service";
import { ApiRelatorioService } from "../shared/services/api-relatorio.service";

@Component({
  templateUrl: "./relatorio-historico-prestacao-contas.component.html",
  standalone: false
})
export class RelatorioHistoricoPrestacaoContasComponent implements OnInit {
  public usuario: Usuario;
  public urlDownload = environment.urlApiSisprec + "arquivo/porId/";
  public anoExercicioSelecionado: number;
  public anosExercicio: number[] = [] as number[];
  public categorias: CategoriasParaRelatorio[];
  public categoriaSelecionada: CategoriasParaRelatorio;
  public datePipe = new DatePipe("pt-BR");
  public federacaolecionada: string;
  public federacoes: Indicador[] = [] as Indicador[];
  public idFederacao: number;
  public isDocumentacao: boolean = true;
  public mesExercicioSelecionado: string;
  public mesesExercicio: { idMes: number; nome: string }[] = [] as {
    idMes: number;
    nome: string;
  }[];
  public nomeDocumentoSelecionado: number;
  public nomesDocumento: { idNomeDocumento: number; nome: string }[] = [] as {
    idNomeDocumento: number;
    nome: string;
  }[];
  public relatorioHistoricoPrestacaoContasForm: FormGroup = {} as FormGroup;
  public resultadoNaoEncontrado = false;
  public listagem: any[] = [];

  constructor(
    private apiIndicadorService: ApiIndicadorService,
    private apiRelatorioService: ApiRelatorioService,
    private fb: FormBuilder,
    private nomeDocumentoService: ApiNomeDocumentoService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.usuario = this.storageService.getUsuarioLogado();
    this.idFederacao = 0;

    this.carregarMeses();
    this.carregarAnos();
    this.carregarFederacoes();
    this.carregarForm();
  }

  carregarMeses() {
    range(1, 12)
      .pipe(
        map((x) => ({ idMes: x, nome: Util.mes(x) })),
        toArray()
      )
      .subscribe((x) => {
        this.mesesExercicio = x;
      });
  }

  carregarAnos() {
    const ano = 2020;
    const anoAtual = new Date().getFullYear();

    range(ano, anoAtual + 1 - ano)
      .pipe(toArray())
      .subscribe((x) => (this.anosExercicio = x));
  }

  carregarFederacoes() {
    this.apiIndicadorService
      .listarTodosIndicadoresPorTipoSigla("Federacao")
      .pipe(map((x) => x.filter((y) => y.sigla !== "DEX")))
      .subscribe((x) => (this.federacoes = x));
  }

  carregarForm() {
    this.relatorioHistoricoPrestacaoContasForm = this.fb.group({
      documentacaoOuDespesa: ["documentacao", [Validators.required]],
      idFederacao: [
        ['UsuarioFederacao', 'UsuarioPresidente'].includes(this.usuario.tipoUsuarioSigla)
          ? this.usuario.idFiliacao
          : "",
        [Validators.required],
      ],
      mesExercicio: ["", [Validators.required]],
      anoExercicio: ["", [Validators.required]],
      nomeDocumento: [""],
      categoria: [""],
    });
    this.disableFederacao();
  }

  disableFederacao(){
    if(['UsuarioFederacao', 'UsuarioPresidente'].includes(this.usuario.tipoUsuarioSigla)){
      this.relatorioHistoricoPrestacaoContasForm.controls.idFederacao.disable();
    }
  }

  carregarNomesDocumento(ano: number) {
    this.relatorioHistoricoPrestacaoContasForm.patchValue({
      nomeDocumento: [""],
    });
    const cmdFiltrarListaNomeDocumento: ListarNomeDocumentoFiltrado = {
      exercicio: ano,
      idTipo: 0,
      ativo: 1,
    };
    this.nomeDocumentoService
      .listarNomeDocumentoFiltrado(cmdFiltrarListaNomeDocumento)
      .subscribe(
        (lstNomeDocumento) => {
          if (lstNomeDocumento.length > 0) {
            this.nomesDocumento = lstNomeDocumento;
          } else {
            this.nomesDocumento = null;
          }
        },
        (error) => {
          console.log("Erro ao retornar lista de nome de documentos:");
          console.log(error);
        }
      );
  }

  anoChange(ano: number) {
    if (ano > 0) {
      this.apiRelatorioService.buscarListaCategorias(ano).subscribe((data) => {
        this.categorias = data;
      });
      this.carregarNomesDocumento(ano);
    } else {
      this.categorias = [];
      this.categoriaSelecionada = null;

      this.nomesDocumento = [];
      this.nomeDocumentoSelecionado = null;
    }
  }

  mudancaTipo(opcao: string) {
    this.isDocumentacao = opcao === "documentacao";
    this.listagem = [];
    this.resultadoNaoEncontrado = false;
  }

  pesquisar(): void {
    if (this.relatorioHistoricoPrestacaoContasForm.invalid) {
      console.log("Formulário inválido!");

      return;
    }
    this.relatorioHistoricoPrestacaoContasForm.disable();

    if (this.isDocumentacao) {
      this.pesquisarDocumentacao();
    } else {
      this.pesquisarDespesa();
    }
  }

  pesquisarDocumentacao(): void {
    const form = this.relatorioHistoricoPrestacaoContasForm.value;

    const request: RelatorioHistoricoDocumentacao = {
      anoExercicio: form.anoExercicio,
      idFederacao: form.idFederacao,
      mesExercicio: form.mesExercicio,
    };

    if (form.nomeDocumento[0] === undefined) {
      request.idNomeDocumento = form.nomeDocumento;
    }

    this.apiRelatorioService.buscarRelatorioDocumentacao(request).subscribe(
      (result) => {
        if (result.length > 0) {
          this.listagem = result;
          this.resultadoNaoEncontrado = false;
        } else {
          this.listagem = [];
          this.resultadoNaoEncontrado = true;
        }
      },
      (error) => {
        console.log("Erro ao retornar lista de nome de documentos:");
        console.log(error);
      },
      () => {
        this.relatorioHistoricoPrestacaoContasForm.enable();
        this.disableFederacao();
      }
    );
  }

  pesquisarDespesa(): void {
    const form = this.relatorioHistoricoPrestacaoContasForm.value;

    const request: RelatorioHistoricoDespesa = {
      anoExercicio: form.anoExercicio,
      idFederacao: form.idFederacao,
      mesExercicio: form.mesExercicio,
    };

    if (form.categoria !== "") {
      request.categoria = {
        codigoItem: form.categoria[0],
        codigoSubitem: form.categoria[1],
        item: "",
      };
    }

    this.apiRelatorioService.buscarRelatorioHistoricoDespesa(request).subscribe(
      (result) => {
        if (result.length > 0) {
          this.listagem = result;
          this.resultadoNaoEncontrado = false;
        } else {
          this.listagem = [];
          this.resultadoNaoEncontrado = true;
        }
      },
      (error) => {
        console.log("Erro ao retornar lista de nome de documentos:");
        console.log(error);
      },
      () => {
        this.relatorioHistoricoPrestacaoContasForm.enable();
        this.disableFederacao();
      }
    );
  }

  baixarExcel(): void {
    const relatorio = [];
    if (this.isDocumentacao) {
      this.listagem.forEach((row) => {
        const motivo = row.motivo !== null ? " - " + row.motivo : "";
        relatorio.push({
          N: row.n,
          Data: this.datePipe.transform(row.data, "short"),
          "Usuário (e-mail)": row.email,
          Item: row.nomeDocumento,
          Análise: row.status + motivo,
        });
      });
    } else {
      this.listagem.forEach((row) => {
        const motivo = row.motivo !== null ? " - " + row.motivo : "";
        relatorio.push({
          N: row.n,
          Data: this.datePipe.transform(row.data, "short"),
          "Usuário (e-mail)": row.email,
          "Categoria Item": row.item,
          valor: formatCurrency(row.valorTotal, "pt-BR", "R$"),
          Análise: row.status + motivo,
        });
      });
    }

    const ws = XLSX.utils.json_to_sheet(relatorio);
    ws["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 35 },
      { wch: 45 },
      { wch: 20 },
      !this.isDocumentacao ? { wch: 35 } : null,
    ];
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    XLSX.writeFile(wb, "RelatorioDeHistoricoPrestacaoDeContas.xlsx");
  }

  baixarPdf(): void {
    if (this.isDocumentacao) {
      this.criarPdfDocumentacao();
    } else {
      this.criarPdfDespesa();
    }
  }

  criarPdfDocumentacao(): void {
    const relatorios = [];

    this.listagem.forEach((row) => {
      const motivo = row.motivo !== null ? " - " + row.motivo : "";
      relatorios.push([
        row.n,
        this.datePipe.transform(row.data, "short"),
        row.email,
        row.nomeDocumento,
        row.status + motivo,
      ]);
    });

    const titulos = ["N", "Data", "Usuário (e-mail)", "Item", "Análise"];
    this.criarPdf(titulos, relatorios);
  }

  criarPdfDespesa(): void {
    const relatorios = [];

    this.listagem.forEach((row) => {
      const motivo = row.motivo !== null ? " - " + row.motivo : "";
      relatorios.push([
        row.n,
        this.datePipe.transform(row.data, "short"),
        row.email,
        row.item,
        formatCurrency(row.valorTotal, "pt-BR", "R$"),
        row.status + motivo,
      ]);
    });

    const titulos = [
      "N",
      "Data",
      "Usuário (e-mail)",
      "Categoria Item",
      "Valor",
      "Análise",
    ];
    this.criarPdf(titulos, relatorios);
  }

  criarPdf(arrayTitulos: any[], rowsTabela: any[]): void {
    const doc: any = new jsPDF("l", "px", "a4");

    doc.setFontSize(12);

    doc.text("RELATÓRIO DE HISTÓRICO DE PRESTAÇÃO DE CONTAS", 10, 15);

    doc.setFontSize(10);

    autoTable(doc, {
      margin: 10,
      head: [arrayTitulos],
      body: rowsTabela,
      startY: 25,
      theme: "grid",
    });

    doc.save(`RelatórioDeHistóricoDePrestacaoDeContas.pdf`);
  }
}
