// tslint:disable: max-line-length
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { CadastrarRelatorioVisitaTecnicaComponent } from './relatorio-visita-tecnica/cadastrar-relatorio-visita-tecnica/cadastrar-relatorio-visita-tecnica.component';
import { EditarRelatorioVisitaTecnicaComponent } from './relatorio-visita-tecnica/editar-relatorio-visita-tecnica/editar-relatorio-visita-tecnica.component';
import { VisualizarRelatoriosVisitaTecnicaComponent } from './relatorio-visita-tecnica/visualizar-relatorios-visita-tecnica/visualizar-relatorios-visita-tecnica.component';
import { VisitaTecnicaRoutingModule } from './visita-tecnica-routing.module';

@NgModule({
  declarations: [
    VisualizarRelatoriosVisitaTecnicaComponent,
    CadastrarRelatorioVisitaTecnicaComponent,
    EditarRelatorioVisitaTecnicaComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    VisitaTecnicaRoutingModule
  ]
})
export class VisitaTecnicaModule {}
