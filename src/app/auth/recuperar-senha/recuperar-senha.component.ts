import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecuperarSenhaUsuario } from 'src/app/shared/models/commands/cmdUsuario';
import { ApiUsuarioService } from 'src/app/shared/services/api-usuario.service';

@Component({
  selector: 'app-recuperar-senha',
  templateUrl: './recuperar-senha.component.html',
  styleUrls: ['./recuperar-senha.component.scss'],
  standalone: false
})
export class RecuperarSenhaComponent implements OnInit {

  public form: FormGroup;

  constructor(private _fb: FormBuilder,
              private usuarioService: ApiUsuarioService,) { }

  inicializarFormulario(){
    this.form = this._fb.group({
      email: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.inicializarFormulario();
  }

  recuperarSenha(){
    if(this.form.valid){
      const usuario = this.form.value as RecuperarSenhaUsuario;

      this.usuarioService.RecuperarSenhaUsuario(usuario).subscribe(data => {
        window.alert('Um e-mail com a senha foi enviado para o endereço ' + usuario.email)
      }, error => {
        // You can access status:
        window.alert(error.error)
      });
    }
    else {
      window.alert("Insira um endereço de e-mail")
    }
  }

}
