import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Visita } from '../models/responses/sisprec-response';

import { ListarVisita } from '../models/commands/cmdVisita';

@Injectable({
  providedIn: 'root'
})
export class ApiVisitaService {
  private urlApi = environment.urlApiSisprec + 'visita/';

  constructor(private httpClient: HttpClient) { }

  public listarVisitas(filtros: ListarVisita): Observable<Visita[]> {
    return this.httpClient.post<Visita[]>(this.urlApi + "listarVisitasFiltrado", filtros);
  }

  public inserirVisita(visita: Visita): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + "inserirVisita", visita);
  }

  public apagarVisita(idVisita: string): Observable<boolean> {
    return this.httpClient.delete<boolean>(this.urlApi + "apagarVisita/"+idVisita);
  }

  public atualizarVisita(visita: Visita): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + "alterarVisita",visita);
  }

  public visualizarVisita(idVisita: string): Observable<Visita> {
    return this.httpClient.get<Visita>(this.urlApi + "visualizar/"+idVisita);
  }

  }
