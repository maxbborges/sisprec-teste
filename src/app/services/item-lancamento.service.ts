import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ItemLancamentoService {

  urlApi = `${environment.urlApiSisprec}/itens-lancamento`;

  constructor(private httpClient: HttpClient) { }

  obterTodos(idTipoLancamento: string): Observable<any> {
    return this.httpClient.get(`${this.urlApi}`, { params: { idTipoLancamento } });
  }

  cadastrar(request: any): Observable<any> {
    return this.httpClient.post(`${this.urlApi}/cadastrar`, request);
  }

  obterPorId(id: number): Observable<any> {
    const url = `${this.urlApi}/${id}`;
    console.log(url);
    return this.httpClient.get(url);
  }

  editar(request: any): Observable<any> {
    return this.httpClient.post(`${this.urlApi}/editar`, request);
  }

  reabilitar(request: any): Observable<any> {
    return this.httpClient.post(`${this.urlApi}/reabilitar`, request);
  }

  desabilitar(request: any): Observable<any> {
    return this.httpClient.post(`${this.urlApi}/desabilitar`, request);
  }

  mover(request: any): Observable<any> {
    return this.httpClient.post(`${this.urlApi}/mover`, request);
  }
}
