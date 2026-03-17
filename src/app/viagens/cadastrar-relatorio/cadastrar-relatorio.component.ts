import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { EditarRelatorioViagens, InserirRelatorioViagens, ListagemRelatorioViagens } from "src/app/shared/models/commands/cmdRelatorioViagens";
import { SolicitacaoDiariaCompletoPesquisa, SolicitacaoDiariaTrecho } from "src/app/shared/models/commands/cmdSolicitacaoDiaria";
import { EditarTextoHtml, InserirTextoHtml } from "src/app/shared/models/commands/cmdTextoHtml";
import { Usuario } from "src/app/shared/models/responses/sisprec-response";
import { ApiRelatorioViagensService } from "src/app/shared/services/api-relatorio-viagens.service";
import { ApiSolicitacaoDiaria } from "src/app/shared/services/api-solicitacao-diaria";
import { ApiTextoHtmlService } from "src/app/shared/services/api-texto-html.service";
import { ModalService } from "src/app/shared/services/modal.service";
import { StorageService } from "src/app/shared/services/storage.service";

@Component({
  selector: "app-viagens-cadastrar-relatorio",
  templateUrl: "./cadastrar-relatorio.component.html",
  styleUrls: ["./cadastrar-relatorio.component.scss"],
  standalone: false
})
export class ViagensCadastrarRelatorioComponent implements OnInit {
  public formCadastro: FormGroup;
  public submited: boolean = false;
  public editar: boolean = false;
  public carregando: boolean = false;
  usuario: Usuario;
  public observacoes = "";
  private dadosAnteriores: ListagemRelatorioViagens;
  private dadosSolicitacao: SolicitacaoDiariaCompletoPesquisa;
  public origem : SolicitacaoDiariaTrecho | null = null;
  public destino : SolicitacaoDiariaTrecho | null = null;
  public mostrarColaboradores: boolean = false;
  private ehCoordenador = false;

  constructor(
    private formBuilder: FormBuilder,
    private m: ModalService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private textoHtmlService : ApiTextoHtmlService,
    private relatorioViagensService : ApiRelatorioViagensService,
    private solicitacaoDiariaService : ApiSolicitacaoDiaria,
    private location: Location
  ){}

  hasText(control: AbstractControl): ValidationErrors | null {
    const html = control.value;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html || '';

    tempDiv.querySelectorAll('img, video, iframe, embed, object').forEach(el => el.remove());
    const text = tempDiv.textContent.trim() || '';

    return text ? null : { noText: true };
  }

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
    //verificar acesso e recuperar federação do usuário
    this.verificarAcesso();

    //inicializar formulario
    this.inicializarFormulario();

