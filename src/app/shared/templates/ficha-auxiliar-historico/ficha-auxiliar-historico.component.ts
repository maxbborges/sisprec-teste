import { Component, Input, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalFichaAuxiliarHistoricoComponent } from "../../components/modal-ficha-auxiliar-historico/modal-ficha-auxiliar-historico.component";

@Component({
    selector: 'app-ficha-auxiliar-historico',
    templateUrl: './ficha-auxiliar-historico.component.html',
    styleUrls: ['./ficha-auxiliar-historico.component.scss'],
  standalone: false
})
export class FichaAuxiliarHistoricoComponent implements OnInit {
    @Input() tipoLancamento: string;
    @Input() idLancamento: string;
    @Input() idPrestacaoContaItemSaida: string;
    

    constructor(private ngbModal: NgbModal){

    }

    ngOnInit(): void {

    }

    abrirModal() {
        const modalRef = this.ngbModal.open(ModalFichaAuxiliarHistoricoComponent,{
            size: 'xl'
        });
        modalRef.componentInstance.tipoLancamento = this.tipoLancamento;
        modalRef.componentInstance.idLancamento = this.idLancamento;
        modalRef.componentInstance.idPrestacaoContaItemSaida = this.idPrestacaoContaItemSaida;
    }
}
