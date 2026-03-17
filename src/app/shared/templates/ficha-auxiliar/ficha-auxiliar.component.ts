import { Component, Input, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalFichaAuxiliarComponent } from "../../components/modal-ficha-auxiliar/modal-ficha-auxiliar.component";

@Component({
    selector: 'app-ficha-auxiliar',
    templateUrl: './ficha-auxiliar.component.html',
    styleUrls: ['./ficha-auxiliar.component.scss'],
  standalone: false
})
export class FichaAuxiliarComponent implements OnInit {
    @Input() motivo: string;
    @Input() observacao: string;
    @Input() mostrarTooltipCompleta: boolean = false; 

    constructor(private ngbModal: NgbModal){

    }

    ngOnInit(): void {

    }

    abrirModal() {
        const modalRef = this.ngbModal.open(ModalFichaAuxiliarComponent);
        modalRef.componentInstance.motivo = this.motivo;
        modalRef.componentInstance.observacao = this.observacao;
    }

    textoTooltip(){
        return (this.mostrarTooltipCompleta ? (this.observacaoPequena()) : 'Visualizar ficha auxiliar');
    }

    observacaoPequena() : string {
        return this.observacao.length > 30 ? this.observacao.slice(0,31) + '...' : this.observacao;
    }
}