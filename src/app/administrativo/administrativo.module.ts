import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { AdministrativoRoutingModule } from './administrativo-routing.module';
import { CadastrarIndicadorComponent } from './indicador/cadastrar-indicador/cadastrar-indicador.component';
import { CadastrarTipoIndicadorComponent } from './indicador/cadastrar-tipo-indicador/cadastrar-tipo-indicador.component';
import { EditarIndicadorComponent } from './indicador/editar-indicador/editar-indicador.component';
import { ListarIndicadoresComponent } from './indicador/listar-indicadores/listar-indicadores.component';
import { CadastrarUsuarioComponent } from './usuarios/cadastrar-usuario/cadastrar-usuario.component';
import { EditarUsuarioComponent } from './usuarios/editar-usuario/editar-usuario.component';
import { ListarUsuariosComponent } from './usuarios/listar-usuarios/listar-usuarios.component';

@NgModule({
  declarations: [
    ListarIndicadoresComponent,
    CadastrarIndicadorComponent,
    ListarUsuariosComponent,
    CadastrarUsuarioComponent,
    CadastrarTipoIndicadorComponent,
    EditarIndicadorComponent,
    EditarUsuarioComponent
  ],
  imports: [
    AdministrativoRoutingModule,
    SharedModule
  ]
})
export class AdministrativoModule {}
