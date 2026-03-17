// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Templates
import { TemplateInternoComponent } from '../shared/templates/template-interno/template-interno.component';

// Pages
import { IndicadoresEdicaoResolver } from '../resolvers';
import {
  IndicadoresCadastroPage,
  IndicadoresEdicaoPage,
  IndicadoresListaPage
} from './indicadores';

const routes: Routes = [
  {
    path: 'indicadores',
    component: TemplateInternoComponent,
    children: [
      { path: 'novo', component: IndicadoresCadastroPage },
      { path: ':id/:tipo/edicao', resolve: { indicador: IndicadoresEdicaoResolver }, component: IndicadoresEdicaoPage },
      { path: '', component: IndicadoresListaPage }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
