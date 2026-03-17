import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TemplateInternoComponent } from '../shared/templates/template-interno/template-interno.component';

import { AnalisarContaCorrenteComponent } from './analisar-conta-corrente/analisar-conta-corrente.component';
import { AnalisarContaInvestimentoComponent } from './analisar-conta-investimento/analisar-conta-investimento.component';
import { AnalisarDespesasEReceitasComponent } from './analisar-despesas-e-receitas/analisar-despesas-e-receitas.component';
import { AnalisarDocumentacaoComponent } from './analisar-documentacao/analisar-documentacao.component';
import { AnalisarHistoricoComponent } from './analisar-historico/analisar-historico.component';
import { AnalisarPrestacaoDeContasComponent } from './analisar-prestacao-de-contas/analisar-prestacao-de-contas.component';

import { ListarContaCorrenteComponent } from './listar-conta-corrente/listar-conta-corrente.component';
import { ListarContaInvestimentoComponent } from './listar-conta-investimento/listar-conta-investimento.component';
import { ListarDespesasEReceitasComponent } from './listar-despesas-e-receitas/listar-despesas-e-receitas.component';
import { ListarDocumentacaoComponent } from './listar-documentacao/listar-documentacao.component';
import { ListarHistoricoComponent } from './listar-historico/listar-historico.component';
import { ListarPrestacaoDeContasComponent } from './listar-prestacao-de-contas/listar-prestacao-de-contas.component';

import { AnalisarHistoricoFichaAuxiliarComponent } from './analisar-historico-ficha-auxiliar/analisar-historico-ficha-auxiliar.component';
import { PesquisarPrestacaoContasComponent } from './pesquisar-prestacao-contas/pesquisar-prestacao-contas.component';

const routes: Routes = [
  {
    path: '',
    component: TemplateInternoComponent,
    children: [
      { path: 'analisar', component: AnalisarPrestacaoDeContasComponent },
      { path: 'analisar/:filtro',
      component: AnalisarPrestacaoDeContasComponent
      },
      {
        path: 'analisar/contaCorrente/:idFederacao/:mesExercicio/:anoExercicio/:idPrestacaoContas',
        component: AnalisarContaCorrenteComponent
      },
      {
        path: 'analisar/despesasEReceitas/:idLancamento',
        component: AnalisarDespesasEReceitasComponent
      },
      {
        path: 'analisar/contaInvestimento/:idFederacao/:mesExercicio/:anoExercicio/:idPrestacaoContas',
        component: AnalisarContaInvestimentoComponent
      },
      {
        path: 'analisar/documentacao/:idFederacao/:mesExercicio/:anoExercicio/:idPrestacaoContas', component: AnalisarDocumentacaoComponent
      },
      {
        path: 'analisar/historico/:idFederacao/:mesExercicio/:anoExercicio/:idPrestacaoContas',
        component: AnalisarHistoricoComponent
      },
      { path: 'listar', component: ListarPrestacaoDeContasComponent },
      { path: 'listar/:filtro', component: ListarPrestacaoDeContasComponent },
      { path: 'listar/contaCorrente/:idFederacao/:mes/:ano/:tipoconta/:status', component: ListarContaCorrenteComponent },
      { path: 'listar/despesasEReceitas/:id', component: ListarDespesasEReceitasComponent },
      { path: 'listar/contaInvestimento/:idFederacao/:mes/:ano/:tipoconta/:status', component: ListarContaInvestimentoComponent },
      { path: 'listar/documentacao/:idFederacao/:mes/:ano/:id', component: ListarDocumentacaoComponent },
      { path: 'listar/historico/:mes/:ano', component: ListarHistoricoComponent },
      // Pesquisar
      { path: 'pesquisar', component: PesquisarPrestacaoContasComponent },
      { path: 'pesquisar/contaCorrente/:idFederacao/:mes/:ano/:tipoconta/:status', component: ListarContaCorrenteComponent },
      { path: 'pesquisar/despesasEReceitas/:id', component: ListarDespesasEReceitasComponent },
      { path: 'pesquisar/contaInvestimento/:idFederacao/:mes/:ano/:tipoconta/:status', component: ListarContaInvestimentoComponent },
      { path: 'pesquisar/documentacao/:idFederacao/:mes/:ano/:id', component: ListarDocumentacaoComponent },
      { path: 'pesquisar/historico/:mes/:ano', component: ListarHistoricoComponent },
      {
        path: 'pesquisar/historico/:idFederacao/:mesExercicio/:anoExercicio/:idPrestacaoContas',
        component: AnalisarHistoricoComponent
      },
      {
        path: 'pesquisar/:tipoLancamento/:idFederacao/:mes/:ano/:idLancamento/fichaAuxiliar/:idDocumento',
        component: AnalisarHistoricoFichaAuxiliarComponent
      },
      {
        path: 'pesquisar/:tipoLancamento/:idFederacao/:mes/:ano/:tipoconta/:status/fichaAuxiliar/:idLancamento',
        component: AnalisarHistoricoFichaAuxiliarComponent
      },
      { //federacao
        path: 'listar/:tipoLancamento/:idFederacao/:mes/:ano/:tipoconta/:status/fichaAuxiliar/:idLancamento',
        component: AnalisarHistoricoFichaAuxiliarComponent
      },
      { //federacao
        path: 'listar/:tipoLancamento/:idFederacao/:mes/:ano/:idLancamento/fichaAuxiliar/:idDocumento',
        component: AnalisarHistoricoFichaAuxiliarComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrestacaoDeContasRoutingModule { }
