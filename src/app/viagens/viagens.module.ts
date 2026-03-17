import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ViagensCadastrarRelatorioComponent } from './cadastrar-relatorio/cadastrar-relatorio.component';
import { ViagensCadastrarSolicitacaoComponent } from './cadastrar-solicitacao/cadastrar-solicitacao.component';
import { TrechoViagemComponent } from './cadastrar-solicitacao/trecho/trecho.component';
import { ViagensListarCadastrarComponent } from './listar-cadastrar/listar-cadastrar.component';
import { ViagensListarRelatoriosCoordenadorComponent } from './listar-relatorios-coordenador/listar-relatorios-coordenador.component';
import { ArquivoRoutingModule } from './viagens-routing.module';
import { ViagensVisualizarHistoricoSolicitacaoComponent } from './visualizar-historico-solicitacao/visualizar-historico-solicitacao.component';
import { ViagensVisualizarHistoricoComponent } from './visualizar-historico/visualizar-historico.component';
import { ViagensVisualizarRelatorioComponent } from './visualizar-relatorio/visualizar-relatorio.component';
import { ViagensVisualizarSolicitacaoComponent } from './visualizar-solicitacao/visualizar-solicitacao.component';

@NgModule({
  declarations: [
    ViagensListarCadastrarComponent,
    ViagensCadastrarRelatorioComponent,
    ViagensVisualizarRelatorioComponent,
    ViagensListarRelatoriosCoordenadorComponent,
    ViagensVisualizarHistoricoComponent,
    ViagensCadastrarSolicitacaoComponent,
    TrechoViagemComponent,
    ViagensVisualizarSolicitacaoComponent,
    ViagensVisualizarHistoricoSolicitacaoComponent,
  ],
  imports: [
    ArquivoRoutingModule, 
    SharedModule, 
    RouterModule,
  ]
})
export class ViagensModule {}
