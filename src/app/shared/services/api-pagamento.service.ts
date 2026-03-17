import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { CommandEnviarPagamento, CommandPagamentoRepasseFinanceiro, CommandPesquisarPagamento, ListaPagamentos, PagamentoData } from "../models/commands/cmdPagamento";

@Injectable({
  providedIn: 'root'
})
export class ApiPagamentoService {

  private urlApi = `${environment.urlApiSisprec}pagamento/`;
  constructor(private httpClient: HttpClient) { }

  public inserirPagamentoRepasseFinanceiro(pagamento: CommandPagamentoRepasseFinanceiro): Observable<any> {
    return this.httpClient.post<any>(this.urlApi + 'repasse-financeiro', pagamento);
  }

  public alterarPagamentoRepasseFinanceiro(pagamento: CommandPagamentoRepasseFinanceiro): Observable<any> {
    return this.httpClient.put<any>(this.urlApi + 'repasse-financeiro', pagamento);
  }

  public enviarPagamentoProtheus(pagamento: CommandEnviarPagamento): Observable<any> {
    return this.httpClient.post<any>(this.urlApi + 'enviar-protheus', pagamento);
  }

  public pesquisarPagamentos(filtros: CommandPesquisarPagamento): Observable<ListaPagamentos[]> {
    return this.httpClient.post<ListaPagamentos[]>(this.urlApi + 'pesquisar', filtros);
  }

  public buscarPagamentoById(idPagamento: string): Observable<PagamentoData> {
    return this.httpClient.get<PagamentoData>(this.urlApi + 'buscar/' + idPagamento);
  }
  public excluirPagamentoById(pagamento: CommandEnviarPagamento): Observable<any> {
    return this.httpClient.post<any>(this.urlApi + '/excluir/' + pagamento.idPagamento, pagamento);
  }
}
