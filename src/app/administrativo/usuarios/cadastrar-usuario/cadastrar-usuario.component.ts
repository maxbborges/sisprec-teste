import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InserirUsuario } from 'src/app/shared/models/commands/cmdUsuario';
import { Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiUsuarioService } from 'src/app/shared/services/api-usuario.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-cadastrar-usuario',
  templateUrl: './cadastrar-usuario.component.html',
  styleUrls: ['./cadastrar-usuario.component.scss'],
  standalone: false
})
export class CadastrarUsuarioComponent implements OnInit {
  public usuarioLogado: Usuario;
  public idTipoUsuarioFederacao = 0;

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
    private indicadorService: ApiIndicadorService,
    private _segurancaService: SegurancaCheckService
  ) {}

  ngOnInit() {
    this.usuarioLogado = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.inicializarFormulario();
    this.carregarTipoUsuario();
    this.carregarListaFederacoes();
    this.indicadorService.visualizarIndicadorPorSigla('UsuarioFederacao').subscribe((indicador) => {
      this.idTipoUsuarioFederacao = indicador.idIndicador;
    });
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.email]],
      senha: ['', [Validators.minLength(3), Validators.maxLength(100)]],
      idTipoUsuario: ['', [Validators.required]],
      permitirTrocaTipoUsuario: false,
      idFiliacao: ['']
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

  salvar() {
    if (this.formCadastro.valid) {
      const cmdInserirUsuario: InserirUsuario = this.formCadastro.value;
      cmdInserirUsuario.idUsuarioCadastro = this.usuarioLogado.idUsuario;
      this.usuarioService.InserirUsuario(cmdInserirUsuario).subscribe((data) => {
        if (data) {
          this.alertService.exibirAlerta('Usuário cadastrado com sucesso', tipo.sucesso);
          this.router.navigate(['administrativo/usuarios']);
        } else {
          this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o usuário', tipo.erro);
        }
      }, (error) => {
        console.log('Erro ao inserir Usuário:');
        console.log(error);
        this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o usuário', tipo.erro);
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
}
