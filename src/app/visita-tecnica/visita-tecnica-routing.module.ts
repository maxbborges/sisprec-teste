// tslint:disable: max-line-length
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EhDesenvolvedorGuard } from '../shared/guards/eh-desenvolvedor.guard';
import { TemplateInternoComponent } from '../shared/templates/template-interno/template-interno.component';
import { CadastrarRelatorioVisitaTecnicaComponent } from './relatorio-visita-tecnica/cadastrar-relatorio-visita-tecnica/cadastrar-relatorio-visita-tecnica.component';
import { EditarRelatorioVisitaTecnicaComponent } from './relatorio-visita-tecnica/editar-relatorio-visita-tecnica/editar-relatorio-visita-tecnica.component';
import { VisualizarRelatoriosVisitaTecnicaComponent } from './relatorio-visita-tecnica/visualizar-relatorios-visita-tecnica/visualizar-relatorios-visita-tecnica.component';


const routes: Routes = [
  {
    path: '',
    component: TemplateInternoComponent,
    children: [
      { path: 'listarRelatorioVisitaTecnica', component: VisualizarRelatoriosVisitaTecnicaComponent, canActivate: [EhDesenvolvedorGuard] },
       { path: 'cadastrarRelatorioVisitaTecnica', component: CadastrarRelatorioVisitaTecnicaComponent, canActivate: [EhDesenvolvedorGuard] },
       { path: 'editarRelatorioVisitaTecnica/:idVisita', component: EditarRelatorioVisitaTecnicaComponent, canActivate: [EhDesenvolvedorGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitaTecnicaRoutingModule { }
