import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { Util } from 'src/app/shared/helpers/util';
import { InserirColaborador } from 'src/app/shared/models/commands/cmdColaborador';
import { Banco, Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiColaboradorService } from 'src/app/shared/services/api-colaborador.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-cadastrar-colaborador',
  templateUrl: './cadastrar-colaborador.component.html',
  styleUrls: ['./cadastrar-colaborador.component.scss'],
  standalone: false
})
export class CadastrarColaboradorComponent implements OnInit {
  public usuarioLogado: Usuario;
  public lstFederacoes: Indicador[] = [];
  public filtroFederacao: number = 0;
  public disableFederacoes = true;

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
    private apiIndicadorService: ApiIndicadorService,
    private apiColaborador: ApiColaboradorService,
    private storage: StorageService,
    private _segurancaService: SegurancaCheckService,
    private m: ModalService,
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.inicializarFormulario();
    this.carregarListaFederacoes();
    this.carregarListaBancos();
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      idTipoColaborador: ['1013', [Validators.required]],
      numeroDocumento: ['', [Validators.required]],
      nome: ['', [Validators.required]],
      email: ['', [Validators.required]],
      telefone: ['', [Validators.required]],
      idFederacao: ['', [Validators.required]],
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
    this.checaEspacos();        
    this.formCadastro.patchValue(
      {isExclusividade: '1'}
    )
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

  carregarListaFederacoes() {
    //console.log(this.usuarioLogado.tipoUsuarioSigla);
    if (this.usuarioLogado.tipoUsuarioSigla === 'UsuarioFederacao') {
      this.apiIndicadorService
        .buscarIndicadorPorId(this.usuarioLogado.idFiliacao)
        .subscribe((federacao) => {
          this.lstFederacoes.push(federacao);
          this.formCadastro.get('idFederacao').disable();
      }, (error) => {
        console.log('Erro ao carregar lista de federações:');
        console.log(error);
      });
    } else {
      this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('Federacao').subscribe((lstFederacoes) => {
        this.lstFederacoes.push(
          {
              idIndicador: 0,
              nome: null,
              sigla: 'Todas',
              valor: null,
              idIndicadorTipo: null,
              indicadorTipo: null,
              ativo: null
        });
        let siglas = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < lstFederacoes.length; i++) { siglas.push(lstFederacoes[i].sigla); }
        siglas = siglas.sort();
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < siglas.length; i++) {
          const obj = lstFederacoes.filter(
            item => {
              return item.sigla === siglas[i];
            });
          // tslint:disable-next-line: align
          this.lstFederacoes.push(obj[0]);
        }

        const userSisprec = JSON.parse(localStorage.getItem('userSisprec'));
        // seta a federação do usuário
        this.filtroFederacao = userSisprec.idFiliacao;
        this.disableFederacoes = false;

      }, (error) => {
        console.log('Erro ao carregar lista de federações:');
        console.log(error);
      });
    }
  }

  salvar() {
    this.formCadastro.patchValue({ idFederacao: !this.usuarioLogado.ehDex ? this.usuarioLogado.idFiliacao : 1003 });

    const colaborador: InserirColaborador = this.formCadastro.value;
    colaborador.idUsuarioCadastro = this.usuarioLogado.idUsuario;
    const validador = this.validaDados(colaborador)
    const nome =  this.formCadastro.get("nome").value;
    colaborador.nome = nome.trim();
    if(!validador){
      this.m.alert('Por favor, informe um CPF / CNPJ válido', 'Aviso', 'a')
      return;
    }
    if (this.formCadastro.valid) {
      colaborador.idFederacao = this.usuarioLogado.idFiliacao;
      if(this.formCadastro.controls.dataNascimento.value != null) colaborador.dataNascimento = new Date(colaborador.dataNascimento + 'T00:00:00');
      if(this.formCadastro.controls.dataNascimento.value != null) colaborador.dataAdmissao = new Date(colaborador.dataAdmissao + 'T00:00:00');
      if(this.formCadastro.controls.dataNascimento.value != null) colaborador.dataDesligamento = new Date(colaborador.dataDesligamento + 'T00:00:00');

      this.apiColaborador.inserirColaborador(colaborador).subscribe((data) => {
        if (data.success) {
          this.m.alert('Colaborador cadastrado com sucesso.', 'Sucesso', 's')
          this.router.navigate(['/gestaoFinanceira/colaborador']);
        } else {
          this.warn(data.message);
        }
      }, (error) => {
        console.log(error)
        this.m.alert('Ocorreu um erro ao cadastrar o colaborador', 'Erro', 'e')
      });
    } else {
      this.m.alert('Por favor, preencha todos os campos obrigatórios', 'Aviso', 'a')
    }
  }
  validaDados(colaborador: InserirColaborador) {
   if(colaborador.idTipoColaborador===("1013")){
    return this.checaCNPJ(colaborador.numeroDocumento);
   }
   return this.checaCPF(colaborador.numeroDocumento)
  }

  mudaTipoColaborador(event: any) {

    if (event.target.value === '1013') {
      this.ehPessoaJuridica = true;
    } else {
      this.ehPessoaJuridica = false;
    }

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
