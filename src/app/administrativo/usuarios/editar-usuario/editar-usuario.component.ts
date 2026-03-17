import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlterarUsuario, ResetarSenhaUsuario } from 'src/app/shared/models/commands/cmdUsuario';
import { Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiUsuarioService } from 'src/app/shared/services/api-usuario.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.scss'],
  standalone: false
})
export class EditarUsuarioComponent implements OnInit {
  public usuarioLogado: Usuario;
  public idTipoUsuarioFederacao = 0;

  public usuario: Usuario;
  public formCadastro: FormGroup;
  public lstTipoUsuario: Indicador[] = [];
  public lstFederacoes: Indicador[] = [];
  acaoBloqueada: boolean = false;

  constructor(
    private storage: StorageService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private usuarioService: ApiUsuarioService,
    private router: Router,
    private route: ActivatedRoute,
    private indicadorService: ApiIndicadorService,
    private m: ModalService,
    private _segurancaService: SegurancaCheckService
  ) {}

  ngOnInit() {
    this.usuarioLogado = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.inicializarFormulario();
    this.carregarTipoUsuario();
    this.carregarListaFederacoes();
    this.carregarDadosUsuario(this.route.snapshot.params.idUsuario);
    this.indicadorService.visualizarIndicadorPorSigla('UsuarioFederacao').subscribe((indicador) => {
      this.idTipoUsuarioFederacao = indicador.idIndicador;
    });
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      idUsuario: ['', [Validators.required]],
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.email]],
      senha: [''],
      idTipoUsuario: ['', [Validators.required]],
      permitirTrocaTipoUsuario: false,
      idFiliacao: ['']
    });
  }

  carregarDadosUsuario(idUsuario: number) {
    this.usuarioService.VisualizarUsuario(idUsuario).subscribe((usuario) => {
      this.usuario = usuario;
    }, (error) => {
      console.log('Erro ao carregar os dados do usuário:');
      console.log(error);
    }, () => {
      this.preencheDadosFormulario();
    });
  }

  preencheDadosFormulario() {
    this.formCadastro.patchValue({
      idUsuario: this.usuario.idUsuario,
      nome: this.usuario.nome,
      email: this.usuario.email,
      idTipoUsuario: this.usuario.idTipoUsuario,
      permitirTrocaTipoUsuario: this.usuario.permitirTrocaTipoUsuario,
      idFiliacao: this.usuario.idFiliacao
    });
  }

  carregarTipoUsuario() {
    this.indicadorService.listarTodosIndicadoresPorTipoSigla('TipoPerfil').subscribe((lstTipoUsuario) => {
      this.lstTipoUsuario = lstTipoUsuario;
    }, (error) => {
      console.log('Erro ao carregar lista de tipo de usuário:');
      console.log(error);
    });
  }

  carregarListaFederacoes() {
    this.indicadorService.listarTodosIndicadoresPorTipoSigla('Federacao').subscribe((lstFederacoes) => {
      this.lstFederacoes = lstFederacoes;
    }, (error) => {
      console.log('Erro ao carregar lista de federações:');
      console.log(error);
    });
  }

  alterarSenha(cmdAlterarUsuario: any){
    if(cmdAlterarUsuario.idTipoUsuario === 4 && cmdAlterarUsuario.senha != ''){
      const cmdResetarSenhaUsuario = {
        idUsuario: cmdAlterarUsuario.idUsuario,
        novaSenha: cmdAlterarUsuario.senha
      } as ResetarSenhaUsuario;
      this.usuarioService.ResetarSenhaUsuario(cmdResetarSenhaUsuario).subscribe(data => {
      }, error => {
        console.log("Erro ao alterar senha")
      })
    }
  }

  salvar() {

    if (this.formCadastro.valid) {
      const cmdAlterarUsuario: AlterarUsuario = this.formCadastro.value;
      cmdAlterarUsuario.idUsuarioAlteracao = this.usuarioLogado.idUsuario;
      this.usuarioService.AlterarUsuario(cmdAlterarUsuario).subscribe((data) => {
        if (data) {
          this.alterarSenha(cmdAlterarUsuario);
          if (this.usuarioLogado.idUsuario === this.usuario.idUsuario) {
            if (this.v.permitirTrocaTipoUsuario) {
              this.usuarioLogado.permitirTrocaTipoUsuario = true;
              this.storage.setUsuarioLogado(this.usuarioLogado);
            } else {
              this.usuario.permitirTrocaTipoUsuario = false;
              this.storage.setUsuarioLogado(this.usuario);
            }
          }
          this.m.alert('Usuário alterado com sucesso.', 'Sucesso', 's')
            .subscribe(() => this.router.navigate(['administrativo/usuarios']));
        } else {
          this.alertService.exibirAlerta('Ocorreu um erro ao alterar o usuário', tipo.erro);
        }
      }, (error) => {
        console.log('Erro ao alterar Usuário:');
        console.log(error);
        this.alertService.exibirAlerta('Ocorreu um erro ao alterar o usuário', tipo.erro);
      });
    } else {
      this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios', tipo.atencao);
    }
  }

  colocarPermitirTrocaTipoUsuarioFalso() {
    if (this.v.idTipoUsuario != 35 || this.v.idTipoUsuario != 5) {
      this.c.permitirTrocaTipoUsuario.setValue(false);
    }
  }

  get c() {
    return this.formCadastro.controls;
  }

  get v() {
    return this.formCadastro.value;
  }

  buscarTipoUsuario(idTipoUsuario: number) {
    return this.lstTipoUsuario.find(x => x.idIndicador === idTipoUsuario);
  }
}
