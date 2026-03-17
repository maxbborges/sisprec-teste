import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FiltroFornecedores, Fornecedor } from 'src/app/shared/models/responses/sisprec-response';
import { ApiFornecedorService } from '../services/api-fornecedor.service';

@Component({
  selector: 'app-modal-pesquisa-fornecedor',
  templateUrl: './modal-pesquisa-fornecedor.component.html',
  styleUrls: ['./modal-pesquisa-fornecedor.component.scss'],
  standalone: false
})
export class ModalPesquisaFornecedorComponent implements OnInit {

  @Output() retorno: EventEmitter<Fornecedor> = new EventEmitter<Fornecedor>();

  public lstFornecedores: Fornecedor[];
  public ehPessoaJuridica: boolean = true;
  public formPesquisa: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private ngbActiveModal: NgbActiveModal,
    private ngbModal: NgbModal,
    private fornecedorService: ApiFornecedorService,
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.formPesquisa = this.formBuilder.group({
      idTipoFornecedor: ['1013', [Validators.required]],
      numeroDocumento: [''],
      nome: ['']
    });
  }

  pesquisaFornecedor() {

    const filtros: FiltroFornecedores = this.formPesquisa.value;

    this.fornecedorService.pesquisarFornecedorPorFiltros(filtros).subscribe(
      result => {
        if (result == null) {
          alert('Nenhum Fornecedor encontrado com o(s) filtro(s) utilizado(s).');
          return;
        }
        console.log(result);
        this.lstFornecedores = result;
      }
    );

  }

  mudaTipoFornecedor(event: any) {

    if (event.target.value === '1013') {
      this.ehPessoaJuridica = true;
    } else {
      this.ehPessoaJuridica = false;
    }
    // Limpa os campos do formulário
    this.formPesquisa.patchValue({
      numeroDocumento: '',
      nomeFornecedor: ''
    });
  }

  cancelar() {
    this.ngbActiveModal.dismiss();
  }

  selecionarFornecedor(fornecedor: Fornecedor) {
    this.retorno.emit(fornecedor);
    this.ngbActiveModal.dismiss();
  }

  CadastrarFornecedor(){
    this.ngbActiveModal.dismiss('cadastrar-fornecedor');
  }
}
