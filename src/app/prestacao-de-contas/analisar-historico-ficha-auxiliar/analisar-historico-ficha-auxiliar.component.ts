import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { jsPDF } from "jspdf";
import { autoTable } from 'jspdf-autotable';
import { DateUtils } from 'src/app/shared/helpers/Data';
import { ApiDocumentoService } from 'src/app/shared/services/api-documento.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-analisar-historico-ficha-auxiliar',
  templateUrl: './analisar-historico-ficha-auxiliar.component.html',
  standalone: false
})
export class AnalisarHistoricoFichaAuxiliarComponent implements OnInit {

  public tipoDocumento: string;
  public tipoLancamento: string;
  public idFederacao: number;
  public mesExerciocio: number;
  public anoExercicio: number;
  public tipoConta: string;
  public status: string;
  public idLancamento: string;
  public idDocumento: string;

  public usuario: any;
  public lstFichaAuxiliarLog;
  public lstFichaAuxiliarLogFiltrada;
  public objeto: any;
  public cabecalhoPDF: string[];

  public subitens: string[] = [];
  public subitensSelecionados: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private _apiLancamentoService: ApiLancamentoService,
    private prestacaoService: ApiPrestacaoContasService,
    private _apiDocumentoService: ApiDocumentoService,
    private indicadorService: ApiIndicadorService,
    private storageService: StorageService,
    private location: Location

  ) { }

  ngOnInit() {
    this.usuario = this.storageService.getUsuarioLogado();
    this.idFederacao = this.route.snapshot.params.idFederacao;
    this.mesExerciocio = this.route.snapshot.params.mes;
    this.anoExercicio = this.route.snapshot.params.ano;
    this.tipoLancamento = this.route.snapshot.params.tipoLancamento;
    this.tipoDocumento = this.route.snapshot.params.tipoLancamento;

    switch(this.tipoLancamento){
        case 'contaCorrente':
            this.tipoConta = this.route.snapshot.params.tipoConta;
            this.status = this.route.snapshot.params.status;
            this.tipoLancamento = "Conta Corrente";
            break;
        default:
            this.tipoLancamento = "Documentação";
            this.idDocumento = this.route.snapshot.params.idDocumento;
            break;
    }
    this.idLancamento = this.route.snapshot.params.idLancamento;
    this.onGetHistoricoFichaAuxiliar();
  }

  voltar() {
    this.location.back();
  }

  onGetHistoricoFichaAuxiliar(){
    this.cabecalhoPDF = [];
    if(this.tipoDocumento == 'documentacao') {
        this._apiDocumentoService.obterDocumentoByIdDocumento(this.idDocumento).subscribe(
            response => {
                this.objeto = response;
                console.log(this.objeto);
                this.cabecalhoPDF = 
                [
                    `Data : ${new Date(this.objeto.dataCadastro).toLocaleDateString('pt-BR')}     ` +
                    `Nome Documento: ${this.objeto.nomeDocumento}   Execício: ${this.mesExerciocio}/${this.anoExercicio}` + 
                    `   Análise: ${this.objeto.analise == null ? 'Não Analisado' : this.getStatus(this.objeto.analise)}`,
                    `Federação: ${this.objeto.siglaFederacao}`
                ];                 
                
                this._apiDocumentoService.obterHistoricoFichaAuxiliarByIdLancamento(this.idDocumento).subscribe(
                response => {
                    this.lstFichaAuxiliarLog = response;
                    // this.lstFichaAuxiliarLog.unshift({
                    //     idLogProtocolo: null,
                    //     data: new Date(),
                    //     idUsuario: null,
                    //     acaoRealizada: 'Consulta Documento Análise Motivo',
                    //     sqlExecutado: null,
                    //     objeto: JSON.stringify({ Analise: this.objeto.analise, NomeMotivo: this.objeto.nomeMotivo, Observacao: this.objeto.observacao, Federacao: this.objeto.federacao, NomeDocumento: this.objeto.nomeDocumento }),
                    //     idLancamento: this.objeto.idDocumento,
                    //     idPrestacaoContaItemSaida: null});
                    this.lstFichaAuxiliarLog.map( log => {
                    log.objeto = JSON.parse(log.objeto);
                    })
                    console.log(this.lstFichaAuxiliarLog);
                }
                )
            }
        )
    }else{
        this._apiLancamentoService.visualizarLancamento(this.idLancamento).subscribe(
            response => {
                this.objeto = response;
                console.log(this.objeto);
                const formatter = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });
                const formattedValue = formatter.format(this.objeto.valor.toFixed(2));
                this.cabecalhoPDF = 
                [
                    `Data : ${new Date(this.objeto.dataEvento).toLocaleDateString('pt-BR')}     ` +
                    `Tipo Lançamento: ${this.objeto.tipoLancamento}   Item: ${this.objeto.itemLancamento}   Execício: ${this.mesExerciocio}/${this.anoExercicio}` + 
                    `   Análise: ${this.objeto.analise == null ? 'Não Analisado' : this.getStatus(this.objeto.analise)}`,
                    `Federação: ${this.objeto.siglaFederacao}`,
                    `Valor: ${formattedValue}`,
                ];                 
                
                this._apiLancamentoService.obterHistoricoFichaAuxiliarByIdLancamento(this.idLancamento).subscribe(
                response => {
                    this.lstFichaAuxiliarLog = response;
                    // let motivo = this.objeto.motivo == null ? this.objeto.motivos : this.objeto.motivo;
                    // this.lstFichaAuxiliarLog.unshift({
                    //     idLogProtocolo: null,
                    //     data: new Date(),
                    //     idUsuario: null,
                    //     acaoRealizada: 'Consulta Conta Corrente Análise Motivo',
                    //     sqlExecutado: null,
                    //     objeto: JSON.stringify({ Analise: this.objeto.analise, Motivo: motivo, Observacao: this.objeto.observacao }),
                    //     idLancamento: this.objeto.idDocumento,
                    //     idPrestacaoContaItemSaida: null});
                    this.lstFichaAuxiliarLog.map(log => {
                        log.objeto = JSON.parse(log.objeto);
                    });
                    console.log(this.lstFichaAuxiliarLog);

                    this._apiLancamentoService.obterLancamentoDespesasPorId(this.idLancamento, true).subscribe(res => {
                        const itensLancamentoAtuais = res;
                        this.lstFichaAuxiliarLog = this.lstFichaAuxiliarLog.filter(log => log.acaoRealizada.toLowerCase().match(/(item|despesa) lançamento/gm) /*|| log.acaoRealizada.toLowerCase().includes('despesa lançamento')*/);
                        this.lstFichaAuxiliarLog = [
                            // ...itensLancamentoAtuais.map(i => ({
                            //     data: new Date(),
                            //     acaoRealizada: 'Consulta Conta Corrente Item Lançamento',
                            //     objeto: { Tipo: i.tipo, Item: i.item, Valor: i.valor, Analise: i.analise, Motivo: i.motivos, Observacao: i.observacao }
                            // })),
                            ...this.lstFichaAuxiliarLog
                        ];
                        this.lstFichaAuxiliarLogFiltrada = this.lstFichaAuxiliarLog;

                        const subitens = new Set(this.lstFichaAuxiliarLog.map(log => log.objeto.Item));
                        this.subitens = [...subitens] as string[];
                    });
                }
                )
            }
        )
    }
    }


    baixarPdf(): void {
        if (this.idLancamento) {
        this.criarPdfLancamentos();
        } else {
        //this.criarPdfPrestacaoContasDespesas();
        }
    }
    criarPdfLancamentos(): void {
        const relatorios = [];
        try {          
        this.lstFichaAuxiliarLog.forEach((row) => {
            if(row.objeto == null){
                relatorios.push([
                DateUtils.format(row.data, 'dd/MM/yyyy HH:mm'),
                row.acaoRealizada,
                "",
                "",
                "",
                ]);
            }else{
                const analise = row.objeto.Analise !== null ? " - " + row.objeto.Analise : "";
                let motivo = row.objeto.Motivo !== null ? " - " + row.objeto.Motivo : "";
                if(motivo == "" || analise == null){
                try{
                    motivo = row.objeto.Motivos.toString();
                }catch{

                }
                }
                if(this.tipoDocumento == 'documentacao') motivo = row.objeto.NomeMotivo;
                const observacao = row.objeto.Observacao !== null ? " - " + row.objeto.Observacao : "";
                relatorios.push([
                DateUtils.format(row.data, 'dd/MM/yyyy HH:mm'),
                row.acaoRealizada,
                analise,
                motivo,
                observacao,
                ]);
            }
        });

        const titulos = [
            "Data",
            "Log por",
            "Análise",
            "Motivo",
            "Observação",
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
    doc.text("RELATÓRIO DE HISTÓRICO DE FICHA AUXILIAR", 10, 15);
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

    doc.save(`RelatórioDeHistóricoDeFichaAuxiliar.pdf`);
    }

    getStatus(status){
        try{
            if(this.tipoDocumento == 'documentacao'){
                return status === null ? 'Não Analisado' : status;
            }

            if (!status) return 'Não Analisado';
            switch(status){
                case 'RetornadoAjustes':
                return "Retornado para ajustes"
                case 'NaoAnalisado':
                return "Não Analisado"
                default:
                return status;
                }
        }catch{ return ""}
    }
    getMotivo(objeto){
        if(objeto == null || objeto == undefined) return "";
        if(this.tipoDocumento == 'documentacao'){
            return objeto.NomeMotivo;
        }else{
            return objeto.Motivo == null ? objeto.Motivos : objeto.Motivo;
        }
    }

    filtrarHistorico(): void {
        console.log(this.subitensSelecionados);
        if (!this.subitensSelecionados || this.subitensSelecionados.length === 0) {
            this.lstFichaAuxiliarLogFiltrada = this.lstFichaAuxiliarLog;
            return;
        }
        this.lstFichaAuxiliarLogFiltrada = this.lstFichaAuxiliarLog.filter(log => this.subitensSelecionados.some(i => i === log.objeto.Item));
    }
}
