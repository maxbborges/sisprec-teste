import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from "src/environments/environment";
import { AnaliseSolicitacaoDiariaRequest, SolicitacaoDiariaCompletoPesquisa, SolicitacaoDiariaTrecho } from "../../models/commands/cmdSolicitacaoDiaria";
import { Indicador, Usuario } from "../../models/responses/sisprec-response";
import { ApiIndicadorService } from "../../services/api-indicador.service";
import { ApiSolicitacaoDiaria } from "../../services/api-solicitacao-diaria";
import { StorageService } from "../../services/storage.service";

@Component({
    templateUrl: './modal-analise-solicitacao.component.html',
    styleUrls: ['./modal-analise-solicitacao.component.scss'],
  standalone: false
})
  export class ModalAnaliseSolicitacaoComponent implements OnInit {
    @Input() public visualizacao: boolean = true;
    @Input() public idSolicitacao: string;

    public lstFichaAuxiliarLog: any;
    datePipe: any;
    public formAnalise: FormGroup;
    public indicadorAnalise: Array<Indicador> = [];
    public dados: SolicitacaoDiariaCompletoPesquisa;
    public indicadorAjustes: number;
    public showObservacoes = false;
    public usuario: Usuario;
    public origem : SolicitacaoDiariaTrecho | null = null;
    public destino : SolicitacaoDiariaTrecho | null = null;

    urlDownloadRelatorio = environment.urlApiSisprec + 'textoHtml/pdf/';
    public tituloDoc = "/relatorio-viagens";

    constructor(
        private ngbActiveModal: NgbActiveModal,
        private solicitacaoDiariaService : ApiSolicitacaoDiaria,
        private formBuilder: FormBuilder,
        private apiIndicadorService: ApiIndicadorService,
        private storageService: StorageService,
      ) { }

    ngOnInit(): void {
      this.recuperarIndicadorAnalise();
      this.iniciarFormulario();
      this.recuperarDados();
    }

    iniciarFormulario() {
      this.formAnalise = this.formBuilder.group({
        observacoes: [''],
        idAnalise: ['', Validators.required]
      });

      if(this.visualizacao) {
        this.formAnalise.disable();
      }

      this.formAnalise.controls.idAnalise.valueChanges.subscribe((v) => {
        this.atualizarObservacoes(v);
      })
    }

    atualizarObservacoes(valor: number) {
      if(this.indicadorAjustes == undefined)
        return;
      if(valor == this.indicadorAjustes){
        this.formAnalise.controls.observacoes.setValidators([Validators.required]);
        this.formAnalise.controls.observacoes.updateValueAndValidity();
        this.showObservacoes = true;
      } else {
        this.formAnalise.controls.observacoes.clearValidators();
        this.formAnalise.controls.observacoes.setValue('');
        this.formAnalise.controls.observacoes.updateValueAndValidity();
        this.showObservacoes = false;
      }
    }

    recuperarIndicadorAnalise() {
      this.apiIndicadorService
        .listarTodosIndicadoresPorTipoSigla("StatusSolicitacaoDiaria")
        .subscribe((x) => {
          this.indicadorAnalise = x.filter((v) => v.sigla !== "AguardandoAnaliseSolicitacao");
          this.indicadorAjustes = x.filter((v) => v.sigla == "RetornadaAjustesSolicitacao")[0].idIndicador;

          if(this.formAnalise != undefined)
            this.atualizarObservacoes(this.formAnalise.controls.idAnalise.value);
        });
    }

    recuperarDados() {
      this.usuario = this.storageService.getUsuarioLogado();
      this.solicitacaoDiariaService.recuperarSolicitacaoPorId(this.idSolicitacao).subscribe((v) => {
        this.dados = v;
        this.formAnalise.controls.idAnalise.setValue(v.analiseSolicitacao.idStatus);
        this.formAnalise.controls.observacoes.setValue(v.analiseSolicitacao.justificativa);
        this.getDatas();
      })
    }

    getDatas() {
      this.origem = this.dados.solicitacaoDiariaTrecho.reduce((min, c) => c.dataInicio < min.dataInicio ? c : min);
      this.destino = this.dados.solicitacaoDiariaTrecho.reduce((max, c) => c.dataInicio < max.dataInicio ? c : max);
    }

    close (){
      this.ngbActiveModal.dismiss();
    }

    salvar () {
      //verificar acesso
      if((this.usuario.tipoUsuarioSigla !== "UsuarioTecnico" && this.usuario.tipoUsuarioSigla !== "UsuarioPresidente") || this.usuario.idUsuario == this.dados.solicitacaoDiariaCompleto.idUsuarioSolicitante){
        alert("Você não tem acesso a essa funcionalidade");
        return;
      } else if(this.formAnalise.valid) {
        const dadosAnalise : AnaliseSolicitacaoDiariaRequest = {
          idSolicitacaoDiaria: this.dados.solicitacaoDiariaCompleto.idSolicitacaoDiaria,
          idStatus: this.formAnalise.controls.idAnalise.value,
          justificativa: this.formAnalise.controls.observacoes.value,
          idUsuarioAnalise: this.usuario.idUsuario,
          nomeUsuarioAnalise: this.usuario.nome,
        }
        
        this.solicitacaoDiariaService.cadastraAvaliacaoSolicitacao(dadosAnalise).subscribe((v) => {
          //depois de salvar, fechar modal
          this.ngbActiveModal.close("Sucesso");
        },(e) => {
          alert("Ocorreu um erro");
        })
      }
    }
  }