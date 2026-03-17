import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ValidationErrors } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalAnaliseRelatorioComponent } from "src/app/shared/components/modal-analise-relatorio/modal-analise-relatorio.component";
import { ModalAnaliseSolicitacaoComponent } from "src/app/shared/components/modal-analise-solicitacao/modal-analise-solicitacao.component";
import { PesquisarSolicitacaoDiariaCoordenador, ResultadoSolicitacaoLocalidadeCoordenador, SolicitacaoLocalidade } from "src/app/shared/models/commands/cmdSolicitacaoDiaria";
import { Indicador, Usuario } from "src/app/shared/models/responses/sisprec-response";
import { ApiIndicadorService } from "src/app/shared/services/api-indicador.service";
import { ApiRelatorioViagensService } from "src/app/shared/services/api-relatorio-viagens.service";
import { ApiSolicitacaoDiaria } from "src/app/shared/services/api-solicitacao-diaria";
import { ModalService } from "src/app/shared/services/modal.service";
import { StorageService } from "src/app/shared/services/storage.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-viagens-listar-relatorios-coordenador",
  templateUrl: "./listar-relatorios-coordenador.component.html",
  styleUrls: ["./listar-relatorios-coordenador.component.scss"],
  standalone: false
})
export class ViagensListarRelatoriosCoordenadorComponent implements OnInit {
  public formPesquisa: FormGroup;
  public usuario: Usuario;
  public status: Array<Indicador> = [];
  public statusSelecao: Array<any> = [];
  public resultadoPesquisa: Array<ResultadoSolicitacaoLocalidadeCoordenador> = [];
  public carregando: boolean = true;
  public msg: string;
  urlDownloadRelatorio = environment.urlApiSisprec + 'textoHtml/pdf/';
  public tituloDoc = "/relatorio-viagens";
  public ehPresidente = false;

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
    private solicitacaoDiariaService : ApiSolicitacaoDiaria,
    private m: ModalService,
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

    if(this.usuario.tipoUsuarioSigla !== "UsuarioFederacao") {
      if(this.usuario.tipoUsuarioSigla === "UsuarioPresidente"
        || this.usuario.tipoUsuarioSigla === "UsuarioDesenvolvedor"
      ){
        this.ehPresidente = true;
      } else {
        alert("Você não tem acesso a essa página");
        this.router.navigate([""]);
      }
    }
  }

  recuperarStatus(){
    // this.apiIndicadorService
    // .listarTodosIndicadoresPorTipoSigla("StatusRelatorioViagens")
    // .subscribe((x) => {
    //   this.status = x.map((v) => {
    //     v.nome = "Relatório " + v.nome
    //     return v;
    //   });
    //   this.formatarStatus();

    this.apiIndicadorService
      .listarTodosIndicadoresPorTipoSigla("StatusSolicitacaoDiaria")
      .subscribe((s) => {
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

  inicializarFormulario() {
    this.formPesquisa = this.formBuilder.group({
      nome: [''],
      email: [''],
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
    const filtros: PesquisarSolicitacaoDiariaCoordenador = {
      idFederacao: this.usuario.idFiliacao,
      idStatus: []
    }

    if(this.elementFormNotEmpty("status")){
      filtros.idStatus = this.getValueForm("status").includes(",") ? this.getValueForm("status").split(",") : [this.getValueForm("status")];
    }
    if(this.elementFormNotEmpty("dataInicial")){
      filtros.dataInicial = this.getValueForm("dataInicial");
    }
    if(this.elementFormNotEmpty("dataFinal")){
      filtros.dataFinal = this.getValueForm("dataFinal");
    }

    const control = this.formPesquisa.get("id")?.value;
    if(control){
      filtros.idSolicitacaoNum = control;
    }
    if(this.elementFormNotEmpty("nome")){
      filtros.nomeViajante = this.getValueForm("nome");
    }
    if(this.elementFormNotEmpty("email")){
      filtros.emailViajante = this.getValueForm("email");
    }

    if(this.elementFormNotEmpty("origem")){
      filtros.origemUf = this.getValueForm("origem").uf;
      filtros.origemCidade = this.getValueForm("origem").cidade;
    }

    if(this.elementFormNotEmpty("destino")){
      filtros.destinoUf = this.getValueForm("destino").uf;
      filtros.destinoCidade = this.getValueForm("destino").cidade;
    }

    if(this.ehPresidente) {
      this.solicitacaoDiariaService.listarSolicitacoesPresidente(filtros).subscribe((v) => {
        this.resultadoPesquisa = v;
        this.carregando = false;
        this.msg = undefined;
      },() => {
        this.carregando = false;
        this.msg = "Ocorreu um erro";
        this.resultadoPesquisa = [];
      });
    } else {
      this.solicitacaoDiariaService.listarSolicitacoesCoordenador(filtros).subscribe((v) => {
        this.resultadoPesquisa = v;
        this.carregando = false;
        this.msg = undefined;
      },() => {
        this.carregando = false;
        this.msg = "Ocorreu um erro";
        this.resultadoPesquisa = [];
      });
    }
  }

  get f() {
    return this.formPesquisa.controls;
  }

  realizarDownload(solicitacao: ResultadoSolicitacaoLocalidadeCoordenador) {
    if(solicitacao.idRelatorioViagens)
      this.relatorioViagensService.gerarPDF(solicitacao.idRelatorioViagens);
    else
      this.solicitacaoDiariaService.gerarPDF(solicitacao.idSolicitacaoDiaria);
  }

  elementFormNotEmpty(element: string){
    return this.getValueForm(element) != '' && this.getValueForm(element) != null && (this.getValueForm(element).length > 0 || typeof(this.getValueForm(element)) == 'object')
  }

  getValueForm(element: string) {
    return this.formPesquisa.controls[element].value
  }

  analisar(Id: string){
    const modalRef = this.ngbModal.open(ModalAnaliseRelatorioComponent);
    modalRef.componentInstance.visualizacao = false;
    modalRef.componentInstance.idRelatorio = Id;
    modalRef.result.then((result) => {
      console.log(result);
      this.pesquisar();
    })
  }

  analisarSolicitacao(Id: string){
    const modalRef = this.ngbModal.open(ModalAnaliseSolicitacaoComponent,{ size: 'md', centered: true });
    modalRef.componentInstance.visualizacao = false;
    modalRef.componentInstance.idSolicitacao = Id;
    modalRef.result.then((result) => {
      console.log(result);
      this.pesquisar();
    })
  }

  recarregar(params:string){
    this.pesquisar();
    console.log(params);
  }

  analisado(status:string) {
    return status != 'Não analisado' && status != 'Reanálise';
  }

  recuperarCor(status: string) {
    if(status == "Aceita")
      return "aprovado";

    if(status == "Retornada para Ajustes")
      return "ajuste";
    return "";
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

  excluir(Id: string) {
    this.m.confirm('Tem certeza que deseja excluir?').subscribe(resultado => {
      if (!resultado) {
        return;
      } 

      this.solicitacaoDiariaService.excluirSolicitacao(Id, this.usuario.idUsuario).subscribe((v) => {
        console.log(v);
        this.m.alert("Relatório excluído com sucesso.", "Sucesso", "s");
        this.pesquisar();
      }, (error) => {
        this.m.alert("Ocorreu um erro ao excluir", "Erro", "e");
      })
    });
  }

  irPaginaCriarSolicitacao(){
    this.router.navigate(["viagens/solicitar-diaria/cadastrar"]);
  }
}