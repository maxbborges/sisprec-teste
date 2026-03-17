import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  AlterarSenhaUsuario, AlterarUsuario,
  DesativarUsuario, InserirUsuario, LoginUsuario, RecuperarSenhaUsuario, ResetarSenhaUsuario, Token
} from '../models/commands/cmdUsuario';
import { Usuario } from '../models/responses/sisprec-response';

@Injectable({
  providedIn: 'root'
})
export class ApiUsuarioService {
  private urlApi = environment.urlApiSisprec + 'usuario/';

  constructor(private httpClient: HttpClient) { }

  public VisualizarUsuario(idUsuario: number): Observable<Usuario> {
    return this.httpClient.get<Usuario>(this.urlApi + 'porId/' + idUsuario);
  }

  public ListarTodosUsuarios(): Observable<Usuario[]> {
    return this.httpClient.get<Usuario[]>(this.urlApi + 'listarTodos');
  }

  public LoginUsuario(usuario: LoginUsuario): Observable<Usuario> {
    return this.httpClient.post<Usuario>(this.urlApi + 'login', usuario);
  }

  public InserirUsuario(usuario: InserirUsuario): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'inserirUsuario', usuario);
  }

  public AlterarUsuario(usuario: AlterarUsuario): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'alterarUsuario', usuario);
  }

  public DesativarUsuario(usuario: DesativarUsuario): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'desativarUsuario', usuario);
  }

  public ResetarSenhaUsuario(usuario: ResetarSenhaUsuario): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'resetarSenhaUsuario', usuario);
  }

  public RecuperarSenhaUsuario(usuario: RecuperarSenhaUsuario): Observable<any> {
    return this.httpClient.post<any>(this.urlApi + 'recuperarSenhaUsuario', usuario);
  }

  public alterarSenhaUsuario(usuario: AlterarSenhaUsuario): Observable<boolean> {
    return this.httpClient.post<boolean>(this.urlApi + 'alterarSenhaUsuario', usuario);
  }

  public verificarToken(token: Token): Observable<Usuario> {
    return this.httpClient.post<Usuario>(`${this.urlApi}verificar-token`, token);
  }

}
