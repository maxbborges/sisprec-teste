import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import {
  ListarExtratoFiltrado, RelatorioDespesaFiltros, RelatorioHistoricoDespesa, RelatorioHistoricoDocumentacao
} from "../models/commands/cmdLancamento";
import {
  CategoriasParaRelatorio, RelatorioDespesa,
  RelatorioHistoricoPrestacaoContasDespesa,
  RelatorioHistoricoPrestacaoContasDocumentacao,
  RelatorioPrestacaoContasResponse
} from "../models/responses/sisprec-response";

@Injectable({
  providedIn: "root",
})
export class ApiRelatorioService {
  private urlApi = environment.urlApiSisprec + "relatorios/";

  constructor(private httpClient: HttpClient) {}

  public buscarLancamentosRelatorioCC(
    filtro: ListarExtratoFiltrado
  ): Observable<any> {
    return this.httpClient.post<any[]>(
      this.urlApi + "obterLancamentosCC",
      filtro
    );
  }

  public listarAnosDespesa() {
    return this.httpClient.get<any>(this.urlApi + "listaAnoDespesas");
  }

  public visualizarRelatorioPrestacaoContas(
    mesExercicio: number,
    anoExercicio: number,
    idFederacao: number
  ): Observable<RelatorioPrestacaoContasResponse> {
    return this.httpClient.get<RelatorioPrestacaoContasResponse>(
      `${this.urlApi}relatorio-prestacao-contas/${mesExercicio}/${anoExercicio}/${idFederacao}`
    );
  }

  public buscarRelatorioDespesa(
    filtro: RelatorioDespesaFiltros
  ): Observable<RelatorioDespesa[]> {
    return this.httpClient.post<RelatorioDespesa[]>(
      this.urlApi + "despesas",
      filtro
    );
  }

  public buscarListaCategorias(
    anoExercicio: number
  ): Observable<CategoriasParaRelatorio[]> {
    return this.httpClient.get<CategoriasParaRelatorio[]>(
      `${this.urlApi}listarCategorias/${anoExercicio}`
    );
  }

  public buscarRelatorioDocumentacao(
    filtro: RelatorioHistoricoDocumentacao
  ): Observable<RelatorioHistoricoPrestacaoContasDocumentacao[]> {
    return this.httpClient.post<
      RelatorioHistoricoPrestacaoContasDocumentacao[]
    >(this.urlApi + "relatorioPrestacaoContasDocumentacao", filtro);
  }

  public buscarRelatorioHistoricoDespesa(
    filtro: RelatorioHistoricoDespesa
  ): Observable<RelatorioHistoricoPrestacaoContasDespesa[]> {
    return this.httpClient.post<RelatorioHistoricoPrestacaoContasDespesa[]>(
      this.urlApi + "relatorioPrestacaoContasDespesas",
      filtro
    );
  }
}
