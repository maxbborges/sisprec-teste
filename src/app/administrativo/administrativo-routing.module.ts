import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateInternoComponent } from '../shared/templates/template-interno/template-interno.component';
import { CadastrarIndicadorComponent } from './indicador/cadastrar-indicador/cadastrar-indicador.component';
import { CadastrarTipoIndicadorComponent } from './indicador/cadastrar-tipo-indicador/cadastrar-tipo-indicador.component';
import { EditarIndicadorComponent } from './indicador/editar-indicador/editar-indicador.component';
import { ListarIndicadoresComponent } from './indicador/listar-indicadores/listar-indicadores.component';
import { CadastrarUsuarioComponent } from './usuarios/cadastrar-usuario/cadastrar-usuario.component';
import { EditarUsuarioComponent } from './usuarios/editar-usuario/editar-usuario.component';
import { ListarUsuariosComponent } from './usuarios/listar-usuarios/listar-usuarios.component';


const routes: Routes = [
  {
    path: '',
    component: TemplateInternoComponent,
    children: [
      { path: 'indicadores', component: ListarIndicadoresComponent },
      { path: 'indicadores/cadastrar', component: CadastrarIndicadorComponent},
      { path: 'indicadores/editar/', component: EditarIndicadorComponent},
      { path: 'indicadores/cadastrarTipo', component: CadastrarTipoIndicadorComponent},
      { path: 'usuarios', component: ListarUsuariosComponent },
      { path: 'usuarios/cadastrar', component: CadastrarUsuarioComponent},
      { path: 'usuarios/editar/:idUsuario', component: EditarUsuarioComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrativoRoutingModule { }
