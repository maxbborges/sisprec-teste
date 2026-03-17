import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MotivoService } from 'src/app/services/motivo.service';
import { ListarDocumentoFiltrado } from 'src/app/shared/models/commands/cmdDocumento';
import { Documento, Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiDocumentoService } from 'src/app/shared/services/api-documento.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiTextoHtmlService } from 'src/app/shared/services/api-texto-html.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  template: `
    <div class="modal-body">
      <div class="mb-3">
        <div><strong>Número:</strong> {{ numero }} </div>
        <div><strong>Mês:</strong> {{ inputDocumento.mes }}</div>
        <div><strong>Ano:</strong> {{ inputDocumento.ano }}</div>
        <div><strong>Federação:</strong> {{ inputDocumento.siglaFederacao }} </div>
        <div><strong>Nome do Documento:</strong> {{ inputDocumento.nomeDocumento }} </div>
      </div>
      <a *ngIf="inputDocumento.idTextoHtml !== null" class="btn btn-outline-info btn-block btn-sm mb-3" routerLink="arquivo/documentos/relatorio-coordenador/visualizar/{{inputDocumento.idDocumento}}" target="_blank">Visualizar Relatório</a>
      <a *ngIf="inputDocumento.idTextoHtml !== null" class="btn btn-info btn-block btn-sm mb-3" [href]="urlDownloadRelatorio + inputDocumento.idTextoHtml + tituloDoc">Baixar Relatório</a>
      <a *ngIf="inputDocumento.idArquivo !== null" class="btn btn-info btn-block btn-sm mb-3" [href]="urlDownload + inputDocumento.idArquivo" download>Baixar Arquivo</a>
      <form [formGroup]="form">
        <div class="form-group">
          <label for="idAnalise">Análise</label>
          <div *ngFor="let analise of analises | async" class="custom-control custom-radio">
            <input (change)="verificarAnalise(analise.idIndicador)" type="radio"
             formControlName="idAnalise" [attr.id]="'idAnalise'+analise.sigla"
              [value]="analise.idIndicador" class="custom-control-input">
            <label class="custom-control-label" [attr.for]="'idAnalise'+analise.sigla">{{ analise.nome }}</label>
          </div>
      </div>
      <div class="form-group">
        <label for="idMotivo">Motivo</label>
        <select formControlName="idMotivo" class="form-control" id="idMotivo" (change)="alteraMotivoRetornoParaAjustes($any($event.target).value)">
          <option value="">Selecione</option>
          <option *ngFor="let motivo of motivos | async" [value]="motivo.idMotivo">{{ motivo.ordem + ' - ' + motivo.descricao }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="observacao">Observações:</label>
        <textarea formControlName="observacao" class="form-control" id="observacao" maxlength="255" (focusout)="alteraObservacaoRetornoParaAjustes($any($event.target).value)"></textarea>
      </div>
    </form>
    </div>
    <div class="modal-footer">
      <button (click)="cancelar()" type="button" class="btn btn-danger">Cancelar</button>
      <button [disabled]="form.disabled || acaoBloqueada" (click)="salvar()" type="button" class="btn btn-primary">Salvar</button>
    </div>
  `,
  standalone: false
})
export class ModalAnaliseDocumentoMotivoComponent implements OnInit {

  form: FormGroup;

  analises: Observable<Indicador[]>;
  motivos: Observable<any[]>;

  urlDownload = environment.urlApiSisprec + 'arquivo/porId/';
  urlDownloadRelatorio = environment.urlApiSisprec + 'textoHtml/pdf/';
  public tituloDoc = "/relatorio-coordenador";

  @Input() inputDocumento: Documento;
  @Input() numero: number;

  @Output() retorno = new EventEmitter<boolean>();

  usuario: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private ngbActiveModal: NgbActiveModal,
    private apiIndicadorService: ApiIndicadorService,
    private fb: FormBuilder,
    private apiDocumentoService: ApiDocumentoService,
    private storageService: StorageService,
    private motivoService: MotivoService,
    private _segurancaService: SegurancaCheckService,
    private apiTextoHtml: ApiTextoHtmlService,
    private router: Router
  ) { }

  ngOnInit() {

    this.usuario = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);

    this.analises = this.apiIndicadorService.listarTodosIndicadoresPorTipoId(1006).pipe(
      map(lista => lista.filter(item => item.sigla.includes('Presidente') == false))
    );
    // this.motivos = this.apiIndicadorService.listarTodosIndicadoresPorTipoId(1007);
    this.motivos = this.motivoService.obterTodos()
      .pipe(map(x => x.filter(y => y.ativo)));
    this.form = this.fb.group({
      idDocumento: this.inputDocumento.idDocumento,
      idAnalise: this.inputDocumento.idAnalise ? this.inputDocumento.idAnalise : 2012,
      idMotivo: this.inputDocumento.idMotivo ? this.inputDocumento.idMotivo : '',
      idPrestacaoContas: this.inputDocumento.idPrestacaoContas,
      idUsuarioCadastro: this.usuario.idUsuario,
      observacao: this.inputDocumento.observacao ? this.inputDocumento.observacao : ''
    });
    this.verificarAnalise(this.inputDocumento.idAnalise, true);
    this.ativarBotaoAnalisar(this.inputDocumento);
  }

  salvar() {

    console.log(this.form.value);

    this.apiDocumentoService
      .alterarDocumentoAnaliseMotivo(this.form.value)
      .subscribe(x => {
        this.retorno.emit(x);
        this.ngbActiveModal.close();
      },
        e => {
          console.log(e);

        });
  }

  cancelar() {
    this.ngbActiveModal.close();
  }

  verificarAnalise(idAnalise: number, isPrimeiraChamada = false) {
    if (idAnalise === 2014) {
      this.form.controls.idMotivo.enable();
      this.form.controls.observacao.enable();
    } else {
      //this.form.controls.idMotivo.setValue('');
      this.form.controls.idMotivo.disable();

      //this.form.controls.observacao.setValue('');
      this.form.controls.observacao.disable();
    }

    if (!isPrimeiraChamada) {
      this.apiDocumentoService.alterarAnalise(this.inputDocumento.idDocumento, idAnalise, this.usuario.idUsuario).subscribe(res => {
        if (!res) {
          console.error('Erro ao alterar análise.');
        }
      });
    }
  }

  alteraMotivoRetornoParaAjustes(idMotivo: number) {
    this.apiDocumentoService.alterarMotivoRetornoParaAjustes(this.inputDocumento.idDocumento, idMotivo, this.usuario.idUsuario).subscribe(res => {
      if (!res) {
        console.error('Erro ao alterar motivo.');
      }
    });
  }

  alteraObservacaoRetornoParaAjustes(observacao: string) {
    this.apiDocumentoService.alterarObservacaoRetornoParaAjustes(this.inputDocumento.idDocumento, observacao, this.usuario.idUsuario).subscribe(res => {
      if (!res) {
        console.error('Erro ao alterar observação.');
      }
    });
  }

  ativarBotaoAnalisar(documento: any) {

    const perfil = this.storageService.getUsuarioLogado().tipoUsuarioSigla;
    const status = documento.siglaStatusPrestacaoContas;

    if (
      status === 'EnviadaAnalise' ||
      status === 'Reanalise' ||
      (status === 'AprovadaConferenciaDocumentacao' && perfil === 'UsuarioGestorFiscal')
    ) {
      this.form.enable();
    } else {
      this.form.disable();
    }


  }

}

@Component({
  selector: 'app-analisar-documentacao',
  templateUrl: './analisar-documentacao.component.html',
  styleUrls: ['./analisar-documentacao.component.scss'],
  standalone: false
})
export class AnalisarDocumentacaoComponent implements OnInit {

  idFederacao: number;
  mesExercicio: number;
  anoExercicio: number;
  idPrestacaoContas: string;

  documentos: Documento[] = [];

  mesAnoExercicio: string;
  statusPrestacaoContas: string;

  modalIdDocumento: string;
  modalIdAnalise: number;
  modalIdMotivo: number;


  closeResult: string;
  constructor(
    private route: ActivatedRoute,
    private apiDocumentoService: ApiDocumentoService,
    private ngbModal: NgbModal,
    private location: Location,
  ) { }

  ngOnInit() {

    this.carregarDocumentos();
  }

  ordenarDocumentos(){
    //var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
    //this.documentos.sort(collator.compare);
    this.documentos.sort((docA, docB) => {
      return docA.nomeDocumento.localeCompare(docB.nomeDocumento, undefined, {
        numeric: true,
        sensitivity: 'base'
      })
    });
  }

  voltar(){
    this.location.back();
  }

  analisar(numero: number, documento: Documento) {
    console.log(documento);

    const inputModal = this.ngbModal.open(
      ModalAnaliseDocumentoMotivoComponent,
      { ariaLabelledBy: 'modal-analise-documento-motivo' }
    );
    inputModal.componentInstance.inputDocumento = documento;
    inputModal.componentInstance.numero = numero;

    inputModal.componentInstance.retorno.subscribe(x => {
      if (x) {
        this.carregarDocumentos();
      }
    });

  }

  carregarDocumentos() {

    this.idFederacao = parseInt(this.route.snapshot.params.idFederacao, 10);
    this.mesExercicio = parseInt(this.route.snapshot.params.mesExercicio, 10);
    this.anoExercicio = parseInt(this.route.snapshot.params.anoExercicio, 10);
    this.idPrestacaoContas = this.route.snapshot.params.idPrestacaoContas;

    const listarDocumentoFiltrado: ListarDocumentoFiltrado = {
      idFederacaoDono: this.idFederacao,
      mes: this.mesExercicio,
      ano: this.anoExercicio,
      idPrestacaoContas: this.idPrestacaoContas,
      idTipo: 0
    };

    this.apiDocumentoService.listarDocumentoFiltrado(listarDocumentoFiltrado).subscribe((data) => {

      if (data && data.length > 0) {
        this.mesAnoExercicio = `${data[0].mes}/${data[0].ano}`;
        this.statusPrestacaoContas = `${data[0].nomeStatusPrestacaoContas ? data[0].nomeStatusPrestacaoContas : 'Cadastrada'}`;
      }

      this.documentos = data;
      this.ordenarDocumentos();
    });
  }

}
