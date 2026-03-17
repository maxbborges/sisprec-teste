import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { TemplateInternoComponent } from "../shared/templates/template-interno/template-interno.component";
import { RelatorioColaboradoresComponent } from "./colaboradores/relatorio-colaboradores.component";
import { RelatorioDespesasComponent } from "./despesas/relatorio-despesas.component";
import { RelatorioAnalisePrestacaoContasComponent } from "./relatorio-analise-prestacao-contas.component";
import { RelatorioHistoricoPrestacaoContasComponent } from "./relatorio-historico-prestacao-contas.component";
import { RelatorioPrestacaoContasComponent } from "./relatorio-prestacao-contas.component";

const routes: Routes = [
  {
    path: "",
    component: TemplateInternoComponent,
    children: [
      {
        path: "analise-prestacao-contas",
        component: RelatorioAnalisePrestacaoContasComponent,
      },
      //{ path: 'despesas', component: RelatorioDespesasOldComponent },
      { path: "despesas", component: RelatorioDespesasComponent },
      {
        path: "prestacao-contas",
        component: RelatorioPrestacaoContasComponent,
      },
      {
        path: "historico-prestacao-contas",
        component: RelatorioHistoricoPrestacaoContasComponent,
      },
      { path: "colaboradores", component: RelatorioColaboradoresComponent },
      { path: "", redirectTo: "prestacao-contas", pathMatch: "full" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RelatoriosRoutingModule {}
