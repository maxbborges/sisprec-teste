import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Importando idioma em português
import {
  HashLocationStrategy, LocationStrategy, registerLocaleData
} from '@angular/common';
import localePtExtra from '@angular/common/locales/extra/pt';
import localePt from '@angular/common/locales/pt';
import { SegurancaCheckService } from './shared/seguranca/seguranca-check-service';
import { ExcelService } from './shared/services/excel.service';
import { SharedModule } from './shared/shared.module';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

registerLocaleData(localePt, 'pt', localePtExtra);
declare var Quill: any;
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    AppRoutingModule,
    ModalModule.forRoot(),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    ExcelService,
    SegurancaCheckService,
    providePrimeNG({
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: false
            }
        }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
