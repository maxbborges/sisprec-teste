import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AlterarCadastroStatusCommand, CadastrarEditarValorCommand, CopiarItemSubitemParaProximoAno, EditarItemSubitem, ExistirItemSubitem, InativarItemSubitem, InserirItemSubitem } from '../models/commands/cmdEstimativaDeCusto';
import { Cadastro, Historico, ItemSubitem, Valor } from '../models/responses/sisprec-response';
import { DefinirPrazoCommand, DefinirPrazoData } from './../models/commands/cmdEstimativaDeCusto';

@Injectable({
  providedIn: 'root'
})
export class ApiEstimativaDeCustoService {

  private urlApi = environment.urlApiSisprec + 'estimativa-de-custo';

  constructor(private httpClient: HttpClient) { }

  listarItemSubitemPorAno(): Observable<number[]> {
    return this.httpClient.get<number[]>(`${this.urlApi}/listar/item-subitem-por-ano`);
  }

  copiarItemSubitemParaProximoAno(command: CopiarItemSubitemParaProximoAno): Observable<boolean> {
    return this.httpClient.post<boolean>(`${this.urlApi}/copiar/item-subitem-para-proximo-ano`, command);
  }

  listarItemSubitem(anoExercicio: number): Observable<ItemSubitem[]> {

    return this.httpClient.get<ItemSubitem[]>(`${this.urlApi}/listar/item-subitem/${anoExercicio}`);

  }

  listarItem(anoExercicio: number): Observable<ItemSubitem[]> {

    return this.httpClient.get<ItemSubitem[]>(`${this.urlApi}/listar/item/${anoExercicio}`);

  }

  listarSubitem(anoExercicio: number, codigoItem: number): Observable<ItemSubitem[]> {

    return this.httpClient.get<ItemSubitem[]>(`${this.urlApi}/listar/subitem/${anoExercicio}/${codigoItem}`);

  }

  inativarItemSubitem(usuario: string, command: InativarItemSubitem): Observable<boolean> {

    return this.httpClient.post<boolean>(`${this.urlApi}/inativar/item-subitem/${usuario}`, command);

  }

  inserirItemSubitem(command: InserirItemSubitem): Observable<boolean> {

    return this.httpClient.post<boolean>(`${this.urlApi}/inserir/item-subitem`, command);

  }

  editarItemSubitem(command: EditarItemSubitem): Observable<boolean> {

    return this.httpClient.post<boolean>(`${this.urlApi}/editar/item-subitem`, command);

  }

  detalharItem(idItemSubitem: string): Observable<ItemSubitem> {

    return this.httpClient.get<ItemSubitem>(`${this.urlApi}/detalhar/item-subitem/${idItemSubitem}`);

  }

  existirItemSubitem(command: ExistirItemSubitem): Observable<boolean> {

    return this.httpClient.post<boolean>(`${this.urlApi}/existir/item-subitem`, command);

  }

  listarValoresPorAno(idFederacao: number = 0): Observable<Cadastro[]> {
    return this.httpClient.get<Cadastro[]>(`${this.urlApi}/listar/valores-por-ano/${idFederacao}`);
  }

  visualizarValres(idCadastro: string): Observable<Valor> {
    return this.httpClient.get<Valor>(`${this.urlApi}/visualizar/valores/${idCadastro}`).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error && error.error.errorMessage) {
          errorMessage = error.error.errorMessage;
        }
        console.log(errorMessage)
        return throwError(errorMessage);
      })
    );;
  }

  verificarValores(idItemSubitem: string): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.urlApi}/verificar/valores/${idItemSubitem}`);
  }

  cadastrarEditarValores(acaoParam: string, command: CadastrarEditarValorCommand): Observable<boolean> {
    return this.httpClient.post<boolean>(`${this.urlApi}/cadastrar-editar/valores/${acaoParam}`, command);
  }


  alterarCadastroStatus(command: AlterarCadastroStatusCommand): Observable<boolean> {

    return this.httpClient.post<boolean>(`${this.urlApi}/alterar/cadastro-status`, command);

  }

  listarHistorico(idCadastro: string): Observable<Historico[]> {

    return this.httpClient.get<Historico[]>(`${this.urlApi}/listar/historico/${idCadastro}`);

  }

  definirPrazo(command: DefinirPrazoCommand): Observable<any> {
    return this.httpClient.post(`${this.urlApi}/manter/definir-prazo`, command);
  }

  getPrazoDefinidoPorAnoMes(ano: number, mes: number): Observable<DefinirPrazoData> {
    return this.httpClient.get<DefinirPrazoData>(`${this.urlApi}/definir-prazo/${ano}/${mes}`);
  }

  enviarEmailManualDifinicaoPrazo(id: string): Observable<any> {
    return this.httpClient.post(`${this.urlApi}/envio-email-prazo/${id}`, id);
  }

}
