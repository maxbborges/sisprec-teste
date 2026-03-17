import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { TipoUsuario } from './../models/responses/sisprec-response';

@Injectable({
  providedIn: 'root'
})
export class EhDesenvolvedorGuard implements CanActivate {
  constructor(public router: Router, private storage: StorageService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const usuario = this.storage.getUsuarioLogado();
    if (usuario.tipoUsuarioSigla.toLocaleUpperCase() === TipoUsuario.Desenvolvedor.toLocaleUpperCase()
      || usuario.tipoUsuarioSigla.toLocaleUpperCase() === TipoUsuario.GestorFiscal.toLocaleUpperCase()
      || usuario.tipoUsuarioSigla.toLocaleUpperCase() === TipoUsuario.Auditoria.toLocaleUpperCase()
      || usuario.tipoUsuarioSigla.toLocaleUpperCase() === TipoUsuario.ConferenciaDocumentacao.toLocaleUpperCase()) {
      return true;
    } else {
      window.alert('Você não tem permissão para acessar esta página.');
      return false;
    }
  }

}
