import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiUsuarioService } from '../services/api-usuario.service';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class EstaLogadoGuard implements CanActivate {
  constructor(
    public router: Router,
    private storage: StorageService,
    private apiUsuarioService: ApiUsuarioService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (
      next
      && next.queryParams
      && next.queryParams.token
      && next.queryParams.sistema
    ) {
      this.apiUsuarioService
        .verificarToken({
          chave: next.queryParams.token,
          nomeSistema: next.queryParams.sistema
        })
        .subscribe(x => {
          if (x) {
            this.storage.setUsuarioLogado(x);
            this.router.navigate(['inicio']);
            return true;
          } else {
            location.href = 'https://colaborador.sestsenat.org.br';
            return false;
          }
        }, () => {
          location.href = 'https://colaborador.sestsenat.org.br';
          return false;
        });
    } else {
      // Checa se existe algum localStorage, indicando que o cliente esta logado.
      const cliente = this.storage.getUsuarioLogado();
      if (cliente == null) {
        // Caso não tenha, redireciona para a tela de login
        this.router.navigate(['auth/login'], {
          // Pega a URL que o usuário tentou acessar, e passa para a página de login
          // Isso permite que o usuário volte para a tela que estava tentando acessar
          queryParams: {
            return: state.url
          }
        });
        return false;
      } else {
        return true;
      }
    }
  }
}
