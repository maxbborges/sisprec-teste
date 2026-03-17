import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AnalisarRelatorioViagens, EditarRelatorioViagens, HistoricoRelatorioViagens, InserirRelatorioViagens, ListagemRelatorioViagens, PesquisarRelatorioViagensCoordenador, PesquisarRelatorioViagensTecnico } from '../models/commands/cmdRelatorioViagens';

@Injectable({
  providedIn: 'root'
})
export class ApiRelatorioViagensService {
  private urlApi = environment.urlApiSisprec + 'relatorioViagens/';
  private urlApiArquivo = environment.urlApiSisprec + 'arquivo/';

  constructor(private httpClient: HttpClient) { }

  public inserirRelatorioViagens(dados: InserirRelatorioViagens): Observable<string> {
    return this.httpClient.post<string>(this.urlApi + 'inserirRelatorio', dados);
  }

  public alterarRelatorioViagens(dados: EditarRelatorioViagens): Observable<string> {
    return this.httpClient.post<string>(this.urlApi + 'alterarRelatorio', dados);
  }

  public pesquisarRelatorioViagensTecnico(dados: PesquisarRelatorioViagensTecnico): Observable<Array<ListagemRelatorioViagens>> {
    return this.httpClient.post<Array<ListagemRelatorioViagens>>(this.urlApi + 'listarRelatorioTecnico', dados);
  }

  public pesquisarRelatorioViagensCoordenador(dados: PesquisarRelatorioViagensCoordenador): Observable<Array<ListagemRelatorioViagens>> {
    return this.httpClient.post<Array<ListagemRelatorioViagens>>(this.urlApi + 'listarRelatorioCoordenador', dados);
  }

  public excluirRelatorioViagens(idRelatorioViagens: string): Observable<string>{
    return this.httpClient.delete<string>(this.urlApi + 'excluirRelatorio/'+ idRelatorioViagens);
  }

  public recuperarRelatorioPorId(idRelatorioViagens: string): Observable<ListagemRelatorioViagens>{
    return this.httpClient.get<ListagemRelatorioViagens>(this.urlApi + 'buscarRelatorioPorId/'+ idRelatorioViagens);
  }

  public recuperarHistoricoPorId(idRelatorioViagens: string): Observable<Array<HistoricoRelatorioViagens>>{
    return this.httpClient.get<Array<HistoricoRelatorioViagens>>(this.urlApi + 'buscarHistoricoRelatorioPorId/'+ idRelatorioViagens);
  }

  public analisarRelatorio(dados: AnalisarRelatorioViagens): Observable<string>{
    return this.httpClient.post<string>(this.urlApi + 'analisarRelatorio', dados);
  }

  public gerarPDF(idRelatorio:string){
    return this.httpClient.get<any[]>(this.urlApiArquivo + 'relatorio-solicitacao/'+ idRelatorio).subscribe((res) => {
      const zip = new JSZip();

      for(var i in res){
        zip.file(res[i].nomeArquivo, res[i].binario, {base64: true});
      }

      zip.generateAsync({type: 'blob'}).then((content) => {
        const objectUrl: string = URL.createObjectURL(content);
        const link: any = document.createElement('a');

        link.download = 'relatorio-viagem.zip';
        link.href = objectUrl;
        link.click();
      });

      return res;
    });
  }
}