import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateInternoComponent } from '../shared/templates/template-interno/template-interno.component';

import { ListarAnaliseValoresPorAnoComponent } from './analisar/listar-analise-valores-por-ano/listar-analise-valores-por-ano.component';
import { VisualizarAnaliseValoresComponent } from './analisar/visualizar-analise-valores/visualizar-analise-valores.component';
import { CadastrarEditarValoresComponent } from './cadastrarValores/cadastrar-editar-valores/cadastrar-editar-valores.component';
import { ListarValoresPorAnoComponent } from './cadastrarValores/listar-valores-por-ano/listar-valores-por-ano.component';
import { VisualizarValoresComponent } from './cadastrarValores/visualizar-valores/visualizar-valores.component';
import { DefinirPrazoComponent } from './definir-prazo/cadastro/definir-prazo.component';
import { CadastrarItemESubitemComponent } from './manter/cadastrar-item-e-subitem/cadastrar-item-e-subitem.component';
import { EditarItemESubitemComponent } from './manter/editar-item-e-subitem/editar-item-e-subitem.component';
import { ListarItemESubitemPorAnoComponent } from './manter/listar-item-e-subitem-por-ano/listar-item-e-subitem-por-ano.component';
import { ListarItemESubitemComponent } from './manter/listar-item-e-subitem/listar-item-e-subitem.component';


const routes: Routes = [
  {
    path: '',
    component: TemplateInternoComponent,
    children: [
      { path: 'analisar', component: ListarAnaliseValoresPorAnoComponent },
      {
        path: 'analisar', children: [
          { path: ':idCadastro/visualizar', component: VisualizarAnaliseValoresComponent }
        ]
      },
      { path: 'cadastrarValores', component: ListarValoresPorAnoComponent },
      {
        path: 'cadastrarValores', children: [
          { path: ':idCadastro/cadastrarEditar', component: CadastrarEditarValoresComponent },
          { path: ':idCadastro/visualizar', component: VisualizarValoresComponent }
        ]
      },
      { path: 'manter', component: ListarItemESubitemPorAnoComponent },
      {
        path: 'manter', children: [
          { path: ':anoExercicio/cadastrar', component: CadastrarItemESubitemComponent },
          { path: ':anoExercicio/editar/:idItemSubitem', component: EditarItemESubitemComponent },
          { path: ':anoExercicio/listar', component: ListarItemESubitemComponent }
        ]
      },
      { path: 'definir-prazo', component: DefinirPrazoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EstimativaDeCustoRoutingModule { }
