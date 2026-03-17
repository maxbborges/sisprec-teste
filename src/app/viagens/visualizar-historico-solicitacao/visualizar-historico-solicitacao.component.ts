import { jsPDF } from "jspdf";
import { autoTable } from 'jspdf-autotable';

import { Location } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ValidationErrors } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { DateUtils } from 'src/app/shared/helpers/Data';
import { AnaliseSolicitacaoDiaria, SolicitacaoDiariaCompletoPesquisa, SolicitacaoDiariaTrecho } from 'src/app/shared/models/commands/cmdSolicitacaoDiaria';
import { Indicador, Usuario } from "src/app/shared/models/responses/sisprec-response";
import { ApiIndicadorService } from "src/app/shared/services/api-indicador.service";
import { ApiSolicitacaoDiaria } from 'src/app/shared/services/api-solicitacao-diaria';

@Component({
  selector: "app-viagens-visualizar-historico-solicitacao",
  templateUrl: "./visualizar-historico-solicitacao.component.html",
  standalone: false
})
export class ViagensVisualizarHistoricoSolicitacaoComponent implements OnInit {
  public formVisualizar: FormGroup;
  public usuario: Usuario;
  public status: Array<Indicador> = [];
  public statusSelecao: Array<any> = [];
  public idSolicitacao: string = "";
  public resultadoPesquisa: Array<AnaliseSolicitacaoDiaria> = [];
  public resultadoPesquisaFiltrado: Array<AnaliseSolicitacaoDiaria> = [];
  public dadosBasicos: SolicitacaoDiariaCompletoPesquisa;
  public origem: SolicitacaoDiariaTrecho | null = null;
  public destino: SolicitacaoDiariaTrecho | null = null;
  public cabecalhoPDF: Array<any> = [];
  public carregando: boolean = true;
  public msg: string;
  public submited: boolean = false;

  validarData(group: FormGroup) : ValidationErrors{
    const dataInicial = group.controls.dataInicial;
    const dataFinal = group.controls.dataFinal;

    if(dataInicial.value === '' || dataFinal.value === '')
      return;
    else if(dataInicial.value > dataFinal.value){
      dataInicial.setErrors({maiorDataFinal:true});
      dataFinal.setErrors({menorDataInicial:true});
    } else {
      dataInicial.setErrors(null);
      dataFinal.setErrors(null);
    }
    return;
  }
  
  constructor(
    private formBuilder: FormBuilder,
    private solicitacaoDiariaService : ApiSolicitacaoDiaria,
    private route: ActivatedRoute,
    private apiIndicadorService: ApiIndicadorService,
    private location: Location
  ){}

  ngOnInit(): void {
    //recuperar id
    this.route.params.subscribe(param => {
      this.idSolicitacao = param.id;
    });

    //inicializar formulario
    this.inicializarFormulario();

    //buscar dados do relatório
    this.solicitacaoDiariaService.recuperarSolicitacaoPorId(this.idSolicitacao).subscribe((v) => {
      this.dadosBasicos = v;
      this.preencherFormulario();
      this.getDatas();
    }, (e) => {
      alert("Ocorreu um erro inesperado");
    })

    //buscar histórico da solicitação
    this.solicitacaoDiariaService.recuperarHistoricoPorId(this.idSolicitacao).subscribe((v) => {
      console.log(v);
      this.resultadoPesquisa = v;
      this.resultadoPesquisaFiltrado = v;
      this.carregando = false;
    }, (e) => {
      alert("Ocorreu um erro inesperado");
      this.carregando = false;
    })
  }

  getDatas() {
    this.origem = this.dadosBasicos.solicitacaoDiariaTrecho.reduce((min, c) => c.dataInicio < min.dataInicio ? c : min);
    this.destino = this.dadosBasicos.solicitacaoDiariaTrecho.reduce((max, c) => c.dataInicio < max.dataInicio ? c : max);
  }

