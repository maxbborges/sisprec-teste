import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemLancamentoService } from 'src/app/services/item-lancamento.service';
import { MotivoService } from 'src/app/services/motivo.service';

@Injectable({
  providedIn: 'root'
})
export class IndicadoresEdicaoResolver implements Resolve<any> {

  constructor(
    private itemLancamentoService: ItemLancamentoService,
    private motivoService: MotivoService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

    if (route.params.tipo === 'motivo') {
      return this.motivoService.obterPorId(route.params.id)
        .pipe(map(x => {
          return {
            id: x.idMotivo,
            nome: x.descricao,
            tipo: 'motivo',
            entradaOuSaida: ''
          };
        }));
    } else {
      return this.itemLancamentoService.obterPorId(route.params.id)
        .pipe(map(x => {
          let tipo: string;
          let entradaOuSaida: string;
          if (x.idTipoLancamento === 1008) {
            tipo = 'itemContaCorrente';
            entradaOuSaida = 'entrada';
          } else if (x.idTipoLancamento === 1009) {
            tipo = 'itemContaCorrente';
            entradaOuSaida = 'saida';
          } else if (x.idTipoLancamento === 1004) {
            tipo = 'itemContaInvestimento';
            entradaOuSaida = 'entrada';
          } else if (x.idTipoLancamento === 1005) {
            tipo = 'itemContaInvestimento';
            entradaOuSaida = 'saida';
          }
          return {
            id: x.idItemLancamento,
            nome: x.item,
            tipo,
            entradaOuSaida
          };
        }));
    }
  }
}
