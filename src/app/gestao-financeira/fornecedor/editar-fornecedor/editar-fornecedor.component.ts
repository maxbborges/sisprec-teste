import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { AlterarFornecedor } from 'src/app/shared/models/commands/cmdFornecedor';
import { Fornecedor, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiFornecedorService } from 'src/app/shared/services/api-fornecedor.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-editar-fornecedor',
  templateUrl: './editar-fornecedor.component.html',
  styleUrls: ['./editar-fornecedor.component.scss'],
  standalone: false
})
export class EditarFornecedorComponent implements OnInit {
  private usuarioLogado: Usuario;

  public fornecedor: Fornecedor;
  public formCadastro: FormGroup;
  public desativarSalvar = true;
  public ehPessoaJuridica = true;
  acaoBloqueada: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiFornecedor: ApiFornecedorService,
    private storage: StorageService,
    private _segurancaService: SegurancaCheckService,
    private _modal: ModalService,
  ) {
    this.inicializarFormulario()
  }

  ngOnInit() {
    this.usuarioLogado = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.inicializarFormulario();
    this.carregarDadosFornecedor(this.route.snapshot.params.idFornecedor);
  }

  carregarDadosFornecedor(idFornecedor: number) {
    this.apiFornecedor.visualizarFornecedor(idFornecedor).subscribe((fornecedor) => {
      this.fornecedor = fornecedor;
      if (this.fornecedor.idTipoFornecedor === 1013) {
        this.ehPessoaJuridica = true;
      } else {
        this.ehPessoaJuridica = false;
      }
    }, (error) => {
      this._modal.alert('Erro ao retornar dados do Fornecedor:', 'Erro', 'e')
    }, () => {
      this.preencheDadosFormulario();
    });
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      idFornecedor: ['', [Validators.required]],
      idTipoFornecedor: [{ value: '', disabled: true }, [Validators.required]],
      numeroDocumento: [{ value: '', disabled: true }, [Validators.required]],
      nome: ['', [Validators.required]]
    });
    this.checaEspacos()
  }

  preencheDadosFormulario() {
    this.formCadastro.patchValue({
      idFornecedor: this.fornecedor.idFornecedor,
      idTipoFornecedor: this.fornecedor.idTipoFornecedor.toString(),
      numeroDocumento: this.fornecedor.numeroDocumento,
      nome: this.fornecedor.nome
    });
  }

  salvar() {
    if (this.formCadastro.valid) {
      const fornecedor: AlterarFornecedor = {
        idUsuarioAlteracao: this.usuarioLogado.idUsuario,
        numeroDocumento: this.formCadastro.controls.numeroDocumento.value,
        idFornecedor: this.formCadastro.controls.idFornecedor.value,
        idTipoFornecedor: this.formCadastro.controls.idTipoFornecedor.value,
        nome: this.formCadastro.controls.nome.value.trim()
      };

      const validador = this.validaDados(fornecedor);

      if (!validador) {
        this._modal.alert('Por favor, informe um CPF / CNPJ válido', 'Aviso', 'a');
        return;
      }

      this.apiFornecedor.alterarFornecedor(fornecedor).subscribe((data) => {
        if (data.success) {
          this._modal.alert("Fornecedor alterado com sucesso", "Sucesso", "s");
          this.router.navigate(['/gestaoFinanceira/fornecedor']);
        } else {
          this._modal.alert(data.message, "Atenção", "a");
        }
      }, (error) => {
        this._modal.alert('Ocorreu um erro ao alterar o fornecedor', "Erro", "e");
      });

    } else {
      this._modal.alert('Por favor, preencha todos os campos obrigatórios', "Atenção", "a");
    }
  }


  mudaTipoFornecedor(event: any) {
    if (event.target.value === '0') {
      this.ehPessoaJuridica = true;
    } else {
      this.ehPessoaJuridica = false;
    }
    // Limpa os campos do formulário
    this.formCadastro.patchValue({
      numeroDocumento: '',
      nomeFornecedor: ''
    });
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

  cancelar() {
    this._modal.confirm('Deseja cancelar?').subscribe(resultado => {

      if (resultado) {
        this.router.navigate(['gestaoFinanceira/fornecedor']);
        return;
      }

      this._modal.close();
    });
  }


  validaDados(fornecedor: AlterarFornecedor) {
    if (fornecedor.idTipoFornecedor.toString() === ("1013")) {
      return this.checaCNPJ(fornecedor.numeroDocumento);
    }
    return this.checaCPF(fornecedor.numeroDocumento)
  }


}
