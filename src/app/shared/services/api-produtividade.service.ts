import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ApiProdutividadeService {

  private urlApi = `${environment.urlApiSisprec}produtividade/`;
  constructor(private httpClient: HttpClient) { }

  public buscarValorProdutividade(sigla: string): Observable<any> {
    return this.httpClient.get(this.urlApi + 'valor/' + sigla);
  }
  public buscarValorProdutividadePorReferencia(sigla: string, ano: number, mes: number, isAporte: boolean): Observable<any> {
    return this.httpClient.get(this.urlApi + 'valor/' + ano + '/' + mes + '/' + isAporte, { params: { sigla } });
  }
}
