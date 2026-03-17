import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { ApiUsuarioService } from 'src/app/shared/services/api-usuario.service';
import { AppUtil } from 'src/app/shared/utils/app.util';
import { CamposValidator } from 'src/app/shared/validators/campos.validator';

@Component({
  selector: 'app-trocar-senha',
  templateUrl: './trocar-senha.component.html',
  styleUrls: ['./trocar-senha.component.scss'],
  standalone: false
})
export class TrocarSenhaComponent implements OnInit {

  enviando = false;
  fgAlteracaoSenha: FormGroup;
  usuario: Usuario;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private apiUsuarioService: ApiUsuarioService,
    private router: Router
  ) { }

  ngOnInit() {

    if (localStorage.userSisprec) {
      this.usuario = JSON.parse(localStorage.userSisprec);
    }

    AppUtil.focalizarCampo('idSenhaAntiga');

    this.fgAlteracaoSenha = this.fb.group({
      idUsuario: this.usuario.idUsuario,
      senhaAtual: ['', Validators.required],
      novaSenha: ['', Validators.required],
      novaSenhaConfirmacao: ['', Validators.required]
    },
      {
        validator: [
          CamposValidator.diferentes('senhaAtual', 'novaSenha'),
          CamposValidator.iguais('novaSenha', 'novaSenhaConfirmacao')
        ]
      }
    );

  }

  get c() {

    return this.fgAlteracaoSenha.controls;

  }

  alterar() {

    this.enviando = true;

    if (this.fgAlteracaoSenha.invalid) {
      return;
    }

    this.fgAlteracaoSenha.disable();

    this.apiUsuarioService.alterarSenhaUsuario(this.fgAlteracaoSenha.value)
      .subscribe(
        () => {
          alert('Senha alterada com sucesso.');
          this.router.navigate(['/inicio']);
        },
        e => {
          alert(e.error);
          this.ok();
        }
      );

  }

  ok() {

    this.fgAlteracaoSenha.enable();
    this.enviando = false;
    AppUtil.focalizarCampo('idSenhaAntiga');

  }

  cancelar() {

    if (confirm('Deseja cancelar?')) {
      this.router.navigate(['/inicio']);
    }

  }

}
