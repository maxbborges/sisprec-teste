import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    templateUrl: './modal-ficha-auxiliar.component.html',
    styleUrls: ['./modal-ficha-auxiliar.component.scss'],
  standalone: false
})
  export class ModalFichaAuxiliarComponent implements OnInit {
    @Input() public titulo: string = 'Ficha auxiliar';
    @Input() public motivo: string;
    @Input() public observacao: string;

    constructor(
        private ngbActiveModal: NgbActiveModal
      ) { }

    ngOnInit(): void {
        
    }

    close(){
        this.ngbActiveModal.dismiss();
    }
    getIsMotivo(){
      try{
        if(this.motivo){
          return !this.motivo.includes('Presidente');
        }
      }catch{ return true;}
    }
  }
  