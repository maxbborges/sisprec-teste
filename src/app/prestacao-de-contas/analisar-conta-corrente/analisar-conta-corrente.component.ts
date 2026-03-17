import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { map } from 'rxjs/operators';
import { MotivoService } from 'src/app/services/motivo.service';
import { Util } from 'src/app/shared/helpers/util';
import { ListarExtratoFiltrado } from 'src/app/shared/models/commands/cmdLancamento';
import { Lancamento } from 'src/app/shared/models/responses/sisprec-response';
import { ApiArquivoService } from 'src/app/shared/services/api-arquivo.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiItemLancamentoService } from 'src/app/shared/services/api-item-lancamento.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-analisar-conta-corrente',
  templateUrl: './analisar-conta-corrente.component.html',
  styleUrls: ['./analisar-conta-corrente.component.scss'],
  standalone: false
})
export class AnalisarContaCorrenteComponent implements OnInit {

  public lstLancamentos: Lancamento[] = [];
  public lstDespesasLancamento: any[] = [];
  public lstDespesasLancamentoTab: any[] = [];
  public lstHaverAjustesParaDespesa: any[] = [];
  public lancamentosTotal = 0;
  public lstTipo: any[] = [];
  public lstTipoAnalise: any[] = [];
  public msg = '';
  public strExercicio = '';
  public strStatusAtual = '';
  public strSaldo = 0;
  public loaditems = false;
  public usuarioLogado: string;
  public motivosConfig: IDropdownSettings;
  public motivosSelecionados: any[] = [];
  public lstMotivos: string[] = [];
  public lancamento: any;

  public urlDownload = environment.urlApiSisprec + 'arquivo/porId/';

  constructor(
    private route: ActivatedRoute,
    private indicadorService: ApiIndicadorService,
    private apiLancamentoService: ApiLancamentoService,
    private excelService: ExcelService,
    private storageService: StorageService,
    private motivoService: MotivoService,
    private itemLancamentoService: ApiItemLancamentoService,
    private arquivoService: ApiArquivoService,
    private location: Location,
  ) {
    this.loaditems = true;
  }

  ngOnInit() {

    this.carregarMotivos();
    this.carregarTiposAnalise();
    this.usuarioLogado = this.storageService.getUsuarioLogado().tipoUsuarioSigla;

    const params = this.route.snapshot.params;
    this.carregarLancamentos(params.anoExercicio, params.idFederacao, params.mesExercicio, params.idPrestacaoContas);
  }

  voltar(){
    this.location.back();
  }

  carregarMotivosSelecionados(){
    for(let i in this.lstDespesasLancamento){
      this.motivosSelecionados.push([]);
    }
  }

  carregarDespesas(){
    for (var i in this.lstLancamentos) {
      this.carregarDespesaLancamento(this.lstLancamentos[i].idLancamento);
      this.obterHaverAjustesDeDespesas(this.lstLancamentos[i].idLancamento);
    }
  }

  obterHaverAjustesDeDespesas(idLancamento: string){
    this.apiLancamentoService.visualizarLancamento(idLancamento).subscribe(
      result => {
        this.lstHaverAjustesParaDespesa.push(result.haverAjustesParaDespesas)
      },
      () => {},
    );
  }

  carregarDespesaLancamento(idLancamento: string){
    this.apiLancamentoService.obterLancamentoDespesasPorId(idLancamento).subscribe(
      result => {
        this.lstDespesasLancamento = result;
        this.lstDespesasLancamento.forEach(element => {
          this.lancamentosTotal += element.valor;
        });
        this.carregarMotivosSelecionados();

        this.loaditems = false;
      },
      () => { },
      //() =>
        //this.calculaSaldoFinal()
    );
  }


  carregarDespesaLancamentoClick(idLancamento: string){
    this.apiLancamentoService.obterLancamentoDespesasPorId(idLancamento).subscribe(
      result => {
        this.lstDespesasLancamentoTab = result;
      },
      () => { },
    );
  }



  carregarMotivos() {
    this.motivoService.obterTodos()
    .pipe(map(x => x.filter(y => y.ativo)))
      .subscribe(
        result => {
          this.lstTipo = result;
          this.lstTipo.map(item => {this.lstMotivos.push(item.descricao)})
        }
      );

      this.motivosConfig = {
        singleSelection: false,
        idField: 'item_id',
        textField: 'item_text',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: false
      };
  }

