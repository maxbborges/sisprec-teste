import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbDropdown, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { BuscarPrestacaoContas, Indicador, PrestacaoContas, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiArquivoService } from 'src/app/shared/services/api-arquivo.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ModalAprovarPrestacaoDeContasComponent } from './modal-aprovar-prestacao-de-contas.component';
import { ModalRetornarParaAjustesPrestacaoDeContasComponent } from './modal-retornar-para-ajustes-prestacao-de-contas.component';
import { ModalRetornarStatusPrestacaoDeContasComponent } from './modal-retornar-status-prestacao-de-contas.component';

@Component({
  selector: 'app-analisar-prestacao-de-contas',
  templateUrl: './analisar-prestacao-de-contas.component.html',
  styleUrls: ['./analisar-prestacao-de-contas.component.scss'],
  providers: [
    NgbDropdown
  ],
  standalone: false
})
export class AnalisarPrestacaoDeContasComponent implements OnInit {

  public listPrestacoesContas: PrestacaoContas[] = [];
  form: FormGroup;

  statusPrestacaoContas: Observable<Indicador[]>;
  federacoes: Observable<Indicador[]>;

  public load = false;
  acaoBloqueada: boolean = false;
  usuario: Usuario;

  constructor(
    private apiIndicadorService: ApiIndicadorService,
    private fb: FormBuilder,
    private prestacaoContas: ApiPrestacaoContasService,
    private ngbModal: NgbModal,
    private storageService: StorageService,
    private arquivoService: ApiArquivoService,
    private location: Location,
    private route: ActivatedRoute,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit() {
    this.usuario = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);
    this.statusPrestacaoContas = this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('StatusPrestacaoContas');
    this.federacoes = this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('Federacao');
    this.form = this.fb.group({
      anoExercicio: '',
      mesExercicio: '',
      idStatusAtualPrestacaoContas: '',
      versao: '',
      idFederacao: '',
    });
    this.obterFiltro();
  }

  obterFiltro(){

    this.route.queryParams
      .subscribe(params => {
        if(JSON.stringify(params) !== '{}'){
          this.form.controls['anoExercicio'].setValue(params.ano);
          this.form.controls['mesExercicio'].setValue(params.mes);
          this.form.controls['idStatusAtualPrestacaoContas'].setValue(params.status);
          this.form.controls['versao'].setValue(params.versao);
          this.form.controls['idFederacao'].setValue(params.federacao);

          this.pesquisar();
        }
    });
  }

  pesquisar() {
    this.load = true;
    const buscarPrestacaoContas: BuscarPrestacaoContas = this.form.value;
    const filtro: string = 'ano=' + buscarPrestacaoContas.anoExercicio + '&' + 'mes=' + buscarPrestacaoContas.mesExercicio + '&' + 'status=' + buscarPrestacaoContas.idStatusAtualPrestacaoContas + '&' +  'versao=' + buscarPrestacaoContas.versao + '&' + 'federacao=' + this.form.value.idFederacao;
    this.location.go('/prestacaoDeContas/analisar/', filtro);
    this.prestacaoContas.buscarTodosPrestacoesContasPorV2(buscarPrestacaoContas).subscribe((data) => {
      // this.listPrestacoesContas = data;

      this.listPrestacoesContas = data.filter((item) => {
        return item.idPrestacaoContas != null;
      });
      this.load = false;
    });
  }

  aprovar(prestacaoContas: PrestacaoContas) {

    this.prestacaoContas.buscarQuantidadePrestacoesDeContasPendentes(prestacaoContas.idPrestacaoContas).subscribe((data) => {

      const inputModal = this.ngbModal.open(
        ModalAprovarPrestacaoDeContasComponent,
        { ariaLabelledBy: 'modal-aprovar-prestacao-de-contas' }
      );
      inputModal.componentInstance.prestacaoContas = prestacaoContas;

      if (data !== 0) {
        inputModal.componentInstance.msgRetorno = 'Existem lançamentos não analisados';
      } else {
        inputModal.componentInstance.msgRetorno = '';
      }

      inputModal.componentInstance.retorno.subscribe(x => {
        if (x) {
          this.pesquisar();
        }
      });
    });
  }

  retornarParaAjustes(prestacaoContas: PrestacaoContas) {

    const inputModal = this.ngbModal.open(
      ModalRetornarParaAjustesPrestacaoDeContasComponent,
      { ariaLabelledBy: 'modal-retornar-para-ajustes-prestacao-de-contas' }
    );
    inputModal.componentInstance.prestacaoContas = prestacaoContas;

    inputModal.componentInstance.retorno.subscribe(x => {
      if (x) {
        this.pesquisar();
      }
    });

  }

  ativarBotaoAprovar(prestacaoContas: PrestacaoContas): boolean {

    const perfil = this.storageService.getUsuarioLogado().tipoUsuarioSigla;
    const status = prestacaoContas.siglaStatusPrestacaoContas;
    const disponivelBotaoAprovar = prestacaoContas.disponivelBotaoAprovar;
    const contaCorrenteContaInvestimentoPositiva = prestacaoContas.contaCorrenteContaInvestimentoPositiva;

    if (
      (
        (status === 'EnviadaAnalise' && perfil === 'UsuarioConferenciaDoc')
        ||
        (status === 'Reanalise' && perfil === 'UsuarioConferenciaDoc')
        ||
        (status === 'AprovadaConferenciaDocumentacao' && perfil === 'UsuarioGestorFiscal')
      )
      &&
      disponivelBotaoAprovar
      &&
      contaCorrenteContaInvestimentoPositiva
    ) {
      return false;
    }
    return true;

  }

  ativarBotaoRetornarParaAjustes(prestacaoContas: PrestacaoContas): boolean {

    const perfil = this.storageService.getUsuarioLogado().tipoUsuarioSigla;
    const status = prestacaoContas.siglaStatusPrestacaoContas;
    const disponivelBotaoRetornarParaAjustes = prestacaoContas.disponivelBotaoRetornarParaAjustes;

    if (
      (
        status === 'EnviadaAnalise' ||
        status === 'Reanalise' ||
        (status === 'AprovadaConferenciaDocumentacao' && perfil === 'UsuarioGestorFiscal')
      ) && disponivelBotaoRetornarParaAjustes
    ) {
      return false;
    }
    return true;
  }

  ativarBotaoVoltarStatusPC(prestacaoContas: PrestacaoContas): boolean {
    const perfil = this.storageService.getUsuarioLogado().tipoUsuarioSigla;
    const status = prestacaoContas.siglaStatusPrestacaoContas;

    if (perfil === 'UsuarioConferenciaDoc' && status === 'AprovadaConferenciaDocumentacao') {
      return false;
    }

    if (perfil === 'UsuarioGestorFiscal' && status === 'AprovadaGestorFiscal') {
      return false;
    }

    return true;
  }

  retornarStatus(prestacaoContas) {

    const inputModal = this.ngbModal.open(
      ModalRetornarStatusPrestacaoDeContasComponent,
      { ariaLabelledBy: 'modal-retornar-status-prestacao-de-contas' }
    );
    inputModal.componentInstance.prestacaoContas = prestacaoContas;

    inputModal.componentInstance.retorno.subscribe(x => {
      if (x) {
        this.pesquisar();
      }
    });

  }

}
