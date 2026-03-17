import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AlterarColaborador, DesativarColaborador, InserirColaborador } from '../models/commands/cmdColaborador';
import { Banco, Colaborador, FiltroColaboradores } from '../models/responses/sisprec-response';

@Injectable({
  providedIn: 'root'
})
export class ApiColaboradorService {
  private urlApi = environment.urlApiSisprec + 'colaborador/';

  constructor(private httpClient: HttpClient) { }

  public visualizarColaborador(idColaborador: number): Observable<Colaborador> {
    return this.httpClient.get<Colaborador>(this.urlApi + 'porId/' + idColaborador);
  }

  public listarTodosColaboradores(idfederacao: number): Observable<Colaborador[]> {
    return this.httpClient.get<Colaborador[]>(this.urlApi + 'listarTodos/' + idfederacao);
  }

  public pesquisarColaboradorPorNumeroDocumento(numeroDocumento: string): Observable<Colaborador> {
    return this.httpClient.get<Colaborador>(this.urlApi + 'porNumeroDocumento/' + numeroDocumento);
  }

  public inserirColaborador(colaborador: InserirColaborador): Observable<any> {
    return this.httpClient.post<boolean>(this.urlApi + 'inserirColaborador', colaborador);
  }

  public alterarColaborador(colaborador: AlterarColaborador): Observable<any> {
    return this.httpClient.post<boolean>(this.urlApi + 'alterarColaborador', colaborador);
  }

  public desativarColaborador(colaborador: DesativarColaborador): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'desativarColaborador', colaborador);
  }

  public pesquisarColaboradorPorFiltros(filtros: FiltroColaboradores): Observable<Colaborador[]> {
    return this.httpClient.post<Colaborador[]>(this.urlApi + 'buscar-por-filtros', filtros);
  }
  public pesquisarBancos(): Observable<Banco[]> {
    return this.httpClient.get<Banco[]>(this.urlApi + 'bancos');
  }
}
