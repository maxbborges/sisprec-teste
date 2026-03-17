import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiPlanoDeContasService {

  private urlApi = environment.urlApiSisprec + 'planodeconta/';

  constructor(private httpClient: HttpClient) { }


  public obterCategoriasPorExercicio(ano: number): Observable<any> {
    return this.httpClient.get<any>(this.urlApi + 'porExercicio/' + ano);
  }

  public obterItemCategoriasPorIdCategoria(id: string): Observable<any> {
    return this.httpClient.get<any>(this.urlApi + 'itemCategoriaPorId/' + id);
  }
}
