import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Indicador, IndicadorTipo, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiIndicadorTipoService } from 'src/app/shared/services/api-indicador-tipo.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';

@Component({
  selector: 'app-listar-indicadores',
  templateUrl: './listar-indicadores.component.html',
  styleUrls: ['./listar-indicadores.component.scss'],
  standalone: false
})
export class ListarIndicadoresComponent implements OnInit {
  public lstIndicadoresTipo: IndicadorTipo[] = [];
  public lstIndicadoresTodos: Indicador[] = [];
  public lstIndicadoresFiltrado: Indicador[] = [];
  public idIndicadorTipoFiltro = 0;

  usuario: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private indicadorService: ApiIndicadorService,
    private indicadorTipoService: ApiIndicadorTipoService,
    private _segurancaService: SegurancaCheckService) {
    if (localStorage.userSisprec) {
      this.usuario = JSON.parse(localStorage.userSisprec);
    }
  }

  ngOnInit() {
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);
    this.carregarListaIndicadores();
    this.populaListaTiposIndicadores();
  }

  carregarListaIndicadores() {
    this.indicadorService.listarTodosIndicadores()
      .pipe(map(x => x.filter(y => {
        if (this.usuario.idTipoUsuario === 5 || this.usuario.idTipoUsuario === 6) {
          return y.idIndicadorTipo === 1007;
        } else {
          return y;
        }
      })))
      .subscribe(
        (lstIndicadores) => {
          this.lstIndicadoresTodos = lstIndicadores;
          this.lstIndicadoresFiltrado = lstIndicadores;
        }, (error) => {
          console.log('Ocorreu um erro ao carregar a lista de indicadores:');
          console.log(error);
        });
  }

  populaListaTiposIndicadores() {
    this.indicadorTipoService.listarTodosIndicadoresTipo()
      .pipe(map(x => x.filter(y => {
        if (this.usuario.idTipoUsuario === 5 || this.usuario.idTipoUsuario === 6) {
          return y.idIndicadorTipo === 1007;
        } else {
          return y;
        }
      })))
      .subscribe(
        (lstIndicadoresTipo) => {
          this.lstIndicadoresTipo = lstIndicadoresTipo;
        });
  }

  onChangeFiltrarIndicadoresPorTipo() {
    if (Number(this.idIndicadorTipoFiltro) === 0) {
      this.lstIndicadoresFiltrado = this.lstIndicadoresTodos;
    } else {
      this.lstIndicadoresFiltrado = this.lstIndicadoresTodos.filter(i => i.idIndicadorTipo === Number(this.idIndicadorTipoFiltro));
    }
  }

}
