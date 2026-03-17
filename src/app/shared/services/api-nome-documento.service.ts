import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AlterarNomeDocumento, DesativarNomeDocumento, InserirNomeDocumento, ListarNomeDocumentoFiltrado } from '../models/commands/cmdNomeDocumento';
import { FederacaoNomeDocumento, ListaNomeDocumentoCategorizado, NomeDocumento } from '../models/responses/sisprec-response';

@Injectable({
  providedIn: 'root'
})
export class ApiNomeDocumentoService {
  private urlApi = environment.urlApiSisprec + 'nomeDocumento/';

  constructor(private httpClient: HttpClient) { }

  public visualizarNomeDocumento(idNomeDocumento: number): Observable<NomeDocumento> {
    return this.httpClient.get<NomeDocumento>(this.urlApi + 'porId/' + idNomeDocumento);
  }

  public listarTodosNomeDocumento(): Observable<NomeDocumento[]> {
    return this.httpClient.get<NomeDocumento[]>(this.urlApi + 'listarTodos');
  }

  public listarNomeDocumentoFiltrado(filtros: ListarNomeDocumentoFiltrado): any {
    return this.httpClient.post<any>(this.urlApi + 'listarFiltrado', filtros);
  }

  public listarNomeDocumentoFiltradoCategorizado(filtros: ListarNomeDocumentoFiltrado): Observable<ListaNomeDocumentoCategorizado[]> {
    return this.httpClient.post<ListaNomeDocumentoCategorizado[]>(this.urlApi + 'listarFiltrado', filtros);
  }

  public inserirNomeDocumento(nomeDocumento: InserirNomeDocumento): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'inserirNomeDocumento', nomeDocumento);
  }

  public alterarNomeDocumento(nomeDocumento: AlterarNomeDocumento): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'alterarNomeDocumento', nomeDocumento);
  }

  public desativarNomeDocumento(nomeDocumento: DesativarNomeDocumento): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'desativarNomeDocumento', nomeDocumento);
  }

  public ativarNomeDocumento(nomeDocumento: DesativarNomeDocumento): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'ativarNomeDocumento', nomeDocumento);
  }

  public listarFederacaoNomeDocumento(idNomeDocumento?: number): Observable<FederacaoNomeDocumento[]> {
    return this.httpClient
      .get<FederacaoNomeDocumento[]>(
        `${this.urlApi}listarFederacaoNomeDocumento${idNomeDocumento ? '/' + idNomeDocumento : ''}`
      );
  }
}
