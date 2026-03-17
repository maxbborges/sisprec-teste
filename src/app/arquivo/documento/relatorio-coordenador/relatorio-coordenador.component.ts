import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlterarDocumento, InserirDocumento } from 'src/app/shared/models/commands/cmdDocumento';
import { EditarTextoHtml, InserirTextoHtml } from 'src/app/shared/models/commands/cmdTextoHtml';
import { Documento, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiDocumentoService } from 'src/app/shared/services/api-documento.service';
import { ApiTextoHtmlService } from 'src/app/shared/services/api-texto-html.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-relatorio-coordenador',
  templateUrl: './relatorio-coordenador.component.html',
  styleUrls: ['./relatorio-coordenador.component.scss'],
  standalone: false
})
export class RelatorioCoordenadorComponent implements OnInit {
  public mes:number = 0;
  public ano:number = 0;
  public idNomeDocumento:number;
  public idDocumento:string;
  public editar = false;
  public visualizar = false;
  private usuarioLogado : Usuario = null;
  private dadosAnteriores: Documento = null;

  //formulário
  public form: FormGroup;

  //variáveis da página
  public carregando = false;

  constructor(
    private route: ActivatedRoute, 
    private formBuilder: FormBuilder,
    private textoHtmlService : ApiTextoHtmlService,
    private storageService: StorageService,
    private documentoService:ApiDocumentoService,
    private _segurancaService: SegurancaCheckService,
    private router: Router,
    private m: ModalService
  ) {}

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.carregando = true;
    this.preecherDados();
    this.iniciarFormulario();
    this.verificarAcesso(true);
  }

  hasText(control: AbstractControl): ValidationErrors | null {
  const html = control.value;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html || '';

  tempDiv.querySelectorAll('img, video, iframe, embed, object').forEach(el => el.remove());
  const text = tempDiv.textContent.trim() || '';

  return text ? null : { noText: true };
}

  verificarAcesso(inicio = true){
    let mensagem = "Você não tem acesso a essa página.";

    //verificar o tipo do perfil
    if(!this.visualizar && this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado)){
      this.irParaInicio(mensagem);
      return;
    }
    
    if(this.editar) {
      if(this.dadosAnteriores !== null) {
        //verificar se o perfil condiz com a federação do documento
        if(this.usuarioLogado.idFiliacao != this.dadosAnteriores.idFederacao){
          this.irParaInicio(mensagem);
        }
        //verificar o idNomeDocumento, para ver se é do tipo 9° Relatório de Atividades Coordenador
        if(this.dadosAnteriores.nomeDocumento === null || !this.dadosAnteriores.nomeDocumento.includes("9º")){
          this.irParaInicio(mensagem);
        }
        //verificar se o documento foi retornado para ajustes
        if(this.acaoNaoValidade(this.dadosAnteriores)){
          this.irParaInicio(mensagem);
        }

        if(inicio){
          this.carregando = false;
        }
      }
    } else if (inicio){
      this.carregando = false;
    }
  }

  preecherDados() {
    if(this.route.snapshot.paramMap.get('idDocumento')){
      this.idDocumento = this.route.snapshot.paramMap.get('idDocumento');
      if(this.route.snapshot.routeConfig.path.includes("editar"))
        this.editar = true;
      else
        this.visualizar = true;
      this.recuperarDados();
    } else{
      this.ano = +this.route.snapshot.paramMap.get('ano');
      this.mes = +this.route.snapshot.paramMap.get('mes');
      this.idNomeDocumento = +this.route.snapshot.paramMap.get('idNomeDocumento');
    }
  }

  iniciarFormulario(){
    const values = (value: any) => {
      if(this.visualizar) {
        value = value === false? true : value;
        return {value: value, disabled: true}
      }
      else
        return value
    }
    this.form = this.formBuilder.group({
      textoHtml: [values(''), [Validators.required, this.hasText]],
      termo: [values(false), [Validators.required, Validators.requiredTrue]]
    });
  }

  acaoNaoValidade(documento: Documento) {
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

  //recupera dados para editá-los
  recuperarDados(){
    //recupera os dados
    this.documentoService.obterDocumentoByIdDocumento(this.idDocumento).subscribe((v) => {
      this.dadosAnteriores = v;
      this.verificarAcesso();
      this.mes = v.mes;
      this.ano = v.ano;
      //preenche o formulário
      this.textoHtmlService.recuperarHtml(v.idTextoHtml).subscribe(texto => {
        this.form.controls.textoHtml.setValue(texto);
      })
    });
  }

  //ação do formulário
  enviar() {
    this.carregando = true;
    if(!(this.form.valid && this.form.controls['termo'].value)){
      this.aviso();
      return;
    }

    this.verificarAcesso();
    this.carregando = true;
    //abrir modal de confirmação
    this.m.confirm('Tem certeza que deseja enviar o relatório? Essa ação é irreversível.',
    'Confirmar envio', null, 'Confirmar', 'Cancelar').subscribe(x => {
      if (x) {
        if(this.editar)
          this.editarExistente();
        else
          this.criarNovo();
      }
    });
  }

  //editar
  editarExistente() {
    const cmdEnvio : EditarTextoHtml = {
      idTextoHtml: this.dadosAnteriores.idTextoHtml,
      textoHtml: this.form.controls['textoHtml'].value,
      idUsuario: this.usuarioLogado.idUsuario,
      email: this.usuarioLogado.email,
      assinadoTermo: this.form.controls['termo'].value
    }

    this.textoHtmlService.editarHtml(cmdEnvio).subscribe(idTextoHtml=> {
      if(idTextoHtml !== null) {
        const documento: AlterarDocumento = {
          idDocumento: this.dadosAnteriores.idDocumento,
          idTextoHtml: idTextoHtml,
          idUsuarioAlteracao: this.usuarioLogado.idUsuario
        }
        
        this.documentoService.alterarDocumento(documento).subscribe(v=> {
          this.sucesso();
        },() => {
          this.erro("Ocorreu um erro ao salvar documento.");
        });
      } else{
        this.erro("Ocorreu um erro ao salvar texto.");
      }
    },(er) => {
      this.erro("Ocorreu um erro ao salvar texto.");
    });
  }

  //criar
  criarNovo() {
    const cmdEnvio : InserirTextoHtml = {
      textoHtml: this.form.controls['textoHtml'].value,
      idUsuario: this.usuarioLogado.idUsuario,
      email: this.usuarioLogado.email,
      assinadoTermo: this.form.controls['termo'].value
    }

    this.textoHtmlService.inserirHtml(cmdEnvio).subscribe(idTextoHtml=> {
      if(idTextoHtml !== null) {
        //sucesso
        //salva em documento agora
        const documento: InserirDocumento = {
          ano: this.ano,
          mes: this.mes,
          idNomeDocumento: this.idNomeDocumento,
          idTextoHtml: idTextoHtml,
          idUsuarioCadastro: this.usuarioLogado.idUsuario,
          idQuemSubiu: this.usuarioLogado.idUsuario,
          idFederacaoDono: this.usuarioLogado.idFiliacao
        }
        
        this.documentoService.inserirDocumento(documento).subscribe(v => {
          this.sucesso();
        }, (er) => {
          this.erro("Ocorreu um erro ao salvar documento.");
        })
      } else{
        this.erro("Ocorreu um erro ao salvar texto.");
      }
    },(er) => {
      this.erro("Ocorreu um erro ao salvar texto.");
    });
  }

  aviso(){
    this.carregando = false;
  }

  erro(mensagem:string){
    this.carregando = false;
    //abrir modal de erro ou aviso
    this.m.alert(mensagem,"Ocorreu um erro","e");
  }

  sucesso(){
    this.carregando = false;
    this.router.navigate(['arquivo/documentos/']);
    //abrir modal de sucesso
    this.m.alert("Relatório salvo e assinado com sucesso!","Sucesso","s");
  }

  irParaInicio(mensagem:string = null){
    //se tiver mensagem, abrir modal
    if(mensagem != null) {
      this.m.alert(mensagem ,"Aviso","a");
    }
    this.router.navigate(['']);
  }

  //elemento visual
  formatarMes(mes:number){
    return mes > 9 ? mes : "0" + mes;
  }

}
