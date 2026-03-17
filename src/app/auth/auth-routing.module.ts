import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateExternoComponent } from '../shared/templates/template-externo/template-externo.component';
import { LoginComponent } from './login/login.component';
import { RecuperarSenhaComponent } from './recuperar-senha/recuperar-senha.component';


const routes: Routes = [
  {
    path: '',
    component: TemplateExternoComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'recuperar-senha', component: RecuperarSenhaComponent }
    ]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
