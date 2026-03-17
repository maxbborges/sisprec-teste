import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AlterarMotivoLancamento, ListarItensLancamentoFiltrado, ListarLancamentoSaidaItem } from '../models/commands/cmdItensLancamento';
import { InserirLancamentoSaidaItem, LancamentoDespesa } from '../models/commands/cmdLancamento';
import { ItemLancamento } from '../models/responses/sisprec-response';

@Injectable({
  providedIn: 'root'
})
export class ApiItemLancamentoService {
  private urlApi = environment.urlApiSisprec + 'itemLancamento/';

  constructor(private httpClient: HttpClient) { }

  // public listarItensLancamentoFiltrado(filtros: ListarItensLancamentoFiltrado): Observable<ItemLancamento[]> {
  //   return this.httpClient.get<ItemLancamento[]>(this.urlApi + 'listarItensFiltrado');
  // }
  // alterado por Flavio
  public listarItensLancamentoFiltrado(filtros: ListarItensLancamentoFiltrado): Observable<ItemLancamento[]> {
    return this.httpClient.post<ItemLancamento[]>(this.urlApi + 'listarItensFiltrado', filtros);
  }

  public listarLancamentoSaidaItem(filtros: ListarLancamentoSaidaItem): Observable<LancamentoDespesa[]>{
    return this.httpClient.post<LancamentoDespesa[]>(this.urlApi + 'ListarLancamentoSaidaItem', filtros);
  }

  public inserirLancamentoSaidaItem(lancamento: InserirLancamentoSaidaItem): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'inserirLancamentoSaidaItem', lancamento);
  }
  public getLancamentoSaidaItem(idlancamento: string,idTipoComprovante: number, numeroComprovante:string, dataComprovante: string, idFederacao: number): Observable<any> {
    numeroComprovante = btoa(numeroComprovante);
    var url = this.urlApi + 'LancamentoSaidaItem/'+idlancamento+'/'+idTipoComprovante+'/'+numeroComprovante+'/'+dataComprovante+'/'+idFederacao;
    return this.httpClient.get<any[]>(url);
  }

  public excluirLancamentoSaidaItem(idLancamentoSaidaItem: number, idUsuario: number): Observable<any> {
    return this.httpClient.get<any>(this.urlApi + 'excluirLancamentoSaidaItem/' + idLancamentoSaidaItem+ '/' + idUsuario);
  }

  public alterarAnalise(idItemLancamento: number, idAnalise: number, idUsuario: number): Observable<any> {
    return this.httpClient.get<any>(this.urlApi + 'alterarAnaliseLancamento/' + idItemLancamento + '/' + idAnalise+ '/' + idUsuario);
  }
  public alterarAnaliseDespesa(idLancamento: string,idItemLancamento: number, idAnalise: number, idUsuario: number): Observable<any> {
    return this.httpClient.get<any>(this.urlApi + 'alterarAnaliseLancamento/' + idLancamento + '/' + idItemLancamento + '/' + idAnalise+ '/' + idUsuario);
  }
  public alterarMotivoRetornoParaAjustes(idLancamento: number, idMotivo: number, idUsuario: number): Observable<any> {
    return this.httpClient.get<any>(this.urlApi + 'alterarMotivoRetornoParaAjustes/' + idLancamento + '/' + idMotivo + '/' + idUsuario);
  }

  public alterarMotivoRetornoParaAjustesItemLancamento(AlterarMotivoLancamento: AlterarMotivoLancamento): Observable<any>{
    return this.httpClient.post<any>(this.urlApi + 'alterarMotivoRetornoParaAjustes/', AlterarMotivoLancamento);
  }

  public alterarObservacaoRetornoParaAjustesItemLancamento(idLancamento: string, idItemLancamento: number, observacao: string, idUsuario: number): Observable<any>{
    return this.httpClient.post<any>(this.urlApi + 'alterarObservacaoRetornoParaAjustes/' + idLancamento + '/' + idItemLancamento, {observacao: observacao, idUsuario: idUsuario });
  }
}
