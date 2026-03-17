import { jsPDF } from "jspdf";
import { autoTable } from 'jspdf-autotable';

import { Location } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ValidationErrors } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DateUtils } from 'src/app/shared/helpers/Data';
import { HistoricoRelatorioViagens, ListagemRelatorioViagens } from "src/app/shared/models/commands/cmdRelatorioViagens";
import { Indicador, Usuario } from "src/app/shared/models/responses/sisprec-response";
import { ApiIndicadorService } from "src/app/shared/services/api-indicador.service";
import { ApiRelatorioViagensService } from "src/app/shared/services/api-relatorio-viagens.service";
import { ModalService } from "src/app/shared/services/modal.service";
import { StorageService } from "src/app/shared/services/storage.service";

@Component({
  selector: "app-viagens-visualizar-historico",
  templateUrl: "./visualizar-historico.component.html",
  standalone: false
})
export class ViagensVisualizarHistoricoComponent implements OnInit {
  public formVisualizar: FormGroup;
  public usuario: Usuario;
  public status: Array<Indicador> = [];
  public statusSelecao: Array<any> = [];
  public idRelatorioViagens: string = "";
  public resultadoPesquisa: Array<HistoricoRelatorioViagens> = [];
  public dadosBasicos: ListagemRelatorioViagens;
  public cabecalhoPDF: Array<any> = [];
  public carregando: boolean = true;
  public msg: string;

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
    private storageService: StorageService,
    private relatorioViagensService : ApiRelatorioViagensService,
    private router: Router,
    private route: ActivatedRoute,
    private apiIndicadorService: ApiIndicadorService,
    private m: ModalService,
    private location: Location
  ){}

  ngOnInit(): void {
    //recuperar id
    this.route.params.subscribe(param => {
      this.idRelatorioViagens = param.id;
    });

    //inicializar formulario
    this.inicializarFormulario();

    //buscar dados do relatório
    this.relatorioViagensService.recuperarRelatorioPorId(this.idRelatorioViagens).subscribe((v) => {
      this.dadosBasicos = v;
      this.preencherFormulario();
    }, (e) => {
      alert("Ocorreu um erro inesperado");
    })

    //buscar histórico do relatório
    this.relatorioViagensService.recuperarHistoricoPorId(this.idRelatorioViagens).subscribe((v) => {
      this.resultadoPesquisa = v;
      this.carregando = false;
    }, (e) => {
      alert("Ocorreu um erro inesperado");
      this.carregando = false;
    })
  }


  inicializarFormulario() {
    this.formVisualizar = this.formBuilder.group({
      nome: [''],
      email: [''],
      federacao: [''],
      dataInicial: [''],
      dataFinal: [''],
    },{
      validators: [this.validarData]
    });
  }

  preencherFormulario() {
    this.formVisualizar.controls.nome.setValue(this.dadosBasicos.nome);
    this.formVisualizar.controls.email.setValue(this.dadosBasicos.email);
    this.formVisualizar.controls.federacao.setValue(this.dadosBasicos.federacao);
    this.formVisualizar.controls.dataInicial.setValue(this.dadosBasicos.dataInicio.toString().split("T")[0]);
    this.formVisualizar.controls.dataFinal.setValue(this.dadosBasicos.dataFim.toString().split("T")[0]);

    this.cabecalhoPDF = 
      [
          `Federação: ${this.dadosBasicos.federacao}      ` +
          `Data Inicial : ${new Date(this.dadosBasicos.dataInicio).toLocaleDateString('pt-BR')}     ` +
          `Data Final : ${new Date(this.dadosBasicos.dataFim).toLocaleDateString('pt-BR')}     ` +
          `Id do Relatório : ${this.dadosBasicos.idNumerico}`,
          `Nome: ${this.dadosBasicos.nome}   E-mail: ${this.dadosBasicos.email}` 
      ];    
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
      this.resultadoPesquisa.forEach((row) => {
        if(row){
          relatorios.push([
            DateUtils.format(row.dataAvaliacao, 'dd/MM/yyyy HH:mm'),
            row.nome,
            row.avaliacao,
            row.observacoes,
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
    doc.text("RELATÓRIO DE HISTÓRICO DE VIAGENS", 10, 15);
    yAtual += 15;
    this.cabecalhoPDF.forEach((linha) => {
        doc.text(linha, 10, yAtual);
        yAtual += 10; // espaço entre linhas
    });

    doc.setFontSize(10);

    autoTable(doc, {
        margin: 10,
        head: [arrayTitulos],
        body: rowsTabela,
        startY: yAtual + 5, // um pequeno espaço 25,
        theme: "grid",
    });

    doc.save(`RelatórioDeHistóricoDeViagens.pdf`);
  }

  get f() {
    return this.formVisualizar.controls;
  }
}