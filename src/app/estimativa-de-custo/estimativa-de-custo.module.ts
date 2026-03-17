import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { EstimativaDeCustoRoutingModule } from './estimativa-de-custo-routing.module';




import { ListarAnaliseValoresPorAnoComponent } from './analisar/listar-analise-valores-por-ano/listar-analise-valores-por-ano.component';
import {
  ModalCadastrarAnaliseEMotivoValoresComponent
} from './analisar/visualizar-analise-valores/modal-cadastrar-analise-e-motivo-valores.component';
import { VisualizarAnaliseValoresComponent } from './analisar/visualizar-analise-valores/visualizar-analise-valores.component';
import { CadastrarEditarValoresComponent } from './cadastrarValores/cadastrar-editar-valores/cadastrar-editar-valores.component';
import { ListarValoresPorAnoComponent } from './cadastrarValores/listar-valores-por-ano/listar-valores-por-ano.component';
import { VisualizarValoresComponent } from './cadastrarValores/visualizar-valores/visualizar-valores.component';
import { DefinirPrazoComponent } from './definir-prazo/cadastro/definir-prazo.component';
import { CadastrarItemESubitemComponent } from './manter/cadastrar-item-e-subitem/cadastrar-item-e-subitem.component';
import { EditarItemESubitemComponent } from './manter/editar-item-e-subitem/editar-item-e-subitem.component';
import { ListarItemESubitemPorAnoComponent } from './manter/listar-item-e-subitem-por-ano/listar-item-e-subitem-por-ano.component';
import { ListarItemESubitemComponent } from './manter/listar-item-e-subitem/listar-item-e-subitem.component';

@NgModule({
  declarations: [
    ModalCadastrarAnaliseEMotivoValoresComponent,
    ListarItemESubitemPorAnoComponent,
    ListarItemESubitemComponent,
    CadastrarItemESubitemComponent,
    EditarItemESubitemComponent,
    ListarValoresPorAnoComponent,
    VisualizarValoresComponent,
    CadastrarEditarValoresComponent,
    ListarAnaliseValoresPorAnoComponent,
    VisualizarAnaliseValoresComponent,
    DefinirPrazoComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EstimativaDeCustoRoutingModule
  ],

})
export class EstimativaDeCustoModule { }
