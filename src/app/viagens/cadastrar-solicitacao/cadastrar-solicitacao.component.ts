import { Location } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AlterarSolicitacaoDiaria, InserirSolicitacaoDiaria, SolicitacaoDiariaCompletoPesquisa, SolicitacaoDiariaTrecho } from "src/app/shared/models/commands/cmdSolicitacaoDiaria";
import { Usuario } from "src/app/shared/models/responses/sisprec-response";
import { ApiSolicitacaoDiaria } from "src/app/shared/services/api-solicitacao-diaria";
import { ModalService } from "src/app/shared/services/modal.service";
import { StorageService } from "src/app/shared/services/storage.service";
import { CustomValidator } from "src/app/shared/validators/custom.validator";

@Component({
  selector: "app-viagens-cadastrar-solicitacao",
  templateUrl: "./cadastrar-solicitacao.component.html",
  styleUrls: ["./cadastrar-solicitacao.component.scss"],
  standalone: false
})
export class ViagensCadastrarSolicitacaoComponent implements OnInit {
  public formCadastro: FormGroup;
  public formTrecho: FormArray = this.formBuilder.array([],{validators: this.validarDataArray});
  public carregando = false;
  public submited: boolean = false;
  public editar: boolean = false;
  usuario: Usuario;
  public observacoes = "";
  private trechosExcluidos: Array<any> = [];
  private idSolicitacaoDiaria: string | null = null;
  public dadosAlteracao: SolicitacaoDiariaCompletoPesquisa | null = null;
  public ehProprio = false;
  

  constructor(
    private formBuilder: FormBuilder,
    private m: ModalService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private apiSolicitacaoDiaria: ApiSolicitacaoDiaria,
    private location: Location
  ){}

  validarData(group: FormGroup) : ValidationErrors{
    const dataInicial = group.controls.dataInicial;
    const dataFinal = group.controls.dataFinal;

    if(dataInicial.value === '' || dataFinal.value === '')
      return;
    else if(dataInicial.value > dataFinal.value){
      dataInicial.setErrors({maiorDataFinal:true});
      dataFinal.setErrors({menorDataInicial:true});
    } else {
      if (dataInicial.hasError('maiorDataFinal')) {
        delete dataInicial.errors['maiorDataFinal'];
        dataInicial.updateValueAndValidity();
      }
      if (dataFinal.hasError('menorDataInicial')) {
        delete dataFinal.errors['menorDataInicial'];
        dataFinal.updateValueAndValidity();
      }
    }
    return;
  }

  validarDataArray(control: AbstractControl) : ValidationErrors{
    const formArray = control as FormArray;

    if(formArray.controls.length < 2)
      return;

    const datasIniciais = formArray.controls.map(group => group.get('dataInicial').value);
    const datasFinais = formArray.controls.map(group => group.get('dataFinal').value);

    datasIniciais.forEach((v,i) => {
      if(i == 0)
        return;

      if(v == '' || datasFinais[i-1] == '')
        return;

      const dataInicialProximo = formArray.controls[i].get('dataInicial');
      const dataFinalAnterior = formArray.controls[i-1].get('dataFinal');

      if(v < datasFinais[i-1]) {
        dataInicialProximo.setErrors({menorDataAnterior:true});
        dataFinalAnterior.setErrors({maiorDataPosterior:true});
      } else {
        if (dataInicialProximo.hasError('menorDataAnterior')) {
          delete dataInicialProximo.errors['menorDataAnterior'];
          dataInicialProximo.updateValueAndValidity();
        }
        if (dataFinalAnterior.hasError('maiorDataPosterior')) {
          delete dataFinalAnterior.errors['maiorDataPosterior'];
          dataFinalAnterior.updateValueAndValidity();
        }
      }
    })
    return;
  }

  ngOnInit(): void {
    //verificar acesso e recuperar federação do usuário
    this.verificarAcesso();

    //inicializar formulario
    this.inicializarFormulario();

    //recuperar tipo de página
    this.recuperarTipoPagina();
  }

  verificarAcesso(){
    this.usuario = this.storageService.getUsuarioLogado();

    if(this.usuario.tipoUsuarioSigla !== "UsuarioFederacao"
      && this.usuario.tipoUsuarioSigla !== "UsuarioDesenvolvedor"
    ) {
      alert("Você não tem acesso a essa página");
      this.router.navigate([""]);
    }
  }

  recuperarTipoPagina() {
    if(this.route.snapshot.routeConfig.path.includes("cadastrar")){
      this.editar = false;
      //verificar se a solicitação é para o usuário federação
      if(this.router.url.includes("cadastrar-minha-solicitacao")){
        this.preencherNomeEmailSolicitante();
      } else{
        //se não for, adiciona verificação de e-mail
        this.verificacaoEmailIgualSolicitante();
      }
    } else {
      this.editar = true;
      //recuperar id
      this.route.params.subscribe(param => {
        //recuperar dados
        this.idSolicitacaoDiaria = param.id;
        this.recuperarDados();
      }) 
    }
  }

