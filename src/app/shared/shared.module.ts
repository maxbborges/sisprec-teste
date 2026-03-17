import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ModalTrocarPerfilComponent } from './templates/menu-superior/modal-trocar-perfil.component';

// PrimeNG
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';


// Ng-Bootstrap
import { NgbAccordionModule, NgbAlertModule, NgbCarouselModule, NgbCollapseModule, NgbDatepickerModule, NgbDropdownModule, NgbModalModule, NgbNavModule, NgbOffcanvasModule, NgbPaginationModule, NgbPopoverModule, NgbProgressbarModule, NgbRatingModule, NgbScrollSpyModule, NgbTimepickerModule, NgbToastModule, NgbTooltipModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

// NgxCurrency
import { NgxCurrencyConfig, NgxCurrencyDirective, provideEnvironmentNgxCurrency } from 'ngx-currency';
export const customCurrencyMaskConfig: NgxCurrencyConfig = {
  align: 'right',
  allowNegative: false,
  allowZero: false,
  decimal: ',',
  precision: 2,
  prefix: '',
  suffix: '',
  thousands: '.',
  nullable: false
};

// NgxMask
import { NgxMaskConfig, NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
export const optionsNgxMask: Partial<NgxMaskConfig> | (() => Partial<NgxMaskConfig>) = {
  clearIfNotMatch: true
};

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from './components/alert/alert.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { ConfirmacaoComponent } from './components/confirmacao/confirmacao.component';
import { ModalAnaliseRelatorioComponent } from './components/modal-analise-relatorio/modal-analise-relatorio.component';
import { ModalAnaliseSolicitacaoComponent } from './components/modal-analise-solicitacao/modal-analise-solicitacao.component';
import { ModalCadastroFornecedorComponent } from './components/modal-cadastro-fornecedor/modal-cadastro-fornecedor.component';
import { ModalFichaAuxiliarHistoricoComponent } from './components/modal-ficha-auxiliar-historico/modal-ficha-auxiliar-historico.component';
import { ModalFichaAuxiliarComponent } from './components/modal-ficha-auxiliar/modal-ficha-auxiliar.component';
import { ModalFLuxoCaixaComponent } from './components/modal-fluxo-caixa/modal-fluxo-caixa.component';
import { RichTextComponent } from './components/rich-text/rich-text.component';
import { ToastComponent } from './components/toast/toast.component';
import { ExibirEsconderSenhaDirective } from './directives/exibir-esconder-senha.directive';
import { ModalPesquisaFornecedorComponent } from './pesquisa-fornecedor/modal-pesquisa-fornecedor.component';
import { ModalPesquisaRelatorioViagensComponent } from './pesquisa-relatorio-viagens/modal-pesquisa-relatorio-viagens.component';
import { AlertService } from './services/alert.service';
import { ModalService } from './services/modal.service';
import { AlertaAtencaoComponent } from './templates/alerta-atencao/alerta-atencao.component';
import { AlertaErroComponent } from './templates/alerta-erro/alerta-erro.component';
import { AlertaSucessoComponent } from './templates/alerta-sucesso/alerta-sucesso.component';
import { BarraEspacamentoComponent } from './templates/barra-espacamento/barra-espacamento.component';
import { BotaoVoltarComponent } from './templates/botao-voltar/botao-voltar.component';
import { DebuggerComponent } from './templates/debugger/debugger.component';
import { DownloadArquivoComponent } from './templates/download-arquivo/download-arquivo.component';
import { FichaAuxiliarHistoricoComponent } from './templates/ficha-auxiliar-historico/ficha-auxiliar-historico.component';
import { FichaAuxiliarComponent } from './templates/ficha-auxiliar/ficha-auxiliar.component';
import { LoadingDivComponent } from './templates/loading-div/loading-div.component';
import { MenuSuperiorComponent } from './templates/menu-superior/menu-superior.component';
import { RodapeComponent } from './templates/rodape/rodape.component';
import { TemplateExternoComponent } from './templates/template-externo/template-externo.component';
import { TemplateInternoComponent } from './templates/template-interno/template-interno.component';
import { UploadArquivoComponent } from './templates/upload-arquivo/upload-arquivo.component';
import { VerificarCapsLockAtivoComponent } from './templates/verificar-caps-lock-ativo/verificar-caps-lock-ativo.component';

@NgModule({
  declarations: [
    TemplateInternoComponent,
    TemplateExternoComponent,
    RodapeComponent,
    DebuggerComponent,
    MenuSuperiorComponent,
    LoadingDivComponent,
    AlertaAtencaoComponent,
    AlertaErroComponent,
    AlertaSucessoComponent,
    BarraEspacamentoComponent,
    ExibirEsconderSenhaDirective,
    VerificarCapsLockAtivoComponent,
    BotaoVoltarComponent,
    UploadArquivoComponent,
    AlertComponent,
    ConfirmComponent,
    ModalTrocarPerfilComponent,
    ConfirmacaoComponent,
    DownloadArquivoComponent,
    ModalPesquisaFornecedorComponent,
    FichaAuxiliarComponent,
    ModalFichaAuxiliarComponent,
    ModalAnaliseRelatorioComponent,
    ModalAnaliseSolicitacaoComponent,
    FichaAuxiliarHistoricoComponent,
    ModalFichaAuxiliarHistoricoComponent,
    RichTextComponent,
    ModalCadastroFornecedorComponent,
    ToastComponent,
    ModalPesquisaRelatorioViagensComponent,
    ModalFLuxoCaixaComponent
  ],
  exports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbAccordionModule, NgbAlertModule, NgbCarouselModule, NgbCollapseModule, NgbDatepickerModule, NgbDropdownModule, NgbModalModule, NgbNavModule, NgbOffcanvasModule, NgbPaginationModule, NgbPopoverModule, NgbProgressbarModule, NgbRatingModule, NgbScrollSpyModule, NgbTimepickerModule, NgbToastModule, NgbTooltipModule, NgbTypeaheadModule,
    NgxCurrencyDirective,
    NgxMaskDirective,
    NgxMaskPipe,
    FileUploadModule,
    TemplateInternoComponent,
    TemplateExternoComponent,
    RodapeComponent,
    DebuggerComponent,
    MenuSuperiorComponent,
    LoadingDivComponent,
    AlertaAtencaoComponent,
    AlertaErroComponent,
    AlertaSucessoComponent,
    BarraEspacamentoComponent,
    ExibirEsconderSenhaDirective,
    BotaoVoltarComponent,
    UploadArquivoComponent,
    TableModule,
    SelectModule,
    ModalTrocarPerfilComponent,
    DownloadArquivoComponent,
    FichaAuxiliarComponent,
    ModalFichaAuxiliarComponent,
    ModalAnaliseRelatorioComponent,
    ModalAnaliseSolicitacaoComponent,
    FichaAuxiliarHistoricoComponent,
    ModalFichaAuxiliarHistoricoComponent,
    RichTextComponent,
    ToastComponent,
    ModalFLuxoCaixaComponent
  ],
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    FileUploadModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgxCurrencyDirective,
    NgbAccordionModule, NgbAlertModule, NgbCarouselModule, NgbCollapseModule, NgbDatepickerModule, NgbDropdownModule, NgbModalModule, NgbNavModule, NgbOffcanvasModule, NgbPaginationModule, NgbPopoverModule, NgbProgressbarModule, NgbRatingModule, NgbScrollSpyModule, NgbTimepickerModule, NgbToastModule, NgbTooltipModule, NgbTypeaheadModule,
    ReactiveFormsModule
  ],
  providers: [
    ModalService,
    AlertService,
    provideEnvironmentNgxCurrency(customCurrencyMaskConfig),
    provideNgxMask(optionsNgxMask)
  ]
})
export class SharedModule { }
