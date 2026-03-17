import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AlterarDocumento, DesativarDocumento, InserirDocumento, ListarDocumentoFiltrado } from '../models/commands/cmdDocumento';
import { AlterarDocumentoAnaliseMotivo, Documento, LogData } from '../models/responses/sisprec-response';

@Injectable({
  providedIn: 'root'
})
export class ApiDocumentoService {
  private urlApi = environment.urlApiSisprec + 'documento/';

  constructor(private httpClient: HttpClient) { }

  public listarDocumentoFiltrado(filtros: ListarDocumentoFiltrado, incluirInativos = false): Observable<Documento[]> {
    return this.httpClient.post<Documento[]>(this.urlApi + 'listarFiltrado', filtros, { params: new HttpParams().set('incluirInativos', incluirInativos.toString()) });
  }

  public inserirDocumento(documento: InserirDocumento): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'InserirDocumento', documento);
  }

  public desativarDocumento(documento: DesativarDocumento): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'desativarDocumento', documento);
  }

  public alterarDocumento(documento: AlterarDocumento): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'AlterarDocumento', documento);
  }

  public alterarDocumentoAnaliseMotivo(alterarAnaliseMotivo: AlterarDocumentoAnaliseMotivo): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'alterarDocumentoAnaliseMotivo', alterarAnaliseMotivo);
  }

  public obterHistoricoFichaAuxiliarByIdLancamento(idLancamento: string): Observable<LogData> {
      return this.httpClient.get<LogData>(this.urlApi + 'fichaAuxiliarHistorico/' + idLancamento);
  }
  public obterDocumentoByIdDocumento(idDocumento: string): Observable<Documento> {
    return this.httpClient.get<Documento>(this.urlApi + 'BuscarPrestacoesDeContasPorId/' + idDocumento);
  }

  public alterarAnalise(idDocumento: string, idAnalise: number, idUsuario: number): Observable<any> {
    return this.httpClient.get<any>(this.urlApi + 'AlterarAnaliseDocumento/' + idDocumento + '/' + idAnalise+ '/' + idUsuario);
  }

  public alterarMotivoRetornoParaAjustes(idDocumento: string, idMotivo: number, idUsuario: number): Observable<any> {
    return this.httpClient.get<any>(this.urlApi + 'AlterarMotivoRetornoParaAjustes/' + idDocumento + '/' + idMotivo + '/' + idUsuario);
  }

  public alterarObservacaoRetornoParaAjustes(idDocumento: string, observacao: string, idUsuario: number): Observable<any>{
    return this.httpClient.post<any>(this.urlApi + 'AlterarObservacaoRetornoParaAjustes/' + idDocumento + '/' + idUsuario, { observacao: observacao });
  }
}
