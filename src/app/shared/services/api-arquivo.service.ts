import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ListarArquivos, ListarArquivosFiltrado } from '../models/commands/cmdArquivoFiltrado';

@Injectable({
  providedIn: 'root'
})
export class ApiArquivoService {

  private urlApi = environment.urlApiSisprec + 'arquivo';

  constructor(private httpClient: HttpClient) { }

  public listarDocumentoFiltrado(filtros: ListarArquivosFiltrado): Observable<any[]> {
    return this.httpClient.post<any[]>(this.urlApi + '/listarFiltrado', filtros);
  }

  public listarArquivos(filtros: ListarArquivos): Observable<any[]>{
    return this.httpClient.post<any[]>(this.urlApi + '/ListarArquivos', filtros);
  }

  public getBaixarArquivo(id: string): Observable<any>{
    return this.httpClient.get<any>(`${this.urlApi}/porId/${id}`);
  }

}
