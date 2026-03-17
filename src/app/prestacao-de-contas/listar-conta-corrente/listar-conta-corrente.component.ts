import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { StorageService } from 'src/app/shared/services/storage.service';

import { Location } from '@angular/common';
import { ListarExtratoFiltrado } from 'src/app/shared/models/commands/cmdLancamento';
import { FiltroDetalhePrestacaoContas } from 'src/app/shared/models/responses/sisprec-response';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ExcelService } from 'src/app/shared/services/excel.service';


@Component({
  selector: 'app-listar-conta-corrente',
  templateUrl: './listar-conta-corrente.component.html',
  styleUrls: ['./listar-conta-corrente.component.scss'],
  standalone: false
})
export class ListarContaCorrenteComponent implements OnInit {

  public mes = 0;
  public ano = 0;
  public tipoConta: string;
  public status: string;
  public versaoStatus: number;
  public usuario: any;
  public idFederacao: number;
  public saldoAnterior = 0;
  public msg: 'Nenhum registro encontrado';

  public lstItemPrestacaoCC: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private prestacaoService: ApiPrestacaoContasService,
    private storageService: StorageService,
    private excelService: ExcelService,
    private lancamentoService: ApiLancamentoService,
    private location: Location
  ) { }

  ngOnInit() {
    this.usuario = this.storageService.getUsuarioLogado();
    this.mes = this.route.snapshot.params.mes;
    this.ano = this.route.snapshot.params.ano;
    this.tipoConta = this.route.snapshot.params.tipoconta;
    this.status = this.route.snapshot.params.status;
    this.idFederacao = this.route.snapshot.params.idFederacao;


    this.carregarLancamentosDetalheCC();
  }

  carregarLancamentosDetalheCC() {

    const filtro: FiltroDetalhePrestacaoContas = {
      mesExercicio: this.mes,
      anoExercicio: this.ano,
      idFederacao: this.idFederacao,
      sigla: this.tipoConta
    };

    this.prestacaoService.buscarDetalhePrestacaoContas(filtro, true).subscribe(
      data => {
        this.lstItemPrestacaoCC = data;
        if (data.length) {
          this.versaoStatus = data[0].versaoPrestacaoDeContas;
        }
      },
      () => { },
      () => {
        this.buscarSaldoAnterior();
      }
    );
  }

  buscarSaldoAnterior() {
    const filtroSA: ListarExtratoFiltrado = {
      ano: this.ano,
      mes: this.mes,
      idFederacao: this.idFederacao,
      idTipoConta: 1006,
      idPrestacaoContas: null
    };

    // if (this.mes === 1 && this.ano === 2020) {
    //   this.saldoAnterior = 0;
    // } else {
    this.lancamentoService.obterSaldoAnterior(filtroSA).subscribe(
      data => {
        this.saldoAnterior = data;
      }
    );
    // }
  }

  exportarExcel() {
    this.excelService.exportAsExcelFile(this.lstItemPrestacaoCC, 'CC - ' + this.mes.toString() + '-' + this.ano.toString());
  }

  voltar() {
    this.location.back();
  }

}