  obterLancamento(idLancamento) {
    this.apiLancamentoService.visualizarLancamento(idLancamento).subscribe(
      result => {

        return result;

      },
      () => { }
    );
  }

  carregarTiposAnalise() {
    this.indicadorService.listarTodosIndicadoresPorTipoSigla('Analise').subscribe(
      result => {
        result = result.filter(item => item.sigla.includes('Presidente') == false);
        this.lstTipoAnalise = result.sort((a, b) => {
          if (a.idIndicador < b.idIndicador) { return -1; }
        });
      }
    );
  }

  carregarLancamentos(fAno: number, idfederacao: any, fMes: any, idprestacaocontas: any) {

    const cmdFiltrarListaExtrato: ListarExtratoFiltrado = {
      ano: fAno,
      idFederacao: idfederacao,
      mes: fMes,
      idTipoConta: 1006,
      idPrestacaoContas: idprestacaocontas
    };

    console.clear();

    this.apiLancamentoService.listarExtratoFiltrado(cmdFiltrarListaExtrato).subscribe((lancamentos) => {
      if (lancamentos.length > 0) {
        console.log(lancamentos)
        this.lstLancamentos = lancamentos;
        this.msg = '';
        this.strExercicio = cmdFiltrarListaExtrato.mes + '/' + cmdFiltrarListaExtrato.ano;
        this.strSaldo = lancamentos[lancamentos.length - 1].saldo;

        if (lancamentos.length > 0) {
          this.strStatusAtual = lancamentos[0].statusAtualPrestacaoContas;
        } else {
          this.strStatusAtual = '--';
        }
      } else {
        this.lstLancamentos = [];
        this.msg = 'Não foi encontrado nenhum lançamento para a pesquisa realizada.';
      }
      this.loaditems = false;
      this.carregarDespesas();
    }, (error) => {
      console.log('Erro ao carregar extrato filtrado:');
      console.log(error);
      this.lstLancamentos = [];
      this.msg = 'Ocorreu um erro ao pesquisar os lançamentos deste exercício. Tente novamente mais tarde.';
    }, () => {
    });
  }

  alteraStatusLancamento(idLancamento: any, analise: any, index: number) {

    const tr = document.getElementById(idLancamento + 'prestacao-de-conta-item-saida');
    // tr.classList.remove('bg-warning');   // remove the class
    tr.style.backgroundColor = '';

    if (analise.sigla === 'RetornadoAjustes') {
      // tr.classList.add('bg-warning');   // add the class
      tr.style.backgroundColor = '#ffff00';
    }

    this.apiLancamentoService.alterarAnalise(idLancamento, analise.idIndicador, this.storageService.getUsuarioLogado().idUsuario).subscribe((data) => {
      if (!data) {
        console.log('Falha ao alterar o status');
      } else {
        let selectdropdownlist: any;
        selectdropdownlist = document.getElementById(idLancamento + 'MotivoRetornoParaAjustes');
        // selectdropdownlist.value = '';
        // this.lstLancamentos[index].observacao = '';
        if (analise.sigla !== 'RetornadoAjustes') {
          selectdropdownlist.style.visibility = 'hidden';
        } else {
          selectdropdownlist.style.visibility = '';
        }
      }
    });
  }


  alteraMotivoRetornoParaAjustes(idLancamento: any, motivo: any) {
    console.log(idLancamento)
    console.log(motivo.target.value)
    if (motivo.target.value !== '' && motivo.target.value !== 0) {
      this.apiLancamentoService.alterarMotivoRetornoParaAjustes(idLancamento, motivo.target.value, this.storageService.getUsuarioLogado().idUsuario).subscribe((data) => {
        if (!data) {
          console.log('Falha ao alterar o status');
        }
      });
    }
  }

  exportarClick() {

    this.excelService.exportAsExcelFile(this.lstLancamentos, 'Lancamentos');
  }

  maskDate(date: string) {
    return Util.formatStringDate(date);
  }

  ativarBotaoAnalisar(lancamento: any) {

    const perfil = this.storageService.getUsuarioLogado().tipoUsuarioSigla;
    const status = lancamento.siglaStatusAtualPrestacaoContas;

    if (
      status === 'EnviadaAnalise' ||
      status === 'Reanalise' ||
      (status === 'AprovadaConferenciaDocumentacao' && perfil === 'UsuarioGestorFiscal')
    ) {
      return false;
    }
    return true;

  }
}
