import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { InserirIndicadorTipo } from '../models/commands/cmdIndicadorTipo';
import { IndicadorTipo } from '../models/responses/sisprec-response';

@Injectable({
  providedIn: 'root'
})
export class ApiIndicadorTipoService {
  private urlApi = environment.urlApiSisprec + 'indicadorTipo/';

  constructor(private httpClient: HttpClient) { }

  public listarTodosIndicadoresTipo(): Observable<IndicadorTipo[]> {
    return this.httpClient.get<IndicadorTipo[]>(this.urlApi + 'listarTodos');
  }

  public inserirIndicadorTipo(indicadorTipo: InserirIndicadorTipo): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'inserirIndicadorTipo', indicadorTipo);
  }
}
