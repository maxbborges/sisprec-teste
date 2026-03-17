import { Location } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Usuario } from "src/app/shared/models/responses/sisprec-response";
import { ApiRelatorioViagensService } from "src/app/shared/services/api-relatorio-viagens.service";
import { ApiSolicitacaoDiaria } from "src/app/shared/services/api-solicitacao-diaria";
import { ApiTextoHtmlService } from "src/app/shared/services/api-texto-html.service";
import { StorageService } from "src/app/shared/services/storage.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-viagens-cadastrar-relatorio",
  templateUrl: "./visualizar-relatorio.component.html",
  styleUrls: ["./visualizar-relatorio.component.scss"],
  standalone: false
})
export class ViagensVisualizarRelatorioComponent implements OnInit {
  public formCadastro: FormGroup;
  public submited: boolean = false;
  public editar: boolean = false;
  usuario: Usuario;
  public idTextoHtml: string;
  public mostrarColaboradores = false;
  public status = "";
  public idRelatorio = "";

  urlDownloadRelatorio = environment.urlApiSisprec + 'textoHtml/pdf/';
  public tituloDoc = "/relatorio-viagens";

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private textoHtmlService : ApiTextoHtmlService,
    private relatorioViagensService : ApiRelatorioViagensService,
    private solicitacaoDiariaService: ApiSolicitacaoDiaria,
    private location: Location
  ){}

  ngOnInit(): void {
    //verificar acesso e recuperar federação do usuário
    this.verificarAcesso();

    //inicializar formulario
    this.inicializarFormulario();

    //recuperar tipo de página
    this.recuperarDados();
  }

  verificarAcesso(){
    this.usuario = this.storageService.getUsuarioLogado();
  }

  recuperarDados() {
    //recuperar id
    this.route.params.subscribe(param => {
      //recuperar dados
      console.log(param.id);
      this.idRelatorio = param.id;
      this.relatorioViagensService.recuperarRelatorioPorId(param.id).subscribe((v) => {
        // this.formCadastro.controls.participacaoColaboradores.setValue(v.participacaoColaboradores);
        // this.formCadastro.controls.colaboradores.setValue(v.colaboradores);
        this.formCadastro.controls.informacoesAdicionais.setValue(v.informacoesAdicionais);
        this.idTextoHtml = v.idTextoHtml;
        this.textoHtmlService.recuperarHtml(v.idTextoHtml).subscribe((texto: string) => {
          this.formCadastro.controls.textoHtml.setValue(texto);
        });
        this.recuperarSolicitacao(v.idSolicitacaoDiaria);
      })
    });
  }

  inicializarFormulario() {
    const values = {value: '', disabled: true}

    this.formCadastro = this.formBuilder.group({
      dataInicial: [values],
      dataFinal: [values],
      textoHtml: [values],
      termo: [{value: true, disabled: true}, [Validators.requiredTrue]],
      // participacaoColaboradores: [values],
      // colaboradores: [values],
      informacoesAdicionais: [values]
    });

    // this.formCadastro.controls.participacaoColaboradores.valueChanges.subscribe((v) => {
    //   if(v) {
    //     this.mostrarColaboradores = true;
    //   } else {
    //     this.mostrarColaboradores = false;
    //   }
    // })
  }

  recuperarSolicitacao(idSolicitacao:string) {
    this.solicitacaoDiariaService.recuperarSolicitacaoPorId(idSolicitacao).subscribe((v) => {
      const origem = v.solicitacaoDiariaTrecho.reduce((min, c) => c.dataInicio < min.dataInicio ? c : min);
      const destino = v.solicitacaoDiariaTrecho.reduce((max, c) => c.dataInicio < max.dataInicio ? c : max);

      const dataInicial = (origem.dataInicio as string).split('T')[0];
      const dataFinal = (destino.dataFim as string).split('T')[0];

      this.formCadastro.controls.dataInicial.setValue(dataInicial);
      this.formCadastro.controls.dataFinal.setValue(dataFinal);
      this.status = v.relatorioCompleto.avaliacao;
    })
  }

  get f() {
    return this.formCadastro.controls;
  }

  realizarDownload(idRelatorio: string) {
    this.relatorioViagensService.gerarPDF(idRelatorio);
  }

  cancelar() {
    this.location.back();
  }

}