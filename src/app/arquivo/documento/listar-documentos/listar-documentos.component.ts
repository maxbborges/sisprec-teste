import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalFLuxoCaixaComponent } from 'src/app/shared/components/modal-fluxo-caixa/modal-fluxo-caixa.component';
import { Util } from 'src/app/shared/helpers/util';
import { DesativarDocumento, InserirDocumento, ListarDocumentoFiltrado } from 'src/app/shared/models/commands/cmdDocumento';
import { ListarNomeDocumentoFiltrado } from 'src/app/shared/models/commands/cmdNomeDocumento';
import {
  Documento, Indicador,
  ListaNomeDocumentoCategorizado, TipoUsuario, Usuario
} from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiDocumentoService } from 'src/app/shared/services/api-documento.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiNomeDocumentoService } from 'src/app/shared/services/api-nome-documento.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { ApiTextoHtmlService } from 'src/app/shared/services/api-texto-html.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-listar-documentos',
  templateUrl: './listar-documentos.component.html',
  styleUrls: ['./listar-documentos.component.scss'],
  standalone: false
})
export class ListarDocumentosComponent implements OnInit {
  public usuarioLogado: Usuario;
  public idTipoPrestacaoContas: number;
  public formCadastro: FormGroup;

  public lstFederacoes: Indicador[] = [];
  public lstTipos: Indicador[] = [];
  public disableFederacoes = true;


  public lstTipoDocumento: ListaNomeDocumentoCategorizado[];
  public lstDocumento: Documento[] = [];
  public msg = 'Selecione os filtros';
  public loading = false;

  //
  public urlDownload = environment.urlApiSisprec + 'arquivo/porId/';
  public urlDownloadRelatorio = environment.urlApiSisprec + 'textoHtml/pdf/';
  public tituloDoc = "/relatorio-coordenador";

  // Filtros
  public filtroAno: number = 0;
  public filtroFederacao: number = 0;
  public filtroTipoDocumento: any = null; // NomeDocumento;
  public filtroMes: number = 0;
  public filtroTipo: number = 0;
  public filtroAtivo = 0;

  //Arquivo
  public nomeArquivo: string = '';
  public arquivo: any = null;

  public acaoBloqueada: boolean = false;
  public bloquearSalvarPorStatus: boolean = false;
  public lstPrestacao: any[] = [];

  public idDocumento: string;

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private formBuilder: FormBuilder,
    private apiIndicadorService: ApiIndicadorService,
    private apiNomeDocumentoService: ApiNomeDocumentoService,
    private apiDocumentoService: ApiDocumentoService,
    private alertService: AlertService,
    private storageService: StorageService,
    private textoHtmlService: ApiTextoHtmlService,
    private _segurancaService: SegurancaCheckService,
    private router: Router,
    private ngbModal: NgbModal,
    private prestacaoService: ApiPrestacaoContasService,
    private _route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);

    this.carregaIdTipoPrestacaoContas();    
    
  }

  carregarDocumentoPorSolicitacao(){
    if(this._route.snapshot.paramMap.get('idDocumento')){
      this.idDocumento = this._route.snapshot.paramMap.get('idDocumento');
      //this.alertService.exibirAlerta('Documento para ' + this.usuarioLogado.idTipoUsuario, tipo.atencao);
      const documentoSelect = this.apiDocumentoService.obterDocumentoByIdDocumento(this.idDocumento).subscribe((d) => {
        if(d){
          this.abrirModalSelecionado(d);
        }
      })
    }
  }
  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      ano: ['', Validators.required],
      idNomeDocumento: ['', Validators.required],
      mes: ['0'],
      idArquivo: ['', Validators.required],
      idFederacaoDono: ['', Validators.required]
    });
    this.carregarDocumentoPorSolicitacao();
  }

  carregaIdTipoPrestacaoContas(){
    this.apiIndicadorService.visualizarIndicadorPorSigla('DocPrestacaoDeContas').subscribe((data) => {
      this.idTipoPrestacaoContas = data.idIndicador;
      this.carregarListaFederacoes();
    }, (error) => {
      console.log('Erro ao carregar dados dos indicadores de prestação de contas:');
      console.log(error);
    });
  }

  carregarListaTipos(){
    this.apiIndicadorService.listarTodosIndicadoresPorTipoId(5).subscribe((data) => {
      this.lstTipos = data;
      try{
        if(this.getIsPresidente()){
          this.lstTipos = data.filter((x)=>{
            if(x.nome.toLowerCase() === 'prestação de contas') {
              this.filtroTipo = x.idIndicador;
              this.selecionouFiltro()
              return x;
            };
          })
        }
        this.inicializarFormulario();
      }catch{}
    })
  }

  carregarListaFederacoes(){
    if (this.usuarioLogado.tipoUsuarioSigla === 'UsuarioFederacao') {
      this.apiIndicadorService
        .buscarIndicadorPorId(this.usuarioLogado.idFiliacao)
        .subscribe((federacao) => {
          this.lstFederacoes.push(federacao);
          this.carregarListaTipos();
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
        this.carregarListaTipos();
      }, (error) => {
        console.log('Erro ao carregar lista de federações:');
        console.log(error);
      });
    }
  }

  selecionouFiltro() {
    // Reseta o filtro de documento e mês quando o tipo é alterado
    this.filtroTipoDocumento = null;
    this.filtroMes = 0;

    const cmdFiltrarListaNomeDocumento: ListarNomeDocumentoFiltrado = { exercicio: this.filtroAno, idTipo: this.filtroTipo, ativo: 1 };
    this.apiNomeDocumentoService.listarNomeDocumentoFiltradoCategorizado(cmdFiltrarListaNomeDocumento).subscribe((data) => {
      if(this.getIsPresidente() && this.filtroTipo.toString() !== '38') return;
      this.lstTipoDocumento = data;
      if(this.usuarioLogado.tipoUsuarioSigla === TipoUsuario.Presidente){
        try{
          var abort = false;
          this.lstTipoDocumento = data.filter((x) => {
            if(x.nome.toUpperCase().includes('FLUXO DE')){
              this.filtroTipoDocumento = x.idTipo;
              abort = true;              
              return x;
            }
            if(abort) return;
          });
        }catch{}
      }
    }, (error) => {
      console.log('Erro ao retornar lista de documentos:');
      console.log(error);
      this.lstTipoDocumento = [];
    });
  }

  carregarListaDocumentos() {

    console.log(this.filtroTipo)
    this.loading = true;
    const cmdFiltrarListaDocumento: ListarDocumentoFiltrado = {
      ano: this.filtroAno,
      idFederacaoDono: this.usuarioLogado.tipoUsuarioSigla === 'UsuarioFederacao' ? this.usuarioLogado.idFiliacao : parseInt(this.filtroFederacao.toString()),
      idNomeDocumento: this.filtroTipoDocumento !== null ? this.filtroTipoDocumento.idNomeDocumento : 0,
      mes: this.filtroMes,
      idTipo: this.filtroTipo,
    };

    if (this.filtroTipoDocumento !== null && this.filtroTipoDocumento.idTipo !== this.idTipoPrestacaoContas) {
      cmdFiltrarListaDocumento.mes = 0;
    }

    this.apiDocumentoService.listarDocumentoFiltrado(cmdFiltrarListaDocumento).subscribe((lstDocumento) => {
      if (lstDocumento.length > 0) {
        this.lstDocumento = lstDocumento;
        if(this.getIsPresidente()){
          try{
            this.lstDocumento = lstDocumento.filter((x)=>{
              if(x.nomeDocumento.toUpperCase().includes("FLUXO DE CAIXA")) return x;
            })
          }catch{}
        }
        this.bloquearSalvarPorStatus = this.validarAcao(this.lstDocumento[0]);
        this.msg = '';
      } else {
        this.lstDocumento = [];
        this.bloquearSalvarPorStatus = false;
        this.msg = 'Não foi encontrado nenhum resultado para a pesquisa realizada.';
      }
      this.loading = false;
    }, (error) => {
      console.log('Erro ao retornar lista de documentos:');
      console.log(error);
      this.loading = false;
    });
  }

  desativarDocumento(idDocumento: string, nomeDocumento: string) {
    if (this.alertService.exibirConfirmacao(`Tem certeza de que deseja excluir o documento: ${nomeDocumento}?`, tipo.atencao)) {
      const desativarDocumento: DesativarDocumento = {
        idDocumento,
        idUsuarioDesativacao: this.usuarioLogado.idUsuario
      };
      this.apiDocumentoService.desativarDocumento(desativarDocumento).subscribe((retorno) => {
        if (retorno) {
          this.alertService.exibirAlerta('Documento excluído com sucesso.', tipo.sucesso);
          this.carregarListaDocumentos();
        } else {
          this.alertService.exibirAlerta('Ocorreu um erro ao excluir o documento.', tipo.erro);
        }
      }, (error) => {
        console.log('Erro ao excluir documento:');
        console.log(error);
      });
    }
  }

  escreveMes(mes: number) {
    return Util.mes(mes);
  }

  subiuArquivo(evento){
    this.nomeArquivo = evento.nomeArquivo;
    this.arquivo = evento;
  }

  salvarDocumento(){

    this.filtroTipo = Number(this.filtroTipo);

    let tipoDoc = this.lstTipos.find(x => x.idIndicador == this.filtroTipo);

    if(this.filtroAno !== 0 && this.filtroTipoDocumento !== ''){
      if(this.filtroTipo > 0) {
        if(tipoDoc.sigla === 'DocPrestacaoDeContas' && this.filtroMes > 0){
          this.cadastrarDocumento();
        } else if (tipoDoc.sigla === 'DocConvenio' || tipoDoc.sigla === 'DocContratos') {
          this.cadastrarDocumento();
        } else {
          this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios', tipo.atencao);
        }
      }
    }
  }

  cadastrarRelatorio(){
    //verificar se todos os campos estão preenchidos
    if(this.filtroAno !== 0 && this.filtroTipoDocumento !== ''){
      if(this.filtroTipo > 0) {
        if(this.ehTipoRelatorioCoordenador() && this.filtroMes > 0){
          //abre a tela de cadastro de relatório
          this.router.navigate(['arquivo/documentos/relatorio-coordenador/' + this.filtroAno + '/' + this.filtroMes + '/' + this.filtroTipoDocumento.idNomeDocumento]);
        }
      }
    }
  }

  editarRelatorio(documento:any){
    this.router.navigate(['arquivo/documentos/relatorio-coordenador/editar/' + documento.idDocumento]);
  }

  montarFormCadastro(){
    this.formCadastro.patchValue({idFederacaoDono: !this.usuarioLogado.ehDex ? this.usuarioLogado.idFiliacao : 1003});

    if(this.arquivo !== null){
      this.formCadastro.patchValue({
        ano: this.filtroAno,
        idArquivo: this.arquivo.idArquivo,
      });
    }

    if(this.filtroTipoDocumento !== null){
      this.formCadastro.patchValue({idNomeDocumento: this.filtroTipoDocumento.idNomeDocumento})
    }

    let tipoDoc = this.lstTipos.find(x => x.idIndicador == this.filtroTipo);

    if (tipoDoc.sigla === 'DocConvenio' || tipoDoc.sigla === 'DocContratos') {
      this.formCadastro.patchValue({ mes: 0 });
    }

  }

  limparArquivo(){
    this.nomeArquivo = '';
    this.arquivo = null;
    this.formCadastro.patchValue({idArquivo: ''})
  }

  limparCampos(){
    this.filtroAno = 0;
    this.filtroFederacao = this.usuarioLogado.tipoUsuarioSigla === 'UsuarioFederacao' ? this.usuarioLogado.idFiliacao : 0;
    this.filtroTipoDocumento= null;
    this.filtroMes = 0;
    this.filtroTipo = 0;

    this.nomeArquivo = '';
    this.arquivo = null;
  }

  cadastrarDocumento(){

    //this.formCadastro.patchValue({ano: this.filtroAno, idArquivo: this.arquivo.idArquivo})

      this.montarFormCadastro();

      if (this.formCadastro.valid) {
        const documento: InserirDocumento = this.formCadastro.value;
        documento.idUsuarioCadastro = this.usuarioLogado.idUsuario;
        documento.idQuemSubiu = this.usuarioLogado.idUsuario;
        documento.idFederacaoDono = this.usuarioLogado.idFiliacao;
        documento.mes = this.filtroMes;

        this.apiDocumentoService.inserirDocumento(documento).subscribe((data) => {
          if (data) {
            this.alertService.exibirAlerta('Documento cadastrado com sucesso', tipo.sucesso);
            this.carregarListaDocumentos();
            //this.router.navigate(['arquivo/documentos']);
          } else {
            this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o documento', tipo.erro);
          }
        }, (error) => {
          console.log('Erro ao inserir Documento:');
          console.log(error);
          this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o documento', tipo.erro);
        });
        console.log('Formulário:');
        console.log(documento);
      } else {
        this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios', tipo.atencao);
      }

      this.limparArquivo();
  }

  validarAcao(documento: Documento) {
    const statusNaoPermitidos = [
      'EnviadaAnalise',
      'Reanalise',
      'AprovadaConferenciaDocumentacao',
      'AprovadaGestorFiscal'
    ];

    if(statusNaoPermitidos.includes(documento.siglaStatusPrestacaoContas))
      return true;

    return false;
  }

  ehPC(documentos: Documento[]): boolean {
    return documentos.some(documento => documento.tipo === 'Prestação de Contas');
  }

  ehTipoRelatorioCoordenador():boolean {
    try{
      return this.filtroTipoDocumento !== null && this.filtroTipoDocumento.nome !== null && this.filtroTipoDocumento.nome.includes('9º')
    }catch{
      return false;
    }
  }
  ehTipoRelatorioCoordenadorFluxo():boolean {
    try{
      return this.filtroTipoDocumento !== null && this.filtroTipoDocumento.nome !== null && this.filtroTipoDocumento.nome.toString().toUpperCase().includes('FLUXO')
    }catch{
      return false;
    }
  }

  pesquisar(){
    if(this.getIsPresidente() && this.filtroTipoDocumento == '-1'){
      this.alertService.exibirAlerta("Selecione 'Fluxo de Caixa'",tipo.atencao);
      return;
    }
    var isPeriodoPossuiPC: boolean = false;
    var pesquisa = {
      anoExercicio:'',
      mesExercicio:'',
      idStatusAtualPrestacaoContas: 0,
      versao: 0,
      idFederacao: this.usuarioLogado.idFiliacao
    };

    // const filtro: string = 'IdFederacao=' + form.IdFederacao + '&' + 'exercicio=' + form.exercicio + '&' +
    // 'idStatusAtualPrestacaoContas=' + form.idStatusAtualPrestacaoContas + '&' + 'versao=' + form.versao;
    // this.location.go('/prestacaoDeContas/listar/', filtro);

    pesquisa.anoExercicio = this.filtroAno.toString();//.split('/')[1];
    pesquisa.mesExercicio = this.filtroMes.toString();//.split('/')[0];

    this.prestacaoService.buscarPrestacoesContas(pesquisa).subscribe(
      data => {
        if(data.length > 0){
          this.lstPrestacao = data;
          isPeriodoPossuiPC = true;
        }else{

        }
      }
    );
    return isPeriodoPossuiPC;
  }
  abrirModal() {
      if(+this.filtroAno > 0 && 
          +this.filtroMes > 0 &&
            +this.idTipoPrestacaoContas > 0 &&
              +this.filtroTipoDocumento.idNomeDocumento > 0 &&
                +this.filtroTipo > 0){
        const modalRef = this.ngbModal.open(ModalFLuxoCaixaComponent);
        modalRef.componentInstance.usuarioLogado = this.usuarioLogado;
        modalRef.componentInstance.idTipoPrestacaoContas = this.idTipoPrestacaoContas;
        modalRef.componentInstance.anoExercicio = this.filtroAno;
        modalRef.componentInstance.mesExercicio = this.filtroMes;
        modalRef.componentInstance.idNomeDocumento = this.filtroTipoDocumento !== null ? this.filtroTipoDocumento.idNomeDocumento : 0;
        modalRef.componentInstance.idTipo = this.filtroTipo;
        modalRef.componentInstance.locale = this.locale;
  
        modalRef.componentInstance.lstTipos = this.lstTipos;
        modalRef.componentInstance.lstFederacoes = this.lstFederacoes;
        modalRef.componentInstance.lstDocumentos = this.lstTipoDocumento;
      }else{
        this.alertService.exibirAlerta('Por favor, preencha todos os campos são obrigatórios', tipo.atencao);
      };
  }

  getIsPresidente(){
    return this.usuarioLogado.tipoUsuarioSigla == TipoUsuario.Presidente;
  }

  abrirModalSelecionado(documento: Documento) {      
        const modalRef = this.ngbModal.open(ModalFLuxoCaixaComponent);
        modalRef.componentInstance.usuarioLogado = this.usuarioLogado;
        modalRef.componentInstance.idTipoPrestacaoContas = this.idTipoPrestacaoContas;
        modalRef.componentInstance.anoExercicio = documento.ano;
        modalRef.componentInstance.mesExercicio = documento.mes;
        modalRef.componentInstance.idNomeDocumento = documento.idNomeDocumento;
        let tipo = this.lstTipos.filter((x)=>{
          if(x.nome.toLowerCase() === 'prestação de contas') {
            return x;
          };
        })[0];
        modalRef.componentInstance.idTipo = tipo.idIndicador.toString()
        documento.tipo = tipo.nome;
        modalRef.componentInstance.tipo = documento.tipo;
        modalRef.componentInstance.locale = this.locale;
        modalRef.componentInstance.idArquivo = documento.idArquivo;
        modalRef.componentInstance.idDocumento = documento.idDocumento;

        modalRef.componentInstance.lstTipos = this.lstTipos;
        modalRef.componentInstance.lstFederacoes = this.lstFederacoes;
        modalRef.componentInstance.lstDocumentos = this.lstTipoDocumento;
  }
}
