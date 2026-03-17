import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { PagamentoProtheusRoutingModule } from "./pagamento-protheus-routing.module";
import { CadastrarParametrosCalculoComponent } from "./parametros-calculo/cadastrar-edicao/parametros-calculo-cadastrar.component";
import { ListarParametrosCalculoComponent } from "./parametros-calculo/listar/parametros-calculo-listar.component";
import { CadastrarRepasseFinanceiroComponent } from "./repasse-financeiro/cadastrar/repasse-financeiro-cadastrar.component";
import { ListarRepasseFinanceiroComponent } from "./repasse-financeiro/listar/repasse-financeiro-listar.component";

@NgModule({
  declarations: [
    ListarRepasseFinanceiroComponent,
    CadastrarRepasseFinanceiroComponent,
    ListarParametrosCalculoComponent,
    CadastrarParametrosCalculoComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PagamentoProtheusRoutingModule
  ]
})
export class PagamentoProtheusModule {}
