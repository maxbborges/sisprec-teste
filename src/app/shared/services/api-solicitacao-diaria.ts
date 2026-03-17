import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import JSZip from "jszip";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AlterarSolicitacaoDiaria, AnaliseSolicitacaoDiaria, AnaliseSolicitacaoDiariaRequest, InserirSolicitacaoDiaria, PesquisarSolicitacaoDiariaCoordenador, PesquisarSolicitacaoDiariaUsuario, ResultadoSolicitacaoLocalidadeCoordenador, SolicitacaoDiariaCompletoPesquisa, SolicitacaoLocalidade } from "../models/commands/cmdSolicitacaoDiaria";

@Injectable({
  providedIn: "root",
})
export class ApiSolicitacaoDiaria {
  private urlApi = environment.urlApiSisprec + "solicitacaoDiaria/";
  private urlApiArquivo = environment.urlApiSisprec + 'arquivo/';
  constructor(private httpClient: HttpClient) {}

  public cadastrarSolicitacao(solicitacao:InserirSolicitacaoDiaria) {
    return this.httpClient.post<any>(this.urlApi + "inserirSolicitacao/", solicitacao);
  }

  public recuperarSolicitacaoPorId(idSolicitacao:string) : Observable<SolicitacaoDiariaCompletoPesquisa> {
    return this.httpClient.get<SolicitacaoDiariaCompletoPesquisa>(this.urlApi + "recuperarPorId/" + idSolicitacao);
  }

  public recuperarHistoricoPorId(idSolicitacao:string) : Observable<Array<AnaliseSolicitacaoDiaria>> {
    return this.httpClient.get<Array<AnaliseSolicitacaoDiaria>>(this.urlApi + "recuperarHistoricoPorId/" + idSolicitacao);
  }

  public cadastraAvaliacaoSolicitacao(analise:AnaliseSolicitacaoDiariaRequest) {
    return this.httpClient.post<any>(this.urlApi + "analisar/", analise);
  }

  public editarSolicitacao(solicitacao: AlterarSolicitacaoDiaria, idSolicitacao: string) {
    return this.httpClient.put<any>(this.urlApi + "alterarSolicitacao/" + idSolicitacao, solicitacao);
  }

  public excluirSolicitacao(idSolicitacao: string, idUsuario: number) {
    return this.httpClient.delete<any>(this.urlApi + "excluirSolicitacao/"+idUsuario+"/"+ idSolicitacao);
  }

  public listarSolicitacoesCoordenador(filtro: PesquisarSolicitacaoDiariaCoordenador): Observable<Array<ResultadoSolicitacaoLocalidadeCoordenador>> {
    return this.httpClient.post<Array<ResultadoSolicitacaoLocalidadeCoordenador>>(this.urlApi + "filtroCoordenador/", filtro);
  }

  public listarSolicitacoesPresidente(filtro: PesquisarSolicitacaoDiariaCoordenador): Observable<Array<ResultadoSolicitacaoLocalidadeCoordenador>> {
    return this.httpClient.post<Array<ResultadoSolicitacaoLocalidadeCoordenador>>(this.urlApi + "filtroPresidente/", filtro);
  }

  public listarSolicitacoesUsuario(filtro: PesquisarSolicitacaoDiariaUsuario, idUsuario: number): Observable<Array<ResultadoSolicitacaoLocalidadeCoordenador>> {
    return this.httpClient.post<Array<ResultadoSolicitacaoLocalidadeCoordenador>>(this.urlApi + "filtroUsuario/" + idUsuario, filtro);
  }

  public recuperarLocalidades(): Observable<Array<SolicitacaoLocalidade>> {
    return this.httpClient.get<Array<SolicitacaoLocalidade>>(this.urlApi + "recuperarLocalidades/");
  }

  public verificarAcessoVisualizacaoSolicitacao(idSolicitacao:string, idUsuario: number) : Observable<boolean> {
    return this.httpClient.get<boolean>(this.urlApi + "verificarAcesso/" + idSolicitacao + "/" + idUsuario);
  }

  public gerarPDF(idSolicitacao:string){
    return this.httpClient.get<any[]>(this.urlApiArquivo + 'solicitacao-diaria/'+ idSolicitacao).subscribe((res) => {
      const zip = new JSZip();
      for(var i in res){
        zip.file(res[i].nomeArquivo, res[i].binario, {base64: true});
      }

      zip.generateAsync({type: 'blob'}).then((content) => {
        const objectUrl: string = URL.createObjectURL(content);
        const link: any = document.createElement('a');

        link.download = 'solicitacao-diaria.zip';
        link.href = objectUrl;
        link.click();
      });

      return res;
    });
  }
}