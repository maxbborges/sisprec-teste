import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {
  Historico,
  ItemSubitemValor,
  Valor
} from 'src/app/shared/models/responses/sisprec-response';
import { ApiEstimativaDeCustoService } from 'src/app/shared/services/api-estimativa-de-custo.service';
import { ExcelService } from 'src/app/shared/services/excel.service';

@Component({
  selector: 'app-visualizar-valores',
  templateUrl: './visualizar-valores.component.html',
  styles: [],
  standalone: false
})
export class VisualizarValoresComponent implements OnInit {
  valor: Valor;
  historicos$: Observable<Historico[]>;

  idCadastro: string;

  constructor(
    private api: ApiEstimativaDeCustoService,
    private route: ActivatedRoute,
    private excelService: ExcelService
  ) {}

  ngOnInit() {
    this.idCadastro = this.route.snapshot.params.idCadastro;

    this.api
      .visualizarValres(this.idCadastro)
      .subscribe((x) => (this.valor = x));

    this.historicos$ = this.api.listarHistorico(this.idCadastro);
  }

  corValorTotalRestante(valor: number): string{
    return valor < 0 ? "red" : "black";
  }

  corValorRealizado(valorPrevisto: number, valorRealizado: number): string{
    return valorPrevisto < valorRealizado ? "red" : "black";
  }

  agruparItem(item: ItemSubitemValor[]) {
    console.log(item.map((x) => x.codigoItem).filter(this.onlyUnique));
    // return item.filter(this.onlyUnique);
    return ['1.00', '2.00'];
  }
  
  clicarBaixarExcel() {
    const valor = [];

    this.valor.itensSubitensValores.forEach((x) => {
      if (x.ehPai) {
        valor.push({
          'Item / Subitem - Descrição': `${x.codigoItem} - ${x.nomeItem}`,
          Janeiro: '',
          Fevereiro: '',
          Março: '',
          Abril: '',
          Maio: '',
          Junho: '',
          Julho: '',
          Agosto: '',
          Setembro: '',
          Outubro: '',
          Novembro: '',
          Dezembro: '',
          'Valor previsto': '',
          'Valor realizado': ''
        });
      }

      valor.push({
        'Item / Subitem - Descrição': `${x.codigo} - ${x.nome}`,
        Janeiro: x.mesesValores[0].valor,
        Fevereiro: x.mesesValores[1].valor,
        Março: x.mesesValores[2].valor,
        Abril: x.mesesValores[3].valor,
        Maio: x.mesesValores[4].valor,
        Junho: x.mesesValores[5].valor,
        Julho: x.mesesValores[6].valor,
        Agosto: x.mesesValores[7].valor,
        Setembro: x.mesesValores[8].valor,
        Outubro: x.mesesValores[9].valor,
        Novembro: x.mesesValores[10].valor,
        Dezembro: x.mesesValores[11].valor,
        'Valor previsto': x.total,
        'Valor realizado': ''
      });

      valor.push({
        'Item / Subitem - Descrição': 'Valor realizado',
        Janeiro: x.mesesDespesas[0].valor,
        Fevereiro: x.mesesDespesas[1].valor,
        Março: x.mesesDespesas[2].valor,
        Abril: x.mesesDespesas[3].valor,
        Maio: x.mesesDespesas[4].valor,
        Junho: x.mesesDespesas[5].valor,
        Julho: x.mesesDespesas[6].valor,
        Agosto: x.mesesDespesas[7].valor,
        Setembro: x.mesesDespesas[8].valor,
        Outubro: x.mesesDespesas[9].valor,
        Novembro: x.mesesDespesas[10].valor,
        Dezembro: x.mesesDespesas[11].valor,
        'Valor previsto': '',
        'Valor realizado': x.totalDespesas
      });

      valor.push({
        'Item / Subitem - Descrição': 'Total restante',
        Janeiro: x.mesesTotais[0].valor,
        Fevereiro: x.mesesTotais[1].valor,
        Março: x.mesesTotais[2].valor,
        Abril: x.mesesTotais[3].valor,
        Maio: x.mesesTotais[4].valor,
        Junho: x.mesesTotais[5].valor,
        Julho: x.mesesTotais[6].valor,
        Agosto: x.mesesTotais[7].valor,
        Setembro: x.mesesTotais[8].valor,
        Outubro: x.mesesTotais[9].valor,
        Novembro: x.mesesTotais[10].valor,
        Dezembro: x.mesesTotais[11].valor,
        'Valor previsto': x.mesesTotais[11].valor,
        'Valor realizado': ''
      });
    });

    valor.push({
      'Item / Subitem - Descrição': 'Total por mês',
      Janeiro: this.valor.totaisMesesValores[0].totalMes,
      Fevereiro: this.valor.totaisMesesValores[1].totalMes,
      Março: this.valor.totaisMesesValores[2].totalMes,
      Abril: this.valor.totaisMesesValores[3].totalMes,
      Maio: this.valor.totaisMesesValores[4].totalMes,
      Junho: this.valor.totaisMesesValores[5].totalMes,
      Julho: this.valor.totaisMesesValores[6].totalMes,
      Agosto: this.valor.totaisMesesValores[7].totalMes,
      Setembro: this.valor.totaisMesesValores[8].totalMes,
      Outubro: this.valor.totaisMesesValores[9].totalMes,
      Novembro: this.valor.totaisMesesValores[10].totalMes,
      Dezembro: this.valor.totaisMesesValores[11].totalMes,
      'Valor previsto': '',
      'Valor realizado': ''
    });

    this.excelService.exportAsExcelFile(valor, 'Estimativa de Custo');
  }
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
}
