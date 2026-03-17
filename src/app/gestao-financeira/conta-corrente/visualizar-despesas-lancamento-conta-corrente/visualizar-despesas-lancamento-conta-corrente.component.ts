import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Lancamento, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { ApiItemLancamentoService } from 'src/app/shared/services/api-item-lancamento.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-visualizar-despesas-lancamento-conta-corrente',
  templateUrl: './visualizar-despesas-lancamento-conta-corrente.component.html',
  styleUrls: ['./visualizar-despesas-lancamento-conta-corrente.component.scss'],
  standalone: false
})
export class VisualizarDespesasLancamentoContaCorrenteComponent implements OnInit {

  public idLancamento: string;
  public lstDespesasLancamento: any[] = [];
  public lancamento: Lancamento;
  public lancamentosTotal = 0;
  public saldoFinal = 0;
  public usuarioLogado: Usuario;
  public urlDownload = environment.urlApiSisprec + 'arquivo/porId/';

  constructor(
    private route: ActivatedRoute,
    private lancamentoService: ApiLancamentoService,
    private itemLancamentoService: ApiItemLancamentoService,
    private storageService: StorageService,
    public location: Location
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => this.idLancamento = params.idLancamento);
    this.obterLancamento();
    this.usuarioLogado = this.storageService.getUsuarioLogado();
  }

  obterDespesasLancamentos() {
    this.lancamentoService.obterLancamentoDespesasPorId(this.idLancamento).subscribe(
      result => {
        this.lstDespesasLancamento = result;
        this.lstDespesasLancamento.forEach(element => {
          this.lancamentosTotal += element.valor;
        });
      },
      () => { },
      () => {
        this.calculaSaldoFinal();
      }
    );
  }

  obterLancamento() {
    this.lancamentoService.visualizarLancamento(this.idLancamento).subscribe(
      result => {
        this.lancamento = result; //
      },
      () => { },
      () => { this.obterDespesasLancamentos(); }
    );
  }

  itemSemAnaliseOuAjustes(item: any) {
    return item.analise == "NaoAnalisado" || item.analise == "RetornadoAjustes" || item.analise == null;
  }

  lancamentoSemAnaliseOuAjustes(){
    return this.lancamento.siglaStatusAtualPrestacaoContas == null || this.lancamento.siglaStatusAtualPrestacaoContas == 'RetornadaAjustes'
  }

  possivelAlterar(item: any) {
    return this.itemSemAnaliseOuAjustes(item) && this.lancamentoSemAnaliseOuAjustes();
  }

  excluirLancamento(obj: any) {

    const c = confirm('Deseja realmente excluir o lançamento?');

    if (!c) { return false; }

    const { idUsuario } = this.storageService.getUsuarioLogado();

    this.itemLancamentoService.excluirLancamentoSaidaItem(obj.idPrestacaoContaItemSaida, idUsuario)
    .subscribe(
      result => {
        this.lancamento = result;
        this.obterLancamento();
      },
      (e) => { this.location.back(); },
      () => { this.obterDespesasLancamentos();
        this.location.back();
       }
    );
  }

  calculaSaldoFinal() {
    if (this.lancamento != null) {
      this.saldoFinal = this.lancamento.valor - this.lancamentosTotal;
    }
  }
}
