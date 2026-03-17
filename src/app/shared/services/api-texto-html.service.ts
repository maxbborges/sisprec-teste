import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EditarTextoHtml, InserirTextoHtml } from '../models/commands/cmdTextoHtml';

@Injectable({
  providedIn: 'root'
})
export class ApiTextoHtmlService {
  private urlApi = environment.urlApiSisprec + 'textoHtml/';

  constructor(private httpClient: HttpClient) { }

  public inserirHtml(dados: InserirTextoHtml): Observable<string> {
    return this.httpClient.post<string>(this.urlApi + 'inserirHtml', dados);
  }

  public editarHtml(dados: EditarTextoHtml): Observable<string> {
    return this.httpClient.post<string>(this.urlApi + 'editarHtml', dados);
  }

  public recuperarHtml(idTextoHtml: string): Observable<string> {
    return this.httpClient.get<string>(this.urlApi + 'recuperar/' + idTextoHtml);
  }

  public recuperarHtmlPdf(idTextoHtml: string) {
    return this.httpClient.get<string>(this.urlApi + 'pdf/' + idTextoHtml).subscribe(v => {
      console.log(v);
    });
  }
}
