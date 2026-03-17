import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

import { ListarVisita } from 'src/app/shared/models/commands/cmdVisita';
import { Indicador, Usuario, Visita } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiVisitaService } from 'src/app/shared/services/api-visita.service';
import { StorageService } from 'src/app/shared/services/storage.service';




@Component({
  selector: 'app-visualizar-extrato-conta-corrente',
  templateUrl: './visualizar-relatorios-visita-tecnica.component.html',
  styleUrls: ['./visualizar-relatorios-visita-tecnica.component.scss'],
  standalone: false
})
export class VisualizarRelatoriosVisitaTecnicaComponent implements OnInit {
  public usuarioLogado: Usuario;
  public idTipoConta = 0;
  public saldoAtual = 0;
  public msg = 'Selecione os filtros';
  public loading = false;
  public podeEditar = true;
  public saldoAnterior = 0;
  public saldoParaConta = 0;

  // Filtros
  public filtroAno = 0;
  public filtroMes = 0;
  public filtroIdFederacao = 0;
  public lstFederacoes: Indicador[] = [];
  public lstVisitas: Visita[] = [];

  public urlDownload = environment.urlApiSisprec + 'arquivo/porId/';
  acaoBloqueada: boolean = false;
  public isPerfilAuditoria = false;

  constructor(
    private storageService: StorageService,
    private apiIndicadorService: ApiIndicadorService,
    private apiVisitaService: ApiVisitaService,
    private alertService: AlertService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.podeEditar = this.usuarioLogado.idTipoUsuario === environment.idPerfilTipoAuditoria ? false : true;
    this.carregarListaFederacoes();

    this.obterFiltro();

  }

  obterFiltro() {
    this.route.queryParams
      .subscribe(params => {
        if (JSON.stringify(params) !== '{}') {
          this.filtroAno = params.ano;
          this.filtroMes = params.mes;
          this.filtroIdFederacao = params.idFederacao;
        }

        if (this.filtroAno > 0 && this.filtroMes > 0 && this.filtroIdFederacao > 0)
          this.carregarVisitas();
      });
  }

  carregarVisitas() {

    const filtroVisita: ListarVisita = {
      ano: this.filtroAno,
      idFederacao: this.filtroIdFederacao,
      mes: this.filtroMes > 0 ? this.filtroMes : null
    };
    this.loading = true;

    this.apiVisitaService.listarVisitas(filtroVisita).subscribe((lstVisitas) => {
      this.lstVisitas = lstVisitas;

      this.alterarUrl();

      if (this.lstVisitas.length > 0)
        this.msg = "";
      else
        this.msg = "Nenhum registro encontrado";

      this.loading = false;

    }, (error) => {
      this.msg = "Erro ao carregar lista de visitas";
      console.log('Erro ao carregar lista de visitas:');
      console.log(error);
      this.loading = false;
    });
  }

  excluirVisita(idVisita) {

    if (confirm('Deseja realmente excluir o Relatório de visita técnica?')) {

      this.apiVisitaService.apagarVisita(idVisita).subscribe((data) => {

        if (data) {
          this.alertService.exibirAlerta('Relatório de visita técnica apagado com sucesso', tipo.sucesso);
          this.ngOnInit();
        } else {
          this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o relatório de visita técnica', tipo.erro);
        }
      }, (error) => {
        console.log('Erro ao apagar relatório de visita lista de visitas:');
        console.log(error);
      });
    }
  }

  carregarListaFederacoes() {
    this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('Federacao').subscribe((lstFederacoes) => {
      this.lstFederacoes = lstFederacoes;
    }, (error) => {
      console.log('Erro ao carregar lista de federações:');
      console.log(error);
    });
  }

  alterarUrl() {
    const filtro = 'ano=' + this.filtroAno + '&mes=' + this.filtroMes + '&idFederacao=' + this.filtroIdFederacao;
    this.location.go('/visitaTecnica/listarRelatorioVisitaTecnica/', filtro);
  }

  cadastrarLancamento() {
    this.router.navigate(['gestaoFinanceira/conta-corrente/cadastrarLancamento'])
  }

}
