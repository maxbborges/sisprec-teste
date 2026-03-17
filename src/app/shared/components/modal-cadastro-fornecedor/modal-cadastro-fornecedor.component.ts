import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Fornecedor, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { Util } from '../../helpers/util';
import { SegurancaCheckService } from '../../seguranca/seguranca-check-service';
import { ApiFornecedorService } from '../../services/api-fornecedor.service';
import { StorageService } from '../../services/storage.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-modal-cadastro-fornecedor',
  templateUrl: './modal-cadastro-fornecedor.component.html',
  styleUrls: ['./modal-cadastro-fornecedor.component.scss'],
  standalone: false
})
export class ModalCadastroFornecedorComponent implements OnInit {

  @Output() retorno: EventEmitter<Fornecedor> = new EventEmitter<Fornecedor>();
  private usuarioLogado: Usuario;

  public lstFornecedores: Fornecedor[];
  public ehPessoaJuridica: boolean = true;
  public formFornecedor: FormGroup;
  public enviado: boolean = false;
  acaoBloqueada: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private ngbActiveModal: NgbActiveModal,
    private toastService: ToastService,
    private apiFornecedor: ApiFornecedorService,
    private storage: StorageService,
    private _segurancaService: SegurancaCheckService,
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.usuarioLogado = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
  }

  inicializarFormulario() {
    this.formFornecedor = this.formBuilder.group({
      numeroDocumento: ['', [this.validarDocumento(), Validators.required]],
      nome: ['', [Validators.required]],
      idTipoFornecedor: ['1013', [Validators.required]]
    });
  }

  validarDocumento(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valido = this.ehPessoaJuridica == true ? Util.isCnpj(control.value) : Util.isCpf(control.value);
      return valido ? null : {valorInvalido: {value: control.value}};
    }
  }

  mudaTipoFornecedor(event: any) {
    if (event.target.value === '1013') {
      this.ehPessoaJuridica = true;
    } else {
      this.ehPessoaJuridica = false;
    }
    this.enviado = false;
    this.formFornecedor.patchValue({
      numeroDocumento: '',
      nomeFornecedor: ''
    });
  }

  cancelar() {
    this.ngbActiveModal.dismiss();
  }

  voltar() {
    this.ngbActiveModal.dismiss("voltar");
  }

  salvarFornecedor() {
    this.enviado = true;
    if(this.formFornecedor.invalid) {
      return;
    }

    const fornecedor = this.formFornecedor.value;
    fornecedor.idUsuarioCadastro = this.usuarioLogado.idUsuario;
    fornecedor.idFederacao = this.usuarioLogado.idFiliacao;
    const nome =  this.formFornecedor.get("nome").value;
    fornecedor.nome = nome.trim();
    //limpar pontuacoes
    fornecedor.numeroDocumento = this.limparValorNumero();
    if (this.formFornecedor.valid) {
      this.apiFornecedor.inserirFornecedor(fornecedor).subscribe((data) => {
        if (data.success) {
          this.apiFornecedor.pesquisarFornecedorPorNumeroDocumento(fornecedor.numeroDocumento).subscribe((v) => {
            if(v) {
              this.toastService.add({message: "Fornecedor incluído com sucesso!",severity: "success"});
              //depois de salvar, deixar selecionado em outra página
              this.retorno.emit(v);
              this.ngbActiveModal.dismiss();
            }
          })
        } else {
          alert(data.message);
        }
      }, (error) => {
        console.log(error)
        this.toastService.add({message: "Ocorreu um erro ao cadastrar o fornecedor.",severity: "danger"});
      });
    } 
  }

  limparValorNumero() {
    const numeroDocumento = this.formFornecedor.controls.numeroDocumento.value;
    if(this.ehPessoaJuridica)
      return Util.limpaCnpj(numeroDocumento);
    else
      return Util.limpaCpf(numeroDocumento);
  }
}
