import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AlterarIndicador, DesativarIndicador, InserirIndicador } from '../models/commands/cmdIndicador';
import { Indicador } from '../models/responses/sisprec-response';

@Injectable({
  providedIn: 'root'
})
export class ApiIndicadorService {
  private urlApi = environment.urlApiSisprec + 'indicador/';

  constructor(private httpClient: HttpClient) { }

  public visualizarIndicador(idIndicador: number): Observable<Indicador> {
    return this.httpClient.get<Indicador>(this.urlApi + 'porId/' + idIndicador);
  }

  public visualizarIndicadorPorSigla(sigla: string): Observable<Indicador> {
    return this.httpClient.get<Indicador>(this.urlApi + 'porSigla/' + sigla);
  }

  public listarTodosIndicadores(): Observable<Indicador[]> {
    return this.httpClient.get<Indicador[]>(this.urlApi + 'listarTodos');
  }

  public listarTodosIndicadoresPorTipoId(idTipo: number): Observable<Indicador[]> {
    return this.httpClient.get<Indicador[]>(this.urlApi + 'listarPorTipoId/' + idTipo);
  }


  public buscarIndicadorPorId(idIndicador: number): Observable<Indicador> {
    return this.httpClient.get<Indicador>(this.urlApi + 'porId/' + idIndicador);
  }

  public listarTodosIndicadoresPorTipoSigla(sigla: string): Observable<Indicador[]> {
    return this.httpClient.get<Indicador[]>(this.urlApi + 'listarPorTipoSigla/' + sigla);
  }

  public inserirIndicador(indicador: InserirIndicador): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'inserirIndicador', indicador);
  }

  public alterarIndicador(indicador: AlterarIndicador): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'alterarIndicador', indicador);
  }

  public desativarIndicador(indicador: DesativarIndicador): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'desativarIndicador', indicador);
  }
}
