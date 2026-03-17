import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { InserirFornecedor } from 'src/app/shared/models/commands/cmdFornecedor';
import { Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiFornecedorService } from 'src/app/shared/services/api-fornecedor.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-cadastrar-fornecedor',
  templateUrl: './cadastrar-fornecedor.component.html',
  styleUrls: ['./cadastrar-fornecedor.component.scss'],
  standalone: false
})
export class CadastrarFornecedorComponent implements OnInit {
  private usuarioLogado: Usuario;

  public formCadastro: FormGroup;
  public desativarSalvar = true;
  public ehPessoaJuridica = true;
  acaoBloqueada: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private apiFornecedor: ApiFornecedorService,
    private storage: StorageService,
    private _segurancaService: SegurancaCheckService,
    private m: ModalService,
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      idTipoFornecedor: ['1013', [Validators.required]],
      numeroDocumento: ['', [Validators.required]],
      nome: ['', [Validators.required]],
      idFederacao: [this.usuarioLogado.idFiliacao]
    });
    this.checaEspacos()
  }

  salvar() {
    const fornecedor: InserirFornecedor = this.formCadastro.value;
    fornecedor.idUsuarioCadastro = this.usuarioLogado.idUsuario;
    const validador = this.validaDados(fornecedor)
    const nome =  this.formCadastro.get("nome").value;
    fornecedor.nome = nome.trim();
    if(!validador){
      this.m.alert('Por favor, informe um CPF / CNPJ válido', 'Aviso', 'a')
      return;
    }
    if (this.formCadastro.valid) {
      this.apiFornecedor.inserirFornecedor(fornecedor).subscribe((data) => {
        if (data.success) {
          this.m.alert('Fornecedor cadastrado com sucesso.', 'Sucesso', 's')
          this.router.navigate(['/gestaoFinanceira/fornecedor']);
        } else {
          this.warn(data.message);
        }
      }, (error) => {
        console.log(error)
        this.m.alert('Ocorreu um erro ao cadastrar o fornecedor', 'Erro', 'e')
      });
      console.log('Salvando fornecedor:');
      console.log(this.formCadastro.value);
    } else {
      this.m.alert('Por favor, preencha todos os campos obrigatórios', 'Aviso', 'a')
    }
  }
  validaDados(fornecedor: InserirFornecedor) {
   if(fornecedor.idTipoFornecedor===("1013")){
    return this.checaCNPJ(fornecedor.numeroDocumento);
   }
   return this.checaCPF(fornecedor.numeroDocumento)
  }

  mudaTipoFornecedor(event: any) {

    if (event.target.value === '1013') {
      this.ehPessoaJuridica = true;
    } else {
      this.ehPessoaJuridica = false;
    }

    this.formCadastro.patchValue({
      numeroDocumento: '',
      nomeFornecedor: ''
    });
  }
  checaCNPJ(cnpj: string) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14) return false;

    if (/^(.)\1+$/.test(cnpj)) return false;

    var tamanho = cnpj.length - 2;
    var numeros = cnpj.substring(0, tamanho);
    var digitos = cnpj.substring(tamanho);
    var soma = 0;
    var pos = tamanho - 7;
    for (var i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (var j = tamanho; j >= 1; j--) {
      soma += parseInt(numeros.charAt(tamanho - j)) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    const teste = resultado === parseInt(digitos.charAt(1));
    return teste;
  }
  checaCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11) return false;
    if (/^(.)\1+$/.test(cpf)) return false;
    let v1 = 0;
    let v2 = 0;
    for (let i = 0; i < 9; i++) {
      v1 += parseInt(cpf.charAt(i)) * (10 - i);
      v2 += parseInt(cpf.charAt(i)) * (11 - i);
    }
    v1 = v1 % 11;
    v1 = v1 < 2 ? 0 : 11 - v1;
    v2 += v1 * 2;
    v2 = v2 % 11;
    v2 = v2 < 2 ? 0 : 11 - v2;
    return parseInt(cpf.charAt(9)) === v1 && parseInt(cpf.charAt(10)) === v2;
  }


  private warn(erros: string) {
    this.m.alert(erros, 'Atenção', 'a')
  }
  checaEspacos() {
    const nomeControl = this.formCadastro.get("nome");
    nomeControl.valueChanges
      .pipe(debounceTime(150))
      .subscribe((value) => {
        if (value.trim() === "") {
          nomeControl.setErrors({ emptyField: true });
          nomeControl.markAsTouched();
        }
      });
  }
}