    //recuperar tipo de página
    this.recuperarTipoPagina();
  }

  verificarAcesso(){
    this.usuario = this.storageService.getUsuarioLogado();

    if(this.usuario.tipoUsuarioSigla !== "UsuarioTecnico") {
      if(this.usuario.tipoUsuarioSigla === "UsuarioFederacao"
        || this.usuario.tipoUsuarioSigla === "UsuarioDesenvolvedor"
      ){
        this.ehCoordenador = true;
      } else{
        alert("Você não tem acesso a essa página");
        this.router.navigate([""]);
      }
      
    }
  }

  recuperarTipoPagina() {
    if(this.route.snapshot.routeConfig.path.includes("cadastrar-relatorio")){
      this.editar = false;
      this.route.params.subscribe(param => {
        //recuperar dados
        this.recuperarSolicitacao(param.idSolicitacao);
      })
    } else {
      this.editar = true;
      //recuperar id
      this.route.params.subscribe(param => {
        //recuperar dados
        console.log(param.id);
        this.relatorioViagensService.recuperarRelatorioPorId(param.id).subscribe((v) => {
          this.dadosAnteriores = v;

          if(!["Retornada para Ajustes", "Não analisado", "Reanálise"].includes(this.dadosAnteriores.avaliacao)){
            this.bloquearPagina();
          }
          this.observacoes = v.observacoes;
          // this.formCadastro.controls.participacaoColaboradores.setValue(v.participacaoColaboradores);
          // this.formCadastro.controls.colaboradores.setValue(v.colaboradores);
          this.formCadastro.controls.informacoesAdicionais.setValue(v.informacoesAdicionais);
          
          this.textoHtmlService.recuperarHtml(v.idTextoHtml).subscribe((texto: string) => {
            this.formCadastro.controls.textoHtml.setValue(texto);
          });

          this.recuperarSolicitacao(v.idSolicitacaoDiaria);
        })
      }) 
    }
  }

  recuperarSolicitacao(idSolicitacao:string) {
    this.solicitacaoDiariaService.recuperarSolicitacaoPorId(idSolicitacao).subscribe((v) => {
      this.dadosSolicitacao = v;

      if(v.solicitacaoDiariaCompleto.idUsuarioViajante != this.usuario.idUsuario) {
        this.bloquearPagina();
      }

      this.getDatas();
    })
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      dataInicial: [{value: '', disabled: true}, [Validators.required]],
      dataFinal: [{value: '', disabled: true}, [Validators.required]],
      textoHtml: ['', [this.hasText]],
      termo: ['', [Validators.requiredTrue]],
      // participacaoColaboradores: ['', [Validators.required]],
      // colaboradores: [null],
      informacoesAdicionais: ['', [Validators.maxLength(500)]]
    },{
      validators: [this.validarData]
    });

    // this.formCadastro.controls.participacaoColaboradores.valueChanges.subscribe((v) => {
    //   if(v) {
    //     this.formCadastro.controls.colaboradores.setValidators([Validators.required, Validators.maxLength(500)]);
    //     this.formCadastro.controls.colaboradores.updateValueAndValidity();
    //     this.mostrarColaboradores = true;
    //   } else {
    //     this.formCadastro.controls.colaboradores.clearValidators();
    //     this.formCadastro.controls.colaboradores.setValue('');
    //     this.formCadastro.updateValueAndValidity();
    //     this.mostrarColaboradores = false;
    //   }
    // })
  }

  getDatas() {
    this.origem = this.dadosSolicitacao.solicitacaoDiariaTrecho.reduce((min, c) => c.dataInicio < min.dataInicio ? c : min);
    this.destino = this.dadosSolicitacao.solicitacaoDiariaTrecho.reduce((max, c) => c.dataInicio < max.dataInicio ? c : max);

    const dataInicial = (this.origem.dataInicio as string).split('T')[0];
    const dataFinal = (this.destino.dataFim as string).split('T')[0];

    this.formCadastro.controls.dataInicial.setValue(dataInicial);
    this.formCadastro.controls.dataFinal.setValue(dataFinal);

    //se a data final for maior que a data de hoje, não permitir a criação/alteração

    // const hoje = new Date().toISOString().split('T')[0];
    // if(dataFinal > hoje) {
    //   this.bloquearPagina();
    // }
  }

  get f() {
    return this.formCadastro.controls;
  }

  cadastrar() {
    this.submited = true;
    if(this.formCadastro.valid){
      this.m.confirm('Tem certeza que deseja enviar o relatório? Essa ação é irreversível.',
      'Confirmar envio', null, 'Confirmar', 'Cancelar').subscribe(x => {
        //envia formulário
        if (x) {
          this.carregando = true;
          if(this.editar)
            this.editarExistente();
          else
            this.criarNovo();
        }
      });
      
    }
  }

  criarNovo(){
    //salvar texto html
    const cmdEnvio : InserirTextoHtml = {
      textoHtml: this.formCadastro.controls['textoHtml'].value,
      idUsuario: this.usuario.idUsuario,
      email: this.usuario.email,
      assinadoTermo: this.formCadastro.controls['termo'].value
    }
    
    this.textoHtmlService.inserirHtml(cmdEnvio).subscribe(idTextoHtml=> {
      if(idTextoHtml !== null) {
        //sucesso
        //salva em relatório viagens agora
        const relatorioViagens: InserirRelatorioViagens = {
          idTextoHtml: idTextoHtml,
          idUsuarioCriacao: this.usuario.idUsuario,
          idFederacao: this.usuario.idFiliacao,
          dataInicio: this.formCadastro.controls.dataInicial.value,
          dataFim: this.formCadastro.controls.dataFinal.value,
          // participacaoColaboradores: this.formCadastro.controls.participacaoColaboradores.value,
          // colaboradores: this.formCadastro.controls.colaboradores.value,
          informacoesAdicionais: this.formCadastro.controls.informacoesAdicionais.value,
          idSolicitacaoDiaria: this.dadosSolicitacao.solicitacaoDiariaCompleto.idSolicitacaoDiaria
        }

        this.relatorioViagensService.inserirRelatorioViagens(relatorioViagens).subscribe((v) => {
          this.sucesso();
          this.carregando = false;
        }, (er) => {
          this.erro("Ocorreu um erro ao salvar relatório.");
          this.carregando = false;
        })

      } else{
        this.erro("Ocorreu um erro ao salvar texto.");
        this.carregando = false;
      }
    },(er) => {
      this.erro("Ocorreu um erro ao salvar texto.");
      this.carregando = false;
    });
  }

  editarExistente(){
    const cmdEnvio : EditarTextoHtml = {
      idTextoHtml: this.dadosAnteriores.idTextoHtml,
      textoHtml: this.formCadastro.controls['textoHtml'].value,
      idUsuario: this.usuario.idUsuario,
      email: this.usuario.email,
      assinadoTermo: this.formCadastro.controls['termo'].value
    }

    this.textoHtmlService.editarHtml(cmdEnvio).subscribe(idTextoHtml=> {
      if(idTextoHtml !== null) {
        //sucesso
        //edita em relatório viagens agora
        const relatorioViagens: EditarRelatorioViagens = {
          idTextoHtml: idTextoHtml,
          idRelatorioViagens: this.dadosAnteriores.idRelatorioViagens,
          idUsuarioAlteracao: this.usuario.idUsuario,
          idFederacao: this.dadosSolicitacao.solicitacaoDiariaCompleto.idFederacaoSolicitante,
          dataInicio: this.formCadastro.controls.dataInicial.value,
          dataFim: this.formCadastro.controls.dataFinal.value,
          // participacaoColaboradores: this.formCadastro.controls.participacaoColaboradores.value,
          // colaboradores: this.formCadastro.controls.colaboradores.value,
          informacoesAdicionais: this.formCadastro.controls.informacoesAdicionais.value,
          idSolicitacaoDiaria: this.dadosSolicitacao.solicitacaoDiariaCompleto.idSolicitacaoDiaria
        }

        console.log(relatorioViagens);

        this.relatorioViagensService.alterarRelatorioViagens(relatorioViagens).subscribe((v) => {
          this.sucesso();
          this.carregando = false;
        }, (er) => {
          this.erro("Ocorreu um erro ao salvar relatório.");
          this.carregando = false;
        })
      } else{
        this.erro("Ocorreu um erro ao salvar texto.");
        this.carregando = false;
      }
    },(er) => {
      this.erro("Ocorreu um erro ao salvar texto.");
      this.carregando = false;
    });
  }

  bloquearPagina() {
    this.aviso("Não é possível completar essa ação.");
    this.location.back();
  }

  cancelar() {
    //tem certeza que deseja cancelar?
    this.m.confirm('Tem certeza que deseja cancelar a ação?').subscribe(resultado => {
      if (!resultado) {
        return;
      }
      //voltar
      this.voltar();
    });
  }

  sucesso() {
    this.voltar();
    //abrir modal de sucesso
    this.m.alert("Relatório salvo e assinado com sucesso!","Sucesso","s");
  }

  erro(mensagem: string) {
    this.m.alert(mensagem,"Ocorreu um erro","e");
  }

  aviso(mensagem: string) {
    this.m.alert(mensagem,"Aviso","a");
  }

  voltar() {
    if(this.ehCoordenador)
      this.router.navigate(['/viagens/minhas-viagens']);
    else
      this.router.navigate(['/viagens/listar-cadastrar']);
  }
}