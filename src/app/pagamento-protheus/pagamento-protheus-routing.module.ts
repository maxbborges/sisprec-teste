import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TemplateInternoComponent } from "../shared/templates/template-interno/template-interno.component";
import { CadastrarParametrosCalculoComponent } from "./parametros-calculo/cadastrar-edicao/parametros-calculo-cadastrar.component";
import { ListarParametrosCalculoComponent } from "./parametros-calculo/listar/parametros-calculo-listar.component";
import { CadastrarRepasseFinanceiroComponent } from "./repasse-financeiro/cadastrar/repasse-financeiro-cadastrar.component";
import { ListarRepasseFinanceiroComponent } from "./repasse-financeiro/listar/repasse-financeiro-listar.component";

const routes: Routes = [
  {
    path: '',
    component: TemplateInternoComponent,
    children: [
      { path: 'repasse-financeiro/listar', component: ListarRepasseFinanceiroComponent },
      { path: 'repasse-financeiro/novo', component: CadastrarRepasseFinanceiroComponent },
      { path: 'repasse-financeiro/editar/:idPagamento', component: CadastrarRepasseFinanceiroComponent },
      { path: 'parametros-calculo/listar', component: ListarParametrosCalculoComponent },
      { path: 'parametros-calculo/novo', component: CadastrarParametrosCalculoComponent },
      { path: 'parametros-calculo/editar/:idParametro', component: CadastrarParametrosCalculoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagamentoProtheusRoutingModule { }
