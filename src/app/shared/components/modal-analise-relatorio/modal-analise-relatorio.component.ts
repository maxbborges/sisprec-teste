import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from "src/environments/environment";
import { AnalisarRelatorioViagens, ListagemRelatorioViagens } from "../../models/commands/cmdRelatorioViagens";
import { Indicador, Usuario } from "../../models/responses/sisprec-response";
import { ApiIndicadorService } from "../../services/api-indicador.service";
import { ApiRelatorioViagensService } from "../../services/api-relatorio-viagens.service";
import { StorageService } from "../../services/storage.service";

@Component({
    templateUrl: './modal-analise-relatorio.component.html',
    styleUrls: ['./modal-analise-relatorio.component.scss'],
  standalone: false
})
  export class ModalAnaliseRelatorioComponent implements OnInit {
    @Input() public visualizacao: boolean = true;
    @Input() public idRelatorio: string;

    public lstFichaAuxiliarLog: any;
    datePipe: any;
    public formAnalise: FormGroup;
    public indicadorAnalise: Array<Indicador> = [];
    public dados: ListagemRelatorioViagens;
    public indicadorAjustes: number;
    public showObservacoes = false;
    public usuario: Usuario;

    urlDownloadRelatorio = environment.urlApiSisprec + 'textoHtml/pdf/';
    public tituloDoc = "/relatorio-viagens";

    constructor(
        private ngbActiveModal: NgbActiveModal,
        private relatorioViagensService : ApiRelatorioViagensService,
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
        .listarTodosIndicadoresPorTipoSigla("StatusRelatorioViagens")
        .subscribe((x) => {
          const analises = ["AprovadoRelatorio","NaoAnalisadoRelatorio","ReanaliseRelatorio","RetornadaAjustesRelatorio"]
          this.indicadorAnalise = analises.map((sigla) => {
            return  x.filter((v) => v.sigla == sigla)[0];
          });
          this.indicadorAjustes = x.filter((v) => v.sigla == "RetornadaAjustesRelatorio")[0].idIndicador;

          this.atualizarAnalise();
          if(this.formAnalise != undefined)
            this.atualizarObservacoes(this.formAnalise.controls.idAnalise.value);
        });
    }

    recuperarDados() {
      this.usuario = this.storageService.getUsuarioLogado();
      this.relatorioViagensService.recuperarRelatorioPorId(this.idRelatorio).subscribe((v) => {
        this.dados = v;
        this.formAnalise.controls.idAnalise.setValue(v.idAvaliacao);
        this.formAnalise.controls.observacoes.setValue(v.observacoes);
        
        this.atualizarAnalise();

        if(!this.visualizacao) {
          this.atualizarObservacoes(v.idAvaliacao);
        }
      })
    }

    atualizarAnalise() {
      if(this.dados !== undefined && this.indicadorAnalise.length > 0){
        const tempAnalises : Array<Indicador> = this.indicadorAnalise.map((indic) => indic);
        const reanalise = tempAnalises.find((v) => {
          return v.sigla == "ReanaliseRelatorio";
        });

        if(reanalise !== null && reanalise.idIndicador == this.dados.idAvaliacao) {
          tempAnalises.forEach(v => {
            if(v.sigla === "NaoAnalisadoRelatorio"){
              v.idIndicador = reanalise.idIndicador
            }
          });

          this.indicadorAnalise = tempAnalises;
        }
      }
    }

    realizarDownload(idRelatorio: string) {
      this.relatorioViagensService.gerarPDF(idRelatorio);
    }

    close (){
      this.ngbActiveModal.dismiss();
    }

    salvar () {
      //verificar acesso
      if((this.usuario.tipoUsuarioSigla !== "UsuarioFederacao" && this.usuario.tipoUsuarioSigla !== "UsuarioPresidente") || this.usuario.idUsuario == this.dados.idUsuarioCriacao){
        alert("Você não tem acesso a essa funcionalidade");
        return;
      } else if(this.formAnalise.valid) {
        const dadosAnalise : AnalisarRelatorioViagens = {
          idRelatorioViagens: this.dados.idRelatorioViagens,
          idAvaliacao: this.formAnalise.controls.idAnalise.value,
          observacoes: this.formAnalise.controls.observacoes.value,
          idUsuarioAnalise: this.usuario.idUsuario
        }
        
        this.relatorioViagensService.analisarRelatorio(dadosAnalise).subscribe((v) => {
          //depois de salvar, fechar modal
          this.ngbActiveModal.close("Sucesso");
        },(e) => {
          alert("Ocorreu um erro");
        })
        
      }
    }
  }