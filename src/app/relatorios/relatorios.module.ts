import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { SharedModule } from "../shared/shared.module";
import { RelatorioColaboradoresComponent } from "./colaboradores/relatorio-colaboradores.component";
import { RelatorioDespesasComponent } from "./despesas/relatorio-despesas.component";
import { RelatorioAnalisePrestacaoContasComponent } from "./relatorio-analise-prestacao-contas.component";
import { RelatorioDespesasOldComponent } from "./relatorio-despesas-old.component";
import { RelatorioHistoricoPrestacaoContasComponent } from "./relatorio-historico-prestacao-contas.component";
import { RelatorioPrestacaoContasComponent } from "./relatorio-prestacao-contas.component";
import { RelatoriosRoutingModule } from "./relatorios-routing.module";

@NgModule({
  declarations: [
    RelatorioAnalisePrestacaoContasComponent,
    RelatorioDespesasOldComponent,
    RelatorioDespesasComponent,
    RelatorioPrestacaoContasComponent,
    RelatorioHistoricoPrestacaoContasComponent,
    RelatorioColaboradoresComponent
  ],
  imports: [CommonModule, RelatoriosRoutingModule, SharedModule, FormsModule],
})
export class RelatoriosModule {}
