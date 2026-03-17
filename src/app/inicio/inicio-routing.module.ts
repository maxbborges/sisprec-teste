import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TemplateInternoComponent } from '../shared/templates/template-interno/template-interno.component';
import { InicioComponent } from './inicio/inicio.component';
import { LogoutComponent } from './logout/logout.component';
import { TrocarSenhaComponent } from './trocar-senha/trocar-senha.component';

const routes: Routes = [
  {
    path: '',
    component: TemplateInternoComponent,
    children: [
      { path: '', component: InicioComponent },
      { path: 'alterar-senha', component: TrocarSenhaComponent },
      { path: 'sair', component: LogoutComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class InicioRoutingModule {}
