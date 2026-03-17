// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Shared
import { SharedModule } from '../shared/shared.module';

// Pages Routing
import { PagesRoutingModule } from './pages-routing.module';

// Pages
import {
  IndicadoresCadastroPage,
  IndicadoresEdicaoPage,
  IndicadoresListaPage
} from './indicadores';

@NgModule({
  declarations: [
    // Indicadores
    IndicadoresCadastroPage,
    IndicadoresEdicaoPage,
    IndicadoresListaPage
  ],
  imports: [
    // Angular
    CommonModule,
    // Shared
    SharedModule,
    // Pages Routing
    PagesRoutingModule
  ]
})
export class PagesModule { }
