import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

// tslint:disable-next-line: ban-types
declare let ga: Function;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {
  public versao = environment.VERSAO;

  constructor() {}

  public eventEmitter(categoria: string, acao: string, label: string = null, valor: number = null
  ) {
    if (typeof ga === 'function') {
      ga('send', 'event', {
        eventCategory: this.versao,
        eventLabel: label,
        eventAction: acao,
        eventValue: valor
      });
    }
  }
}
