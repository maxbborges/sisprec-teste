import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { Util } from 'src/app/shared/helpers/util';
import { AlterarColaborador } from 'src/app/shared/models/commands/cmdColaborador';
import { Banco, Colaborador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiColaboradorService } from 'src/app/shared/services/api-colaborador.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-editar-colaborador',
  templateUrl: './editar-colaborador.component.html',
  styleUrls: ['./editar-colaborador.component.scss'],
  standalone: false
})
export class EditarColaboradorComponent implements OnInit {
  private usuarioLogado: Usuario;

  public colaborador: Colaborador;
  public formCadastro: FormGroup;
  public desativarSalvar = true;
  public ehPessoaJuridica = true;
  public isExclusividade = true;
  acaoBloqueada: boolean = false;
  
  public lstBancos: Banco[] = []
  public filtroBanco: string = '';
  public lstDigitos: string[] = [];
  Util: Util;
  public filtroAgenciaDigito: string = '';
  public filtroContaDigito: string = '';
  public lstTipoConta: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiColaborador: ApiColaboradorService,
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
    this.carregarDadosColaborador(this.route.snapshot.params.idColaborador);
    this.carregarListaBancos();
  }

  carregarListaBancos() {
    this.apiColaborador.pesquisarBancos().subscribe( (data) => {
      this.lstBancos = data;
      this.lstDigitos = Util.digitosBancarios();
      this.lstTipoConta = Util.tipoContaBancaria();
    });
    // this.lstBancos = [
    //   {idBanco: '436E0F87-4CE2-3247-02A5-04E623C51197', codigo:	'654', titulo: 'Banco A.J.Renner'},
    //   {idBanco: '2C900085-A1CD-0333-5552-04F30F78547E', codigo:	'246', titulo: 'Banco ABC Brasil'},
    //   {idBanco: '100176A4-A201-241A-16BA-6A295C1506E2', codigo:	'075', titulo: 'Banco ABN AMRO'},
    //   {idBanco: '1E4A86ED-2785-8497-01F3-527E4702893D', codigo:	'025', titulo: 'Banco Alfa'}
    // ]    
  }

  carregarDadosColaborador(idColaborador: number) {
    this.apiColaborador.visualizarColaborador(idColaborador).subscribe((colaborador) => {      
      this.colaborador = colaborador;
      if (this.colaborador.idTipoColaborador === 1013) {
        this.ehPessoaJuridica = true;
      } else {
        this.ehPessoaJuridica = false;
      }
    }, (error) => {
      this._modal.alert('Erro ao retornar dados do Colaborador:', 'Erro', 'e')
    }, () => {
      this.preencheDadosFormulario();
    });
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      idColaborador: ['', [Validators.required]],
      idTipoColaborador: [{ value: '', disabled: true }, [Validators.required]],
      numeroDocumento: [{ value: '', disabled: true }, [Validators.required]],
      nome: ['', [Validators.required]],
      email: ['', [Validators.required]],
      telefone: ['', [Validators.required]],
      dataNascimento: ['',[Validators.required]],
      rg: [''],
      dataAdmissao:['',[Validators.required]],
      dataDesligamento:[''],
      placaVeiculo: ['',[Validators.required]],
      enderecoLocacao: ['',[Validators.required]],
      idBanco: ['',[Validators.required]],
      agencia: ['',[Validators.required]],
      agenciaDigito: ['',[Validators.required]],
      conta: ['',[Validators.required]],
      contaDigito: ['',[Validators.required]],
      tipoConta: ['',[Validators.required]],
      variacaoConta: [''],
      isExclusividade: ['',[Validators.required]]
    });
    this.checaEspacos()
  }

  preencheDadosFormulario() {   
    let idBanco = '';
    try{
      idBanco = this.colaborador.idBanco;
    } catch{}
    this.formCadastro.patchValue({
      idColaborador: this.colaborador.idColaborador,
      idTipoColaborador: this.colaborador.idTipoColaborador.toString(),
      numeroDocumento: this.colaborador.numeroDocumento,
      nome: this.colaborador.nome,
      email: this.colaborador.email,
      telefone: this.colaborador.telefone,
      dataNascimento: Util.formatStringDate10Digitos(`${this.colaborador.dataNascimento}`),
      rg: this.colaborador.rg,
      dataAdmissao: Util.formatStringDate10Digitos(`${this.colaborador.dataAdmissao}`),
      dataDesligamento: Util.formatStringDate10Digitos(`${this.colaborador.dataDesligamento}`),
      placaVeiculo: this.colaborador.placaVeiculo,
      enderecoLocacao: this.colaborador.enderecoLocacao,
      idBanco: idBanco,
      agencia: this.colaborador.agencia,
      agenciaDigito: this.colaborador.agenciaDigito,
      conta: this.colaborador.conta,
      contaDigito: this.colaborador.contaDigito,
      tipoConta: this.colaborador.tipoConta,
      variacaoConta: this.colaborador.variacaoConta,
      isExclusividade: this.colaborador.isExclusividade ? 'true' : 'false',
    });
    this.filtroBanco = idBanco;
  }

  salvar() {
    if (this.formCadastro.valid) {
      const colaborador: AlterarColaborador = {
        idUsuarioAlteracao: this.usuarioLogado.idUsuario,
        numeroDocumento: this.formCadastro.controls.numeroDocumento.value,
        idColaborador: this.formCadastro.controls.idColaborador.value,
        idTipoColaborador: this.formCadastro.controls.idTipoColaborador.value,
        nome: this.formCadastro.controls.nome.value.trim(),
        email: this.formCadastro.controls.email.value.trim(),
        telefone: this.formCadastro.controls.telefone.value.trim(),
        dataNascimento: this.formCadastro.controls.dataNascimento.value,
        rg: this.formCadastro.controls.rg.value,
        dataAdmissao: this.formCadastro.controls.dataAdmissao.value,
        dataDesligamento: this.formCadastro.controls.dataDesligamento.value,
        placaVeiculo: this.formCadastro.controls.placaVeiculo.value,
        enderecoLocacao: this.formCadastro.controls.enderecoLocacao.value,
        idBanco: this.formCadastro.controls.idBanco.value,
        agencia: this.formCadastro.controls.agencia.value,
        agenciaDigito: this.formCadastro.controls.agenciaDigito.value,
        conta: this.formCadastro.controls.conta.value,
        contaDigito: this.formCadastro.controls.contaDigito.value,
        tipoConta: this.formCadastro.controls.tipoConta.value,
        variacaoConta: this.formCadastro.controls.variacaoConta.value,
        isExclusividade: this.formCadastro.controls.isExclusividade.value
      };

      const validador = this.validaDados(colaborador);

      if (!validador) {
        this._modal.alert('Por favor, informe um CPF / CNPJ válido', 'Aviso', 'a');
        return;
      }

      if(this.formCadastro.controls.dataNascimento.value != null) colaborador.dataNascimento = new Date(colaborador.dataNascimento + 'T00:00:00');
      if(this.formCadastro.controls.dataNascimento.value != null) colaborador.dataAdmissao = new Date(colaborador.dataAdmissao + 'T00:00:00');
      if(this.formCadastro.controls.dataNascimento.value != null) colaborador.dataDesligamento = new Date(colaborador.dataDesligamento + 'T00:00:00');

      this.apiColaborador.alterarColaborador(colaborador).subscribe((data) => {
        if (data.success) {
          this._modal.alert("Colaborador alterado com sucesso", "Sucesso", "s");
          this.router.navigate(['/gestaoFinanceira/colaborador']);
        } else {
          this._modal.alert(data.message, "Atenção", "a");
        }
      }, (error) => {
        this._modal.alert('Ocorreu um erro ao alterar o colaborador', "Erro", "e");
      });

    } else {
      this._modal.alert('Por favor, preencha todos os campos obrigatórios', "Atenção", "a");
    }
  }


  mudaTipoColaborador(event: any) {
    if (event.target.value === '0') {
      this.ehPessoaJuridica = true;
    } else {
      this.ehPessoaJuridica = false;
    }
    // Limpa os campos do formulário
    this.formCadastro.patchValue({
      numeroDocumento: '',
      nomeColaborador: ''
    });
  }
  mudaExclusividadeColaborador(event: any) {

    if (event.target.value === '1') {
      this.isExclusividade = true;
    } else {
      this.isExclusividade = false;
    }

    this.formCadastro.patchValue({
      isExclusividade: event.target.value
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
        this.router.navigate(['gestaoFinanceira/colaborador']);
        return;
      }

      this._modal.close();
    });
  }


  validaDados(colaborador: AlterarColaborador) {
    if (colaborador.idTipoColaborador.toString() === ("1013")) {
      return this.checaCNPJ(colaborador.numeroDocumento);
    }
    return this.checaCPF(colaborador.numeroDocumento)
  }


}
