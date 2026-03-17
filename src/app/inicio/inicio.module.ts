import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { InicioRoutingModule } from './inicio-routing.module';
import { InicioComponent } from './inicio/inicio.component';
import { LogoutComponent } from './logout/logout.component';
import { TrocarSenhaComponent } from './trocar-senha/trocar-senha.component';



@NgModule({
  declarations: [InicioComponent, TrocarSenhaComponent, LogoutComponent],
  imports: [
    InicioRoutingModule,
    SharedModule
  ]
})
export class InicioModule { }
