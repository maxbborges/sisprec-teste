import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
// tslint:disable-next-line: max-line-length
import { AprovarPrestacaoContas } from '../models/commands/cmdPrestacaoDeContas';
import { AlterarPrestacaoContas, AlterarStatusPrestacaoContas, BuscarPrestacaoContas, FederacaoNomeDocumentoObrigatorio, FiltroDetalhePrestacaoContas, PrestacaoContas, VerificaVersao } from '../models/responses/sisprec-response';

import { HttpClient, HttpParams } from '@angular/common/http';
import { ListaPrestacoesContas } from 'src/app/prestacao-de-contas/pesquisar-prestacao-contas/lista-prestacoes-contas';
import { InserirPrestacaoDeContas } from '../models/commands/cmdPrestacaoDeContas';

@Injectable({
  providedIn: 'root'
})
export class ApiPrestacaoContasService { // api-prestacao-contas.service.ts
  private urlApi = environment.urlApiSisprec + 'prestacaoContas/';
  private urlApiHistorico = environment.urlApiSisprec + 'HistoricoPrestacaoContas/';

  constructor(private httpClient: HttpClient) { }

  public buscarTodosPrestacoesContasPor(buscarPrestacaoContas: BuscarPrestacaoContas): Observable<any> {
    return this.httpClient.post<PrestacaoContas[]>(`${this.urlApi}buscarPrestacoesDeContasPor`, buscarPrestacaoContas);
  }

  public buscarPrestacoesContas(buscarPrestacaoContas: any): Observable<any> {
    return this.httpClient.post<PrestacaoContas[]>(`${this.urlApi}buscarPrestacoesDeContasPor`, buscarPrestacaoContas);
  }

  public buscarTodosPrestacoesContasPorV2(buscarPrestacaoContas: BuscarPrestacaoContas): Observable<any> {
    return this.httpClient.post<PrestacaoContas[]>(`${this.urlApi}v2/buscarPrestacoesDeContasPor`, buscarPrestacaoContas);
  }

  public buscarTodosPrestacoesDeContaParaAprovacaoDiretoria(idTipoPerfilDiretoria: any): Observable<any> {
    return this.httpClient.get<number>(this.urlApi + 'listarTodosParaAprovacaoPorTipoDiretoria/' + idTipoPerfilDiretoria);
  }

  public inserirPrestacaoDeContas(prestacao: InserirPrestacaoDeContas): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'InserirPrestacaoContas', prestacao);
  }

  public buscarDetalhePrestacaoContas(filtro: FiltroDetalhePrestacaoContas, incluirInativos = false): Observable<any> {
    return this.httpClient.post<any>(this.urlApi + 'detalhePrestacaoContas', filtro, { params: new HttpParams().set('incluirInativos', incluirInativos.toString()) });
  }

  public buscarHistoricoPrestacaoContas(filtro: FiltroDetalhePrestacaoContas): Observable<any> {
    return this.httpClient.post<any>(this.urlApi + 'historico', filtro);
  }

  public verificaStatusPrestacaoContas(filtro: FiltroDetalhePrestacaoContas): Observable<any> {
    return this.httpClient.post<any>(this.urlApi + 'verificaStatus', filtro);
  }

  public alterarPrestacaoContas(alterarPrestacaoContas: AlterarPrestacaoContas): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'AlterarPrestacaoContas', alterarPrestacaoContas);
  }

  public alterarStatusPrestacaoContas(alterarPrestacaoContas: AlterarStatusPrestacaoContas): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'AlterarStatusPrestacaoContas', alterarPrestacaoContas);
  }

  public buscarQuantidadePrestacoesDeContasPendentes(alterarPrestacaoContas: any): Observable<number> {
    return this.httpClient.get<number>(this.urlApi + 'BuscarQuantidadePrestacoesDeContasPendentes/' + alterarPrestacaoContas);
  }

  // DIRETORIA
  public diretoriaAprovar(aprovarPrestacoesContas: AprovarPrestacaoContas): Observable<number> {
    return this.httpClient.post<any>(this.urlApi + 'aprovarDiretoria/', aprovarPrestacoesContas);
  }

  // HISTORICO
  public buscarHistoricoPrestacaoContasPorId(id: string): Observable<any[]> {
    return this.httpClient.get<any[]>(this.urlApiHistorico + 'BuscarHistoricoPCPorIdPrestacao/' + id);
  }


  public buscarUltimaVersao(obj: VerificaVersao): Observable<any> {
    return this.httpClient.post<any>(this.urlApiHistorico + 'verificaUltimaVersao', obj);
  }

  public verificarDocumentoObrigatorioCompleto(command: FiltroDetalhePrestacaoContas): Observable<FederacaoNomeDocumentoObrigatorio[]> {
    return this.httpClient
      .post<FederacaoNomeDocumentoObrigatorio[]>(
        this.urlApi + 'verificar-documento-obrigatorio-completo', command
      );
  }

  getListaPrestacoesContas(query: any): Observable<ListaPrestacoesContas[]> {

    return this.httpClient
      .get<ListaPrestacoesContas[]>(
        `${this.urlApi}lista`, {
          params: query
        });

  }

  getListaExercicios(): Observable<string[]> {

    return this.httpClient
      .get<string[]>(
        `${this.urlApi}lista-exercicios`);

  }

  getListaExerciciosPorIdFederacao(idFederacao: number): Observable<string[]> {

    return this.httpClient
      .get<string[]>(
        `${this.urlApi}lista-exercicios/${idFederacao}`);

  }
}
