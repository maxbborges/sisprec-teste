import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Usuario } from '../models/responses/sisprec-response';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private nomeStorageUsuario = environment.nomeStorageUsuario;

  // =============== Salvar item ===============
  setJsonSessionStorage(nomeChave: string, valor: any) {
    this.setItemSessionStorage(nomeChave, JSON.stringify(valor));
  }

  setJsonLocalStorage(nomeChave: string, valor: any) {
    this.setItemLocalStorage(nomeChave, JSON.stringify(valor));
  }

  setItemSessionStorage(nomeChave: string, valor: string) {
    sessionStorage.setItem(nomeChave, valor);
  }

  setItemLocalStorage(nomeChave: string, valor: string) {
    localStorage.setItem(nomeChave, valor);
  }

  setUsuarioLogado(usuario: Usuario) {
    usuario.ehDex = this.verificaUsuarioEhDoDex(usuario.idTipoUsuario);
    usuario.ehDesenvolvedor = this.verificaUsuarioEhDesenvolvedor(usuario.idTipoUsuario);
    this.setJsonLocalStorage(this.nomeStorageUsuario, usuario);
  }

  // =============== Visualizar item ===============
  getItemSessionStorage(nomeChave: string): string {
    return sessionStorage.getItem(nomeChave);
  }

  getItemLocalStorage(nomeChave: string): string {
    return localStorage.getItem(nomeChave);
  }

  getJsonSessionStorage(nomeChave: string): any {
    return JSON.parse(this.getItemSessionStorage(nomeChave));
  }

  getJsonLocalStorage(nomeChave: string): any {
    return JSON.parse(this.getItemLocalStorage(nomeChave));
  }

  getUsuarioLogado(): Usuario {
    return this.getJsonLocalStorage(this.nomeStorageUsuario) as Usuario;
  }

  // =============== Deletar item ===============
  deleteItemSessionStorage(nomeChave: string) {
    sessionStorage.removeItem(nomeChave);
  }

  deleteItemLocalStorage(nomeChave: string) {
    localStorage.removeItem(nomeChave);
  }

  // =============== Limpar tudo ===============
  limparSessionStorage() {
    sessionStorage.clear();
  }

  limparLocalStorage() {
    localStorage.clear();
  }

  limparStorage() {
    this.limparSessionStorage();
    this.limparLocalStorage();
  }

  // =============== Métodos privados ===============
  private verificaUsuarioEhDesenvolvedor(idPerfilUsuario: number): boolean {
    return idPerfilUsuario === environment.idPerfilDesenvolvedor ? true : false;
  }

  private verificaUsuarioEhDoDex(idPerfilUsuario: number): boolean {
    return environment.idsPerfisDex.includes(idPerfilUsuario) ? true : false;
  }
}