  preencherNomeEmailSolicitante(){
    this.ehProprio = true;
    this.formCadastro.patchValue({
      nomeDoViajante: this.usuario.nome,
      emailDoViajante: this.usuario.email
    });
  }

  verificacaoEmailIgualSolicitante(){
    this.formCadastro.controls.emailDoViajante.setValidators([Validators.required, Validators.email, CustomValidator.nomeNaoPermitido(this.usuario.email)])
  }

  recuperarDados() {
    if(this.idSolicitacaoDiaria == null)
      return;
    this.carregando = true;
    this.apiSolicitacaoDiaria.recuperarSolicitacaoPorId(this.idSolicitacaoDiaria).subscribe((v) => {
      this.dadosAlteracao = v;
      if(v.solicitacaoDiariaCompleto.idUsuarioViajante == this.usuario.idUsuario)
        this.ehProprio = true;
      
      this.preencherDadosFormulario();
      this.carregando = false;
    }, (erro) => {
      this.erro("Ocorreu um erro ao recuperar os dados");
    })
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      nomeDoViajante: ['', [Validators.required]],
      emailDoViajante: ['', [Validators.required, Validators.email]],
      finalidade: ['', [Validators.required, Validators.maxLength(500)]],
      distanciaKm: ['', [Validators.required, Validators.min(0)]],
      numeroDiarias: ['', [Validators.required, Validators.min(0)]],
      valorUnitarioDiaria: ['', [Validators.required, Validators.min(0.0001)]],
      valorTotal: ['', [Validators.required, Validators.min(0.0001)]],
      trechos: this.formTrecho,
      termo: ['', [Validators.requiredTrue]],
    });

    //cálculo para valor total

    this.formCadastro.controls.valorUnitarioDiaria.valueChanges.subscribe((_v) => {
      this.calcularValorTotal();
    });

    this.formCadastro.controls.numeroDiarias.valueChanges.subscribe((_v) => {
      this.calcularValorTotal();
    });
    this.adicionarNovoTrecho();
  }

  preencherDadosFormulario() {
    if(this.dadosAlteracao == null)
      return;

    const solicitacao = this.dadosAlteracao.solicitacaoDiariaCompleto;
    this.formTrecho.clear();
    this.dadosAlteracao.solicitacaoDiariaTrecho.forEach((v) => {
      const novoTrecho = this.formBuilder.group({
        id: [v.idSolicitacaoDiariaTrecho],
        origemUf: [v.origemUf, [Validators.required]],
        origemCidade: [v.origemCidade, [Validators.required]],
        destinoUf: [v.destinoUf, [Validators.required]],
        destinoCidade: [v.destinoCidade, [Validators.required]],
        dataInicial: [(v.dataInicio as string).split('T')[0], [Validators.required]],
        dataFinal: [(v.dataFim as string).split('T')[0], [Validators.required]]
      }, {
        validators: [this.validarData]
      });
      this.formTrecho.push(novoTrecho);
    })  
    this.formCadastro.patchValue({
      nomeDoViajante: solicitacao.nomeViajante,
      emailDoViajante: solicitacao.emailViajante,
      finalidade: solicitacao.finalidadeViagem,
      distanciaKm: solicitacao.distanciaKm,
      numeroDiarias: solicitacao.numeroDiarias,
      valorUnitarioDiaria: solicitacao.valorUnitarioDiaria,
      valorTotal: solicitacao.valorTotal
    });

    this.formCadastro.updateValueAndValidity();
  }

  adicionarNovoTrecho() {
    const novoTrecho = this.formBuilder.group({
      id: [null],
      origemUf: ['', [Validators.required]],
      origemCidade: ['', [Validators.required]],
      destinoUf: ['', [Validators.required]],
      destinoCidade: ['', [Validators.required]],
      dataInicial: ['', [Validators.required]],
      dataFinal: ['', [Validators.required]],
    }, {
      validators: [this.validarData]
    });
    
    this.formTrecho.push(novoTrecho);
  }

  excluirTrecho(item: FormGroup){
    let posicaoEncontrada = (this.formTrecho.controls as Array<FormGroup>).findIndex(x => x == item);

    if(posicaoEncontrada !== undefined && posicaoEncontrada !== null) {
      if(item.controls.id.value != null)
        this.trechosExcluidos.push(item);

      (this.formTrecho.controls as Array<any>).splice(posicaoEncontrada, 1);

      this.formTrecho.updateValueAndValidity();
    }
  }

  get f() {
    return this.formCadastro.controls;
  }

  calcularValorTotal(){
    let numeroDias = +this.f.numeroDiarias.value;
    let valorUnitarioDiaria = this.f.valorUnitarioDiaria.value;

    this.formCadastro.controls.valorTotal.setValue(numeroDias * valorUnitarioDiaria);
  }

  cadastrar() {
    this.submited = true;
    this.carregando = true;

    if(this.formCadastro.invalid){
      alert("Por favor, verifique o preenchimento dos campos");
      this.carregando = false;
      return;
    }

    this.calcularValorTotal();

    if(!this.editar) {
      this.efetuarCadastro();
    } else {
      this.efetuarEdicao();
    }
  }

  efetuarCadastro() {
    let solicitacao : InserirSolicitacaoDiaria = {
      nomeViajante: this.recuperarDadosFormulario("nomeDoViajante"),
      emailViajante: this.recuperarDadosFormulario("emailDoViajante"),
      distanciaKm: this.recuperarDadosFormulario("distanciaKm"),
      numeroDiarias: this.recuperarDadosFormulario("numeroDiarias"),
      valorUnitarioDiaria: this.recuperarDadosFormulario("valorUnitarioDiaria"),
      valorTotal: this.recuperarDadosFormulario("valorTotal"),
      finalidadeViagem: this.recuperarDadosFormulario("finalidade"),
      idUsuarioSolicitante: this.usuario.idUsuario,
      idFederacaoSolicitante: this.usuario.idFiliacao,
      solicitacoesDiariaTrecho: this.recuperarDadosFormArray(),
      assinado: this.recuperarDadosFormulario("termo"),
    }

    this.apiSolicitacaoDiaria.cadastrarSolicitacao(solicitacao).subscribe((v) => {
      if(v !== null) {
        this.sucesso();
        this.carregando = false;
      } else {
        this.erro("Ocorreu um erro inesperado");
        this.carregando = false;
      }
    }, (er) => {
      this.erro(er.error);
      this.carregando = false;
    })
  }

  efetuarEdicao() {
    let solicitacao : AlterarSolicitacaoDiaria = {
      nomeViajante: this.recuperarDadosFormulario("nomeDoViajante"),
      emailViajante: this.recuperarDadosFormulario("emailDoViajante"),
      distanciaKm: this.recuperarDadosFormulario("distanciaKm"),
      numeroDiarias: this.recuperarDadosFormulario("numeroDiarias"),
      valorUnitarioDiaria: this.recuperarDadosFormulario("valorUnitarioDiaria"),
      valorTotal: this.recuperarDadosFormulario("valorTotal"),
      finalidadeViagem: this.recuperarDadosFormulario("finalidade"),
      idUsuarioSolicitante: this.usuario.idUsuario,
      idFederacaoSolicitante: this.usuario.idFiliacao,
      solicitacoesDiariaTrecho: this.recuperarDadosFormArray(),
      assinado: this.recuperarDadosFormulario("termo"),
      solicitacoesDiariaTrechoExcluido: this.recuperarDadosFormArrayExcluido()
    }

    this.apiSolicitacaoDiaria.editarSolicitacao(solicitacao, this.idSolicitacaoDiaria).subscribe((v) => {
      if(v !== null) {
        this.sucesso();
        this.carregando = false;
      } else {
        this.erro("Ocorreu um erro inesperado");
        this.carregando = false;
      }
    }, (er) => {
      this.erro("Ocorreu um erro inesperado");
      this.carregando = false;
    });
  }

  recuperarDadosFormulario(nome:string) {
    return this.f[nome].value;
  }

  recuperarDadosFormArray(): Array<SolicitacaoDiariaTrecho> {
    const solicitacoes: Array<SolicitacaoDiariaTrecho> = this.formTrecho.controls.map((v: FormGroup) => {
      return {
        idSolicitacaoDiariaTrecho: v.controls.id.value,
        origemUf: v.controls.origemUf.value,
        origemCidade: v.controls.origemCidade.value,
        destinoUf: v.controls.destinoUf.value,
        destinoCidade: v.controls.destinoCidade.value,
        dataInicio: v.controls.dataInicial.value,
        dataFim: v.controls.dataFinal.value,
      }
    });

    return solicitacoes;
  }

  recuperarDadosFormArrayExcluido(): Array<SolicitacaoDiariaTrecho> {
    const solicitacoes: Array<SolicitacaoDiariaTrecho> = this.trechosExcluidos.map((v: FormGroup) => {
      return {
        idSolicitacaoDiariaTrecho: v.controls.id.value,
        origemUf: v.controls.origemUf.value,
        origemCidade: v.controls.origemCidade.value,
        destinoUf: v.controls.destinoUf.value,
        destinoCidade: v.controls.destinoCidade.value,
        dataInicio: v.controls.dataInicial.value,
        dataFim: v.controls.dataFinal.value,
      }
    });

    return solicitacoes;
  }

  cancelar() {
    //tem certeza que deseja cancelar?
    this.m.confirm('Tem certeza que deseja cancelar a ação?').subscribe(resultado => {
      if (!resultado) {
        return;
      }

      this.location.back();
    });
  }

  sucesso() {
    console.log(this.ehProprio);
    if(this.ehProprio)
      this.router.navigate(['/viagens/minhas-viagens']);
    else
      this.router.navigate(['/viagens/listar-relatorios']);
    //abrir modal de sucesso
    this.m.alert("Solicitação de diária salva e assinado com sucesso!","Sucesso","s");
  }

  erro(mensagem: string) {
    this.m.alert(mensagem,"Ocorreu um erro","e");
  }

}