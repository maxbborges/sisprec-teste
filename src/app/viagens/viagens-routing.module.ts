import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateInternoComponent } from '../shared/templates/template-interno/template-interno.component';
import { ViagensCadastrarRelatorioComponent } from './cadastrar-relatorio/cadastrar-relatorio.component';
import { ViagensCadastrarSolicitacaoComponent } from './cadastrar-solicitacao/cadastrar-solicitacao.component';
import { ViagensListarCadastrarComponent } from './listar-cadastrar/listar-cadastrar.component';
import { ViagensListarRelatoriosCoordenadorComponent } from './listar-relatorios-coordenador/listar-relatorios-coordenador.component';
import { ViagensVisualizarHistoricoSolicitacaoComponent } from './visualizar-historico-solicitacao/visualizar-historico-solicitacao.component';
import { ViagensVisualizarHistoricoComponent } from './visualizar-historico/visualizar-historico.component';
import { ViagensVisualizarRelatorioComponent } from './visualizar-relatorio/visualizar-relatorio.component';
import { ViagensVisualizarSolicitacaoComponent } from './visualizar-solicitacao/visualizar-solicitacao.component';

const routes: Routes = [
  {
    path: '',
    component: TemplateInternoComponent,
    children: [
      {
        path: "listar-cadastrar",
        component: ViagensListarCadastrarComponent,
      },
      {
        path: "listar-relatorios",
        component: ViagensListarRelatoriosCoordenadorComponent,
      },
      {
        path: "cadastrar-relatorio/:idSolicitacao",
        component: ViagensCadastrarRelatorioComponent,
      },
      {
        path: "editar-relatorio/:id",
        component: ViagensCadastrarRelatorioComponent,
      },
      {
        path: "visualizar-relatorio/:id",
        component: ViagensVisualizarRelatorioComponent,
      },
      {
        path: "historico-relatorio/:id",
        component: ViagensVisualizarHistoricoComponent,
      },
      {
        path: "historico-solicitacao/:id",
        component: ViagensVisualizarHistoricoSolicitacaoComponent,
      },
      {
        path: "solicitar-diaria/cadastrar",
        component: ViagensCadastrarSolicitacaoComponent,
      },
      {
        path: "solicitar-diaria/editar/:id",
        component: ViagensCadastrarSolicitacaoComponent,
      },
      {
        path: "solicitar-diaria/visualizar/:id",
        component: ViagensVisualizarSolicitacaoComponent,
      },
      {
        path: "minhas-viagens",
        component: ViagensListarCadastrarComponent,
      },
      {
        path: "solicitar-diaria/cadastrar-minha-solicitacao",
        component: ViagensCadastrarSolicitacaoComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArquivoRoutingModule { }
