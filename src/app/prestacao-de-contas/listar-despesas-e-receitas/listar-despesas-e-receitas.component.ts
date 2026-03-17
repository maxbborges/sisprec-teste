import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-listar-despesas-e-receitas',
  templateUrl: './listar-despesas-e-receitas.component.html',
  styleUrls: ['./listar-despesas-e-receitas.component.scss'],
  standalone: false
})
export class ListarDespesasEReceitasComponent implements OnInit {

  public idLancamento: string;
  public lstDespesas: any[] = [];
  public lancamento: any;
  public saldoLancamento = 0;
  public msg: 'Nenhum registro encontrado';
  public urlDownload = environment.urlApiSisprec + 'arquivo/porId/';

  constructor(
    private route: ActivatedRoute,
    private lancamentoService: ApiLancamentoService,
    private excelService: ExcelService,
    private location: Location
  ) { }

  ngOnInit() {
    this.idLancamento = this.route.snapshot.params.id;
    this.obterLancamento();
  }

  voltar() {
    this.location.back();
  }

  analisar(e) {
    console.log(e);
  }

  baixarDocumentoAnexado(e) {

  }

  obterLancamento() {
    this.lancamentoService.visualizarLancamento(this.idLancamento).subscribe(
      data => {
        this.lancamento = data;
        this.obterDetalheLancamentoDespesaPorId();
        console.log(this.lancamento);
      }
    );
  }

  obterDetalheLancamentoDespesaPorId() {
    this.lancamentoService.obterLancamentoDespesasPorIdLancamento(this.idLancamento).subscribe(
      data => {
        this.lstDespesas = data;
        this.lstDespesas.forEach(element => {
          this.saldoLancamento += element.valor;
        });

        this.saldoLancamento = this.lancamento.valor - this.saldoLancamento;
        console.log(data);
      }
    );
  }


  exportarExcel() {
    this.excelService.exportAsExcelFile(this.lstDespesas, 'Despesas');
  }


}
