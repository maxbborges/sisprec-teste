import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Indicador } from 'src/app/shared/models/responses/sisprec-response';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';

@Component({
  selector: 'app-visualizar-despesa-conta-corrente',
  templateUrl: './visualizar-despesa-conta-corrente.component.html',
  styleUrls: ['./visualizar-despesa-conta-corrente.component.scss'],
  standalone: false
})
export class VisualizarDespesaContaCorrenteComponent implements OnInit {

  public idLancamentoDespesa: any;
  public despesaDetalhe;
  public lstComprovante: Indicador[] = [];

  constructor(
    private route: ActivatedRoute,
    private lancamentoService: ApiLancamentoService,
    private indicadorService: ApiIndicadorService
  ) { }

  ngOnInit() {
    this.obterTiposComprovante();
    this.route.params.subscribe(
      params => {
        this.idLancamentoDespesa = params.idDespesa;
        this.obterDespesaDetalhe();
      }
    );
  }

  obterDespesaDetalhe() {
    this.lancamentoService.obterLancamentoDespesasPorIdDespesa(this.idLancamentoDespesa).subscribe(
      result => {
        this.despesaDetalhe = result;
        //console.log(this.despesaDetalhe);
      });
  }
  obterTiposComprovante() {
    this.indicadorService.listarTodosIndicadoresPorTipoId(13).subscribe(
      result => {
        this.lstComprovante = result;
      }
    );
  }
  getNomeTipoComprovante(idTipoComprovante){
    try{
      var tipo = (this.lstComprovante.filter((x) => {
        if(x.idIndicador == idTipoComprovante) return x;
        }
      ));
      return tipo[0].nome;
    }catch{}
  }
}
