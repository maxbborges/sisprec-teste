import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import jspdf from "jspdf";
import 'jspdf-autotable';
import { DateUtils } from '../../helpers/Data';
import { ApiDocumentoService } from '../../services/api-documento.service';
import { ApiLancamentoService } from "../../services/api-lancamento.service";

@Component({
    templateUrl: './modal-ficha-auxiliar-historico.component.html',
    styleUrls: ['./modal-ficha-auxiliar-historico.component.scss'],
  standalone: false
})
  export class ModalFichaAuxiliarHistoricoComponent implements OnInit {
    @Input() public tipoLancamento: string;
    @Input() public idLancamento: string;
    @Input() public idPrestacaoContaItemSaida: string;

    public lstFichaAuxiliarLog: any;
  datePipe: any;

    constructor(
        private ngbActiveModal: NgbActiveModal,
        private _apiLancamentoService: ApiLancamentoService,
        private _apiDocumentoService: ApiDocumentoService
      ) { }

    ngOnInit(): void {
        this.onGetHistoricoFichaAuxiliar();
    }

    close(){
        this.ngbActiveModal.dismiss();
    }

    onGetHistoricoFichaAuxiliar(){
      if(this.tipoLancamento == 'documento') {
         this._apiDocumentoService.obterHistoricoFichaAuxiliarByIdLancamento(this.idLancamento).subscribe(
          response => {
            this.lstFichaAuxiliarLog = response;
            this.lstFichaAuxiliarLog.map( log => {
              log.objeto = JSON.parse(log.objeto);
            })
            console.log(this.lstFichaAuxiliarLog);
          }
        )
      }else{
        this._apiLancamentoService.obterHistoricoFichaAuxiliarByIdLancamento(this.idLancamento).subscribe(
          response => {
            this.lstFichaAuxiliarLog = response;
            this.lstFichaAuxiliarLog.map( log => {
              log.objeto = JSON.parse(log.objeto);
            })
            console.log(this.lstFichaAuxiliarLog);
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
                if(this.tipoLancamento == 'documento') motivo = row.objeto.NomeMotivo;
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
    const doc: any = new jspdf("l", "px", "a4");

    doc.setFontSize(12);

    doc.text("RELATÓRIO DE HISTÓRICO DE FICHA AUXILIAR", 10, 15);

    doc.setFontSize(10);

    doc.autoTable({
        margin: 10,
        head: [arrayTitulos],
        body: rowsTabela,
        startY: 25,
        theme: "grid",
    });

    doc.save(`RelatórioDeHistóricoDeFichaAuxiliar.pdf`);
    }

    getStatus(status){
      if(this.tipoLancamento == 'documento'){
        return status;
      }
      switch(status){
        case 'RetornadoAjustes':
          return "Retornado para ajustes"
        case 'NaoAnalisado':
          return "Não Analisado"
        default:
          return status;
        }
    }
    getMotivo(objeto){
      if(this.tipoLancamento == 'documento'){
        return objeto.NomeMotivo;
      }else{
          return objeto.Motivo == null ? objeto.Motivos : objeto.Motivo;
      }
    }
  }