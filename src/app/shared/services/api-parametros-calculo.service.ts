import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import {
  CommandAlterarParametrosCalculo, CommandCadastrarParametrosCalculo, CommandPesquisarParametrosCalculo,
  ParametrosCalculoResponse
} from "../models/commands/cmdParametrosCalculo";

@Injectable({
  providedIn: 'root'
})
export class ApiParametrosCalculoService {

  private urlApi = `${environment.urlApiSisprec}parametrosCalculo/`;

  constructor(private httpClient: HttpClient) { }

  public pesquisar(filtros: CommandPesquisarParametrosCalculo): Observable<ParametrosCalculoResponse[]> {
    return this.httpClient.post<ParametrosCalculoResponse[]>(`${this.urlApi}pesquisar`, filtros);
  }

  public buscarPorId(idParametro: number): Observable<ParametrosCalculoResponse> {
    return this.httpClient.get<ParametrosCalculoResponse>(`${this.urlApi}buscar/${idParametro}`);
  }

  public cadastrar(parametro: CommandCadastrarParametrosCalculo): Observable<any> {
    return this.httpClient.post<any>(`${this.urlApi}cadastrar`, parametro);
  }

  public alterar(parametro: CommandAlterarParametrosCalculo): Observable<any> {
    return this.httpClient.put<any>(`${this.urlApi}alterar`, parametro);
  }

  public excluir(idParametro: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.urlApi}excluir/${idParametro}`);
  }
}
