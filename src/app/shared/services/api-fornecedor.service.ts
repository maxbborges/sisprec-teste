import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AlterarFornecedor, DesativarFornecedor, InserirFornecedor } from '../models/commands/cmdFornecedor';
import { FiltroFornecedores, Fornecedor } from '../models/responses/sisprec-response';

@Injectable({
  providedIn: 'root'
})
export class ApiFornecedorService {
  private urlApi = environment.urlApiSisprec + 'fornecedor/';

  constructor(private httpClient: HttpClient) { }

  public visualizarFornecedor(idFornecedor: number): Observable<Fornecedor> {
    return this.httpClient.get<Fornecedor>(this.urlApi + 'porId/' + idFornecedor);
  }

  public listarTodosFornecedores(idfederacao: number): Observable<Fornecedor[]> {
    return this.httpClient.get<Fornecedor[]>(this.urlApi + 'listarTodos/' + idfederacao);
  }

  public pesquisarFornecedorPorNumeroDocumento(numeroDocumento: string): Observable<Fornecedor> {
    return this.httpClient.get<Fornecedor>(this.urlApi + 'porNumeroDocumento/' + numeroDocumento);
  }

  public inserirFornecedor(fornecedor: InserirFornecedor): Observable<any> {
    return this.httpClient.post<boolean>(this.urlApi + 'inserirFornecedor', fornecedor);
  }

  public alterarFornecedor(fornecedor: AlterarFornecedor): Observable<any> {
    return this.httpClient.post<boolean>(this.urlApi + 'alterarFornecedor', fornecedor);
  }

  public desativarFornecedor(fornecedor: DesativarFornecedor): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'desativarFornecedor', fornecedor);
  }

  public pesquisarFornecedorPorFiltros(filtros: FiltroFornecedores): Observable<Fornecedor[]> {
    return this.httpClient.post<Fornecedor[]>(this.urlApi + 'buscar-por-filtros', filtros);
  }
}
