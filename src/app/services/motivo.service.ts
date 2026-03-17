import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MotivoService {

  urlApi = `${environment.urlApiSisprec}motivos`;

  constructor(private httpClient: HttpClient) { }

  obterTodos(): Observable<any> {
    return this.httpClient.get(`${this.urlApi}`);
  }

  cadastrar(request: any): Observable<any> {
    return this.httpClient.post(`${this.urlApi}/cadastrar`, request);
  }

  obterPorId(id: number): Observable<any> {
    return this.httpClient.get(`${this.urlApi}/${id}`);
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
