import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Lancamento, LancamentoExportacao, LancamentoSaidaPorMesAnoData, LogData, TarifaBancariaVinculadaData, TarifasBancariasVinculadasData } from '../models/responses/sisprec-response';
// tslint:disable-next-line: max-line-length
import { AlterarLancamento, AlterarLancamentoDespesa, DesativarLancamento, InserirLancamento, ListarExtratoFiltrado, TarifaBancariaLancamentoCommand } from '../models/commands/cmdLancamento';

@Injectable({
  providedIn: 'root'
})
export class ApiLancamentoService {
  private urlApi = `${environment.urlApiSisprec}lancamento/`;

  constructor(private httpClient: HttpClient) { }

  public visualizarLancamento(idLancamento: string): Observable<Lancamento> {
    return this.httpClient.get<any>(`${this.urlApi}visualizar/${idLancamento}`);
  }

  public obterLancamentoDespesasPorId(idLancamento: string, incluirInativos = false): Observable<any> {
    return this.httpClient.get<any>(this.urlApi + 'lancamentoDespesaPorId/' + idLancamento, { params: new HttpParams().set('incluirInativos', incluirInativos.toString()) });
  }

  public obterLancamentoDespesasPorIdLancamento(idLancamento: string): Observable<any> {
    return this.httpClient.get<any>(this.urlApi + 'lancamentoDespesaPorIdLancamento/' + idLancamento);
  }

  public obterLancamentoDespesasPorIdDespesa(idLancamento: number): Observable<any> {
    return this.httpClient.get<any>(this.urlApi + 'lancamentoDespesaPorIdDespesa/' + idLancamento);
  }

  public listarExtratoFiltrado(filtros: ListarExtratoFiltrado): Observable<Lancamento[]> {
    return this.httpClient.post<Lancamento[]>(this.urlApi + 'listarExtratoFiltrado', filtros);
  }

  public listarExtratoFiltradoExportacao(filtros: ListarExtratoFiltrado): Observable<LancamentoExportacao[]> {
    return this.httpClient.post<LancamentoExportacao[]>(this.urlApi + 'listarExtratoFiltradoExportacao', filtros);
  }

  public inserirLancamentoContaCorrente(lancamento: InserirLancamento): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'inserirLancamentoCC', lancamento);
  }

  public inserirLancamentoContaInvestimento(lancamento: InserirLancamento): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'inserirLancamentoCI', lancamento);
  }

  public alterarLancamento(lancamento: AlterarLancamento): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'alterarLancamento', lancamento);
  }

  public alterarLancamentoDespesa(lancamento: AlterarLancamentoDespesa): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'alterarLancamentoDespesa', lancamento);
  }

  public desativarLancamento(lancamento: DesativarLancamento): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'desativarLancamento', lancamento);
  }

  public alterarMotivoRetornoParaAjustes(idLancamento: string, idMotivo: number, idUsuario: number): Observable<any> {
    return this.httpClient.get<any>(this.urlApi + 'alterarMotivoRetornoParaAjustes/' + idLancamento + '/' + idMotivo + '/' + idUsuario);
  }

  public alterarObservacaoRetornoParaAjustes(idLancamento: string, observacao: string, idUsuario: number): Observable<any> {
    return this.httpClient.post<any>(this.urlApi + 'alterarObservacaoRetornoParaAjustes/' + idLancamento, {observacao: observacao, idUsuario: idUsuario} );
  }

  public alterarAnalise(idLancamento: string, idAnalise: number, idUsuario: number): Observable<any> {
    return this.httpClient.get<any>(this.urlApi + 'alterarAnaliseLancamento/' + idLancamento + '/' + idAnalise + '/{idUsuario}?idUsuario= ' + idUsuario);
  }

  public obterSaldoAnterior(filtro: ListarExtratoFiltrado): Observable<any> {
    return this.httpClient.post<any>(`${this.urlApi}buscarSaldoAnterior`, filtro);
  }

  public obterSaldos(filtro: ListarExtratoFiltrado): Observable<any> {
    return this.httpClient.post<any>(`${this.urlApi}buscarSaldosPrestacaoContas`, filtro);
  }

  public obterItensRetornadosContas(filtro: ListarExtratoFiltrado): Observable<any> {
    return this.httpClient.post<any>(this.urlApi + 'buscarItensRetornados', filtro);
  }

  public obterLancamentosSaidaPorAnoMesExercicio(ano: number, mes: number, idFederacao: number): Observable<LancamentoSaidaPorMesAnoData[]> {
    return this.httpClient.get<LancamentoSaidaPorMesAnoData[]>(this.urlApi + 'lancamentoSaidaAnoMes/' + ano + '/' + mes + '/' + idFederacao);
  }

  public inserirTarifaBancariaAoLancamento(form: TarifaBancariaLancamentoCommand): Observable<any> {
    return this.httpClient.post<any>(this.urlApi + 'vincular-tarifa-bancaria-lancamento', form);
  }

  public alterarTarifaBancariaAoLancamento(form: TarifaBancariaLancamentoCommand): Observable<any> {
    return this.httpClient.put<any>(this.urlApi + 'alterar-tarifa-bancaria-lancamento', form);
  }

  public excluirTarifaBancariaAoLancamento(form: TarifaBancariaLancamentoCommand): Observable<any> {
    return this.httpClient.put<any>(this.urlApi + 'excluir-tarifa-bancaria-lancamento', form);
  }

  public obterTarifasBancariasLancamento(ano: number, mes: number, idFederacao: number): Observable<TarifasBancariasVinculadasData[]> {
    return this.httpClient.get<TarifasBancariasVinculadasData[]>(this.urlApi + 'tarifasBancariasVinculadas/' + ano + '/' + mes + '/' + idFederacao);
  }

  public obterTarifaBancariaVinculadaById(id: string): Observable<TarifaBancariaVinculadaData> {
    return this.httpClient.get<TarifaBancariaVinculadaData>(this.urlApi + 'tarifaBancariaVinculadaById/' + id);
  }

  public obterHistoricoFichaAuxiliarByIdLancamento(idLancamento: string): Observable<LogData> {
    return this.httpClient.get<LogData>(this.urlApi + 'fichaAuxiliarHistorico/' + idLancamento);
  }
}
