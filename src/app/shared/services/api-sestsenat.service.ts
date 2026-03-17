import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ApiSestSenatService {
  private urlApi = environment.urlApiSisprec;
  constructor(private httpClient: HttpClient) {}

  public recuperarCidades(uf:string) {
    return this.httpClient.get<any>(this.urlApi + "localidade/cidades/" + uf);
  }
}