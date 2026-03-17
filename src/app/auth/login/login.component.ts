import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiUsuarioService } from 'src/app/shared/services/api-usuario.service';
import { GoogleAnalyticsService } from 'src/app/shared/services/google-analytics.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { LoginUsuario } from '../../shared/models/commands/cmdUsuario';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  public formLogin: FormGroup;
  public erro = false;
  public msg: string;
  public msgs: string[];
  public urlARedirecionar = '';

  constructor(
    protected fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiUsuario: ApiUsuarioService,
    private storage: StorageService,
    private googleAnalytics: GoogleAnalyticsService
  ) {}

  ngOnInit() {
    this.inicializaFormulario();
    this.capturaUrlTentandoAcessar();
  }

  inicializaFormulario() {
    this.formLogin = this.fb.group({
      usuario: ['', [Validators.required]],
      senha: ['', [Validators.required]]
    });
  }

  capturaUrlTentandoAcessar() {
    this.route.queryParams.subscribe(
      params => (this.urlARedirecionar = params.return || 'inicio')
    );
  }

  realizarLogin() {
    if (this.formLogin.invalid) {
      return;
    }

    this.apiUsuario.LoginUsuario
      ({
        usuario: this.formLogin.value.usuario,
        senha: this.formLogin.value.senha
      } as LoginUsuario)
      .subscribe(
        data => {
          if (data == null) {
            console.log('Ocorreu um erro!!');
          } else if (data.alterarSenhaProximoAcesso && !data.logouComSenhaMestre) {
            this.storage.setUsuarioLogado(data);
            this.router.navigate(['/alterar-senha', { id: data.idUsuario }]);
          } else {
            this.storage.setUsuarioLogado(data);
            this.router.navigateByUrl(this.urlARedirecionar);
          }
        },
        error => {
          this.erro = true;
          this.msg =
            error.error +
            ' Favor conferir se o usuário e a senha respeitam letras maiúsculas e minúsculas.';
          this.googleAnalytics.eventEmitter('Auth', 'Login', '[Erro] ' + error.error);
          this.formLogin.reset();
        }
      );
  }
}