  inicializarFormulario() {
    this.formVisualizar = this.formBuilder.group({
      nome: [''],
      dataInicial: [''],
      dataFinal: [''],
    },{
      validators: [this.validarData]
    });
  }

  pesquisar(){
    this.submited = true;

    if(this.formVisualizar.invalid) {
      return;
    }

    const dataInicial = this.f.dataInicial.value;
    const dataFinal = this.f.dataFinal.value;

    console.log(dataInicial);
    this.resultadoPesquisaFiltrado = this.resultadoPesquisa.filter((v) => {
      let compInicial = true;
      let compFinal = true;
      let dataComparacao = (v.dataAnalise as string).split('T')[0];
      if(dataInicial != '') {
        compInicial = dataComparacao >= dataInicial;
      }
      if(dataFinal != '') {
        compFinal = dataComparacao <= dataFinal;
      }
      return compInicial && compFinal;
    })
  }

  preencherFormulario() {
    this.formVisualizar.controls.nome.setValue(this.dadosBasicos.solicitacaoDiariaCompleto.nomeSolicitante);
    this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla("Federacao").subscribe((res) => {
      const federacao = res.find(f => f.idIndicador == this.dadosBasicos.solicitacaoDiariaCompleto.idFederacaoSolicitante)

      this.cabecalhoPDF = 
      [
          `Federação: ${federacao.nome}      ` +
          `Data Início: ${new Date(this.origem.dataInicio).toLocaleDateString('pt-BR')}     ` +
          `Data Final: ${new Date(this.origem.dataFim).toLocaleDateString('pt-BR')}     ` +
          `Id da Solicitação: ${this.dadosBasicos.solicitacaoDiariaCompleto.idNumericoSolicitacao}`,
          `Origem: ${this.origem.origemCidade + '/' + this.origem.origemUf}     ` +
          `Destino: ${this.destino.destinoCidade + '/' + this.destino.destinoUf}`,
          `Nome do Solicitante: ${this.dadosBasicos.solicitacaoDiariaCompleto.nomeSolicitante}   Nome do Técnico: ${this.dadosBasicos.solicitacaoDiariaCompleto.nomeViajante}` 
      ];   
    });
  }

  voltar(){
    this.location.back();
  }

  baixarPdf(): void {
    if (this.resultadoPesquisa && this.dadosBasicos) {
    this.criarPdfHistorico();
    } else {
      alert("Ocorreu um erro")
    }
  }
  criarPdfHistorico(): void {
    const relatorios = [];
    try {          
      this.resultadoPesquisaFiltrado.forEach((row) => {
        if(row){
          relatorios.push([
            DateUtils.format(row.dataAnalise, 'dd/MM/yyyy HH:mm'),
            row.nomeUsuarioAnalise,
            row.status,
            row.justificativa,
          ]);
        }
      });

      const titulos = [
          "Data",
          "Autor",
          "Análise",
          "Observações",
      ];
      this.criarPdf(titulos, relatorios);
    } catch (error) {
      console.log(error);
    }
  }

  criarPdf(arrayTitulos: any[], rowsTabela: any[]): void {
    let yAtual = 10;
    const doc: any = new jsPDF("l", "px", "a4");

    doc.setFontSize(12);
    
    // Adiciona cada linha do título
    doc.text("RELATÓRIO DE HISTÓRICO DE SOLICITAÇÕES", 10, 15);
    yAtual += 20;
    this.cabecalhoPDF.forEach((linha) => {
        doc.text(linha, 10, yAtual);
        yAtual += 15; // espaço entre linhas
    });

    doc.setFontSize(10);

    autoTable(doc, {
        margin: 10,
        head: [arrayTitulos],
        body: rowsTabela,
        startY: yAtual + 5, // um pequeno espaço 25,
        theme: "grid",
    });

    doc.save(`RelatórioDeHistóricoSolicitações.pdf`);
  }

  get f() {
    return this.formVisualizar.controls;
  }
}