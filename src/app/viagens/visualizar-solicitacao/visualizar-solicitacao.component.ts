import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SolicitacaoDiariaCompletoPesquisa } from "src/app/shared/models/commands/cmdSolicitacaoDiaria";
import { Usuario } from "src/app/shared/models/responses/sisprec-response";
import { ApiSolicitacaoDiaria } from "src/app/shared/services/api-solicitacao-diaria";
import { ModalService } from "src/app/shared/services/modal.service";
import { StorageService } from "src/app/shared/services/storage.service";

@Component({
  selector: "app-viagens-visualizar-solicitacao",
  templateUrl: "./visualizar-solicitacao.component.html",
  styleUrls: ["./visualizar-solicitacao.component.scss"],
  standalone: false
})
export class ViagensVisualizarSolicitacaoComponent implements OnInit {
  public formCadastro: FormGroup;
  public formTrecho: FormArray = this.formBuilder.array([]);
  public submited: boolean = false;
  public editar: boolean = false;
  usuario: Usuario;
  public observacoes = "";
  private idSolicitacaoDiaria: string | null = null;
  private dados: SolicitacaoDiariaCompletoPesquisa | null = null;
  

  constructor(
    private formBuilder: FormBuilder,
    private m: ModalService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private apiSolicitacaoDiaria: ApiSolicitacaoDiaria
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
      dataInicial.setErrors(null);
      dataFinal.setErrors(null);
    }
    return;
  }

  ngOnInit(): void {
    this.usuario = this.storageService.getUsuarioLogado();

    //inicializar formulario
    this.inicializarFormulario();

    //recuperar dados da página
    this.recuperarId();
  }

  recuperarId() {
    //recuperar id
    this.route.params.subscribe(param => {
      //recuperar dados
      this.idSolicitacaoDiaria = param.id;

      //verificarAcesso
      this.apiSolicitacaoDiaria.verificarAcessoVisualizacaoSolicitacao(this.idSolicitacaoDiaria, this.usuario.idUsuario).subscribe((temAcesso: boolean) => {
        if(temAcesso){
          this.recuperarDados();
        } else {
          this.m.alert("Você não tem acesso a essa página.","Aviso","a");
          this.router.navigate(['']);
        }
      },(er) => {
        this.erro("Ocorreu um erro ao verificar o acesso.");
      })
    }) 
  }

  recuperarDados() {
    if(this.idSolicitacaoDiaria == null)
      return;
    this.apiSolicitacaoDiaria.recuperarSolicitacaoPorId(this.idSolicitacaoDiaria).subscribe((v) => {
      this.dados = v;
      this.preencherDadosFormulario();
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
      termo: [true, [Validators.requiredTrue]],
    });
    this.adicionarNovoTrecho();
    
  }

  preencherDadosFormulario() {
    if(this.dados == null)
      return;

    const solicitacao = this.dados.solicitacaoDiariaCompleto;
    this.formTrecho.clear();

    this.dados.solicitacaoDiariaTrecho.forEach((v) => {
      const novoTrecho = this.formBuilder.group({
        id: [v.idSolicitacaoDiariaTrecho],
        origem: [v.origemCidade +"/"+ v.origemUf, [Validators.required]],
        destino: [v.destinoCidade +"/"+ v.destinoUf, [Validators.required]],
        dataInicial: [(v.dataInicio as string).split('T')[0], [Validators.required]],
        dataFinal: [(v.dataFim as string).split('T')[0], [Validators.required]]
      }, {
        validators: [this.validarData]
      });
      this.formTrecho.push(novoTrecho);
    })  

    //desabilitando todos os campos
    this.formCadastro.disable();
    this.formTrecho.disable();

    this.formCadastro.patchValue({
      nomeDoViajante: solicitacao.nomeViajante,
      emailDoViajante: solicitacao.emailViajante,
      finalidade: solicitacao.finalidadeViagem,
      distanciaKm: solicitacao.distanciaKm,
      numeroDiarias: solicitacao.numeroDiarias,
      valorUnitarioDiaria: solicitacao.valorUnitarioDiaria,
      valorTotal: solicitacao.valorTotal,
    });
  }

  adicionarNovoTrecho() {
    const novoTrecho = this.formBuilder.group({
      id: [null],
      origem: ['', [Validators.required]],
      destino: ['', [Validators.required]],
      dataInicial: ['', [Validators.required]],
      dataFinal: ['', [Validators.required]],
    }, {
      validators: [this.validarData]
    });
    
    this.formTrecho.push(novoTrecho);
  }


  get f() {
    return this.formCadastro.controls;
  }

  cancelar() {
    //tem certeza que deseja cancelar?
    this.m.confirm('Tem certeza que deseja cancelar a ação?').subscribe(resultado => {
      if (!resultado) {
        return;
      }

      this.router.navigate(['/viagens/listar-relatorios']);
    });
  }

  sucesso() {
    this.router.navigate(['/viagens/listar-relatorios']);
    //abrir modal de sucesso
    this.m.alert("Solicitação de diária salva e assinado com sucesso!","Sucesso","s");
  }

  erro(mensagem: string) {
    this.m.alert(mensagem,"Ocorreu um erro","e");
  }

}