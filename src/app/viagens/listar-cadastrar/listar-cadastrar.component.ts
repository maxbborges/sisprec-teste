import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ValidationErrors } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalAnaliseRelatorioComponent } from "src/app/shared/components/modal-analise-relatorio/modal-analise-relatorio.component";
import { ModalAnaliseSolicitacaoComponent } from "src/app/shared/components/modal-analise-solicitacao/modal-analise-solicitacao.component";
import { PesquisarSolicitacaoDiariaUsuario, ResultadoSolicitacaoLocalidadeCoordenador, SolicitacaoLocalidade } from "src/app/shared/models/commands/cmdSolicitacaoDiaria";
import { Indicador, Usuario } from "src/app/shared/models/responses/sisprec-response";
import { ApiIndicadorService } from "src/app/shared/services/api-indicador.service";
import { ApiRelatorioViagensService } from "src/app/shared/services/api-relatorio-viagens.service";
import { ApiSolicitacaoDiaria } from "src/app/shared/services/api-solicitacao-diaria";
import { ModalService } from "src/app/shared/services/modal.service";
import { StorageService } from "src/app/shared/services/storage.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-viagens-listar-cadastrar",
  templateUrl: "./listar-cadastrar.component.html",
  styleUrls: ["./listar-cadastrar.component.scss"],
  standalone: false
})
export class ViagensListarCadastrarComponent implements OnInit {
  public formPesquisa: FormGroup;
  public usuario: Usuario;
  public status: Array<Indicador> = [];
  public statusSelecao: Array<any> = [];
  public resultadoPesquisa: Array<ResultadoSolicitacaoLocalidadeCoordenador> = [];
  public carregando: boolean = true;
  public msg: string;
  public isCoodenador = false;
  urlDownloadRelatorio = environment.urlApiSisprec + 'textoHtml/pdf/';
  public tituloDoc = "/relatorio-viagens";

  public localizacoes :Array<{value: SolicitacaoLocalidade, label: string}> =[];

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
  
  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private relatorioViagensService : ApiRelatorioViagensService,
    private router: Router,
    private route: ActivatedRoute,
    private apiIndicadorService: ApiIndicadorService,
    private m: ModalService,
    private solicitacaoDiariaService : ApiSolicitacaoDiaria,
    private ngbModal: NgbModal,
  ){}

  ngOnInit(): void {
    //verificar acesso
    this.verificarAcesso();

    //inicializar formulario
    this.inicializarFormulario();

    //recuperar indicadores
    this.recuperarStatus();
    this.recuperarLocalizacoes();

    //pesquisar relatórios do usuário
    this.pesquisar();
  }

  verificarAcesso(){
    this.usuario = this.storageService.getUsuarioLogado();

    if(this.usuario.tipoUsuarioSigla !== "UsuarioTecnico") {
      if((this.usuario.tipoUsuarioSigla === "UsuarioFederacao" 
        || this.usuario.tipoUsuarioSigla === "UsuarioDesenvolvedor") 
        && this.router.url.includes("minhas-viagens")){
        this.isCoodenador = true;
      } else{
        alert("Você não tem acesso a essa página");
        this.router.navigate([""]);
      }
    }
  }

  recuperarStatus(){
    // this.apiIndicadorService
    //   .listarTodosIndicadoresPorTipoSigla("StatusRelatorioViagens")
    //   .subscribe((x) => {
    //     this.status = x.map((v) => {
    //       v.nome = "Relatório " + v.nome
    //       return v;
    //     });
    //     this.formatarStatus();

    this.apiIndicadorService
      .listarTodosIndicadoresPorTipoSigla("StatusSolicitacaoDiaria")
      .subscribe((s) => {
        s.forEach((v) => {
          v.nome = "Solicitação " + v.nome
          return v;
        })
        this.status.push(...s);
        this.statusSelecao.push(...s);
    });
    // });
  }

  recuperarLocalizacoes(){
    this.solicitacaoDiariaService.recuperarLocalidades().subscribe(v => {
      this.localizacoes = v.map(v => {
        return {
          label: v.localizacao,
          value: v
        }
      })
    })
  }

  formatarStatus() {
    let reanalise : Indicador = null;
    const statusFiltrado : Array<any> = this.status.filter((v) => {
      if(v.sigla !== "ReanaliseRelatorio"){
        return true;
      } else {
        reanalise = v;
        return false;
      }
    });

    this.statusSelecao = statusFiltrado.map((v) => {
      v.idIndicador = +v.idIndicador;
      if (v.sigla == "NaoAnalisadoRelatorio"){
        v.idIndicador = ""+ v.idIndicador +","+ reanalise.idIndicador;
      }
      return v;
    })
  }


  inicializarFormulario() {
    this.formPesquisa = this.formBuilder.group({
      status: [''],
      dataInicial: [''],
      dataFinal: [''],
      id: [''],
      origem: [''],
      destino: [''],
    },{
      validators: [this.validarData]
    });
  }

  //pesquisa com filtros
  pesquisar() {
    const filtros: PesquisarSolicitacaoDiariaUsuario = {};

    if(this.elementFormNotEmpty("status")){
      filtros.idStatus = this.getValueForm("status").includes(",") ? this.getValueForm("status").split(",") : [this.getValueForm("status")];
    }
    if(this.elementFormNotEmpty("dataInicial")){
      filtros.dataInicial = this.getValueForm("dataInicial");
    }
    if(this.elementFormNotEmpty("dataFinal")){
      filtros.dataFinal = this.getValueForm("dataFinal");
    }
    if(this.elementFormNotEmpty("id")){
      filtros.idSolicitacaoNum = this.getValueForm("id");
    }

    if(this.elementFormNotEmpty("origem")){
      filtros.origemUf = this.getValueForm("origem").uf;
      filtros.origemCidade = this.getValueForm("origem").cidade;
    }

    if(this.elementFormNotEmpty("destino")){
      filtros.destinoUf = this.getValueForm("destino").uf;
      filtros.destinoCidade = this.getValueForm("destino").cidade;
    }

    this.solicitacaoDiariaService.listarSolicitacoesUsuario(filtros, this.usuario.idUsuario).subscribe((v) => {
      this.resultadoPesquisa = v;
      this.carregando = false;
      this.msg = undefined;
    },() => {
      this.carregando = false;
      this.msg = "Ocorreu um erro";
    })
  }

  get f() {
    return this.formPesquisa.controls;
  }

  elementFormNotEmpty(element: string){
    return this.getValueForm(element) != ''
  }

  getValueForm(element: string) {
    return this.formPesquisa.controls[element].value
  }

  ehPossivelCriar(dataFinal: string) {
    const dataHoje = new Date().toISOString().split('T')[0];
    const dataComp = dataFinal.split('T')[0];

    return dataComp <= dataHoje;
  }

  recuperarCor(status: string) {
    if(status == "Aceita")
      return "aprovado";

    if(status == "Retornada para Ajustes")
      return "ajuste";
    return "";
  }

  analisar(Id: string){
    const modalRef = this.ngbModal.open(ModalAnaliseSolicitacaoComponent,{ size: 'md', centered: true });
    modalRef.componentInstance.visualizacao = false;
    modalRef.componentInstance.idSolicitacao = Id;
    modalRef.result.then((result) => {
      console.log(result);
      this.pesquisar();
    })
  }

  excluir(Id: string) {
    this.m.confirm('Tem certeza que deseja excluir?').subscribe(resultado => {
      if (!resultado) {
        return;
      } 

      this.relatorioViagensService.excluirRelatorioViagens(Id).subscribe((v) => {
        console.log(v);
        this.m.alert("Relatório excluído com sucesso.", "Sucesso", "s");
        this.pesquisar();
      }, (error) => {
        this.m.alert("Ocorreu um erro ao excluir", "Erro", "e");
      })
    });
  }

  informacoesAjuste(Id: string){
    const modalRef = this.ngbModal.open(ModalAnaliseRelatorioComponent);
    modalRef.componentInstance.visualizacao = true;
    modalRef.componentInstance.idRelatorio = Id;
  }

  realizarDownload(solicitacao: ResultadoSolicitacaoLocalidadeCoordenador) {
    if(solicitacao.idRelatorioViagens)
      this.relatorioViagensService.gerarPDF(solicitacao.idRelatorioViagens);
    else
      this.solicitacaoDiariaService.gerarPDF(solicitacao.idSolicitacaoDiaria);
  }

  irPaginaCriarSolicitacao(){
    if(this.isCoodenador)
      this.router.navigate(["viagens/solicitar-diaria/cadastrar-minha-solicitacao"]);
  }
}