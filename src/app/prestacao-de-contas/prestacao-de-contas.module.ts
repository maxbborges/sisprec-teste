import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessagesModule } from 'primeng/messages';
import { SharedModule } from '../shared/shared.module';
import { AnalisarContaCorrenteComponent } from './analisar-conta-corrente/analisar-conta-corrente.component';
import { AnalisarContaInvestimentoComponent } from './analisar-conta-investimento/analisar-conta-investimento.component';
import { AnalisarDespesasEReceitasComponent } from './analisar-despesas-e-receitas/analisar-despesas-e-receitas.component';
import {
  AnalisarDocumentacaoComponent,
  ModalAnaliseDocumentoMotivoComponent
} from './analisar-documentacao/analisar-documentacao.component';
import { AnalisarHistoricoFichaAuxiliarComponent } from './analisar-historico-ficha-auxiliar/analisar-historico-ficha-auxiliar.component';
import { AnalisarHistoricoComponent } from './analisar-historico/analisar-historico.component';
import { AnalisarPrestacaoDeContasComponent } from './analisar-prestacao-de-contas/analisar-prestacao-de-contas.component';
import { ModalAprovarPrestacaoDeContasComponent } from './analisar-prestacao-de-contas/modal-aprovar-prestacao-de-contas.component';
import {
  ModalRetornarParaAjustesPrestacaoDeContasComponent
} from './analisar-prestacao-de-contas/modal-retornar-para-ajustes-prestacao-de-contas.component';
import {
  ModalRetornarStatusPrestacaoDeContasComponent
} from './analisar-prestacao-de-contas/modal-retornar-status-prestacao-de-contas.component';
import { AprovarPrestacaoDeContasComponent } from './aprovar-prestacao-de-contas/aprovar-prestacao-de-contas.component';
import { ListarContaCorrenteComponent } from './listar-conta-corrente/listar-conta-corrente.component';
import { ListarContaInvestimentoComponent } from './listar-conta-investimento/listar-conta-investimento.component';
import { ListarDespesasEReceitasComponent } from './listar-despesas-e-receitas/listar-despesas-e-receitas.component';
import { ListarDocumentacaoComponent } from './listar-documentacao/listar-documentacao.component';
import { ListarHistoricoComponent } from './listar-historico/listar-historico.component';
import { ListarPrestacaoDeContasComponent } from './listar-prestacao-de-contas/listar-prestacao-de-contas.component';
import { PesquisarPrestacaoContasComponent } from './pesquisar-prestacao-contas/pesquisar-prestacao-contas.component';
import { PrestacaoDeContasRoutingModule } from './prestacao-de-contas-routing.module';

@NgModule({
  declarations: [
    AnalisarPrestacaoDeContasComponent,
    AnalisarContaCorrenteComponent,
    AnalisarDespesasEReceitasComponent,
    AnalisarContaInvestimentoComponent,
    AnalisarDocumentacaoComponent,
    AnalisarHistoricoComponent,
    ListarPrestacaoDeContasComponent,
    ListarContaCorrenteComponent,
    ListarDespesasEReceitasComponent,
    ListarContaInvestimentoComponent,
    ListarDocumentacaoComponent,
    ListarHistoricoComponent,
    ModalAnaliseDocumentoMotivoComponent,
    ModalAprovarPrestacaoDeContasComponent,
    ModalRetornarParaAjustesPrestacaoDeContasComponent,
    AprovarPrestacaoDeContasComponent,
    ModalRetornarStatusPrestacaoDeContasComponent,
    PesquisarPrestacaoContasComponent,
    AnalisarHistoricoFichaAuxiliarComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CheckboxModule,
    ConfirmDialogModule,
    MessagesModule,
    PrestacaoDeContasRoutingModule,
    NgMultiSelectDropDownModule.forRoot()
  ],


})
export class PrestacaoDeContasModule { }
