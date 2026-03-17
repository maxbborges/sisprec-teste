import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListarExtratoFiltrado } from 'src/app/shared/models/commands/cmdLancamento';
import { FiltroDetalhePrestacaoContas } from 'src/app/shared/models/responses/sisprec-response';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-listar-conta-investimento',
  templateUrl: './listar-conta-investimento.component.html',
  styleUrls: ['./listar-conta-investimento.component.scss'],
  standalone: false
})
export class ListarContaInvestimentoComponent implements OnInit {


  public mes = 0;
  public ano = 0;
  public tipoConta: string;
  public status: string;
  public usuario: any;
  public idFederacao: number;
  public saldoAnterior = 0;
  public msg = 'Nenhum registro encontrado';


  public lstItemPrestacaoCI: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private prestacaoService: ApiPrestacaoContasService,
    private storageService: StorageService,
    private lancamentoService: ApiLancamentoService,
    private excelService: ExcelService,
    private location: Location
  ) { }

  ngOnInit() {
    this.usuario = this.storageService.getUsuarioLogado();
    this.mes = this.route.snapshot.params.mes;
    this.ano = this.route.snapshot.params.ano;
    this.tipoConta = this.route.snapshot.params.tipoconta;
    this.status = this.route.snapshot.params.status;
    this.idFederacao = this.route.snapshot.params.idFederacao;

    this.carregarLancamentosDetalheCI();
  }

  carregarLancamentosDetalheCI() {

    const filtro: FiltroDetalhePrestacaoContas = {
      mesExercicio: this.mes,
      anoExercicio: this.ano,
      idFederacao: this.idFederacao,
      sigla: this.tipoConta
    };



    this.prestacaoService.buscarDetalhePrestacaoContas(filtro).subscribe(
      data => {
        this.lstItemPrestacaoCI = data;
        this.buscarSaldoAnterior();
      }
    );
  }


  buscarSaldoAnterior() {
    const filtroSA: ListarExtratoFiltrado = {
      ano: this.ano,
      mes: this.mes,
      idFederacao: this.idFederacao,
      idTipoConta: 1007,
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

  voltar() {
    this.location.back();
  }

  exportarExcel() {
    this.excelService.exportAsExcelFile(this.lstItemPrestacaoCI, 'CI - ' + this.mes.toString() + '-' + this.ano.toString());
  }

}
