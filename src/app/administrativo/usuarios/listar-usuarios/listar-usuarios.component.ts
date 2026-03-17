import { Component, OnInit } from '@angular/core';
import { Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiUsuarioService } from 'src/app/shared/services/api-usuario.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-listar-usuarios',
  templateUrl: './listar-usuarios.component.html',
  styleUrls: ['./listar-usuarios.component.scss'],
  standalone: false
})
export class ListarUsuariosComponent implements OnInit {
  public lstPerfis: Indicador[] = [];
  public lstUsuariosTodos: Usuario[] = [];
  public lstUsuariosFiltrado: Usuario[] = [];
  public idPerfilFiltro = 0;
  usuario: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private usuarioService: ApiUsuarioService,
    private indicadorService: ApiIndicadorService,
    private storage: StorageService,
    private _segurancaService: SegurancaCheckService) { }

  ngOnInit() {
    this.usuario = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);

    this.carregarListaUsuarios();
    this.populaListaPerfis();
  }

  carregarListaUsuarios() {
    this.usuarioService.ListarTodosUsuarios().subscribe((lstUsuarios) => {
      this.lstUsuariosTodos = lstUsuarios;
      this.lstUsuariosFiltrado = lstUsuarios;
    }, (error) => {
      console.log('Erro ao carregar lista de usuários:');
      console.log(error);
    });
  }

  populaListaPerfis() {
    this.indicadorService.listarTodosIndicadoresPorTipoSigla('TipoPerfil').subscribe(
    (lstPerfis) => {
      this.lstPerfis = lstPerfis;
    });
  }

  onChangeFiltrarIndicadoresPorTipo() {
    if (Number(this.idPerfilFiltro) === 0) {
      this.lstUsuariosFiltrado = this.lstUsuariosTodos;
    } else {
      this.lstUsuariosFiltrado = this.lstUsuariosTodos.filter(i => i.idTipoUsuario === Number(this.idPerfilFiltro));
    }
  }

}
