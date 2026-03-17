import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { map } from 'rxjs/operators';
import { MotivoService } from 'src/app/services/motivo.service';
import { Util } from 'src/app/shared/helpers/util';
import { AlterarMotivoLancamento } from 'src/app/shared/models/commands/cmdItensLancamento';
import { Colaborador, Lancamento, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiItemLancamentoService } from 'src/app/shared/services/api-item-lancamento.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-analisar-despesas-e-receitas',
  templateUrl: './analisar-despesas-e-receitas.component.html',
  styleUrls: ['./analisar-despesas-e-receitas.component.scss'],
  standalone: false
})
export class AnalisarDespesasEReceitasComponent implements OnInit {
  public lstLancamentos: Lancamento[] = [];
  public lstDespesasLancamento: any[] = [];
  public msg = '';
  public lancamento: any;
  public idLancamento: string;
  public lancamentosTotal = 0;
  public saldolancamento = 0;
  public saldoFinal = 0;
  public lstTipo: any[] = [];
  public lstTipoAnalise: any[] = [];
  public urlDownload = environment.urlApiSisprec + 'arquivo/porId/';
  public loaditems = false;
  public motivosConfig: IDropdownSettings;
  public motivosSelecionados: any[] = [];
  public lstMotivos: any[] = [];
  public lstMotivosDesativada = false;
  public usuario: Usuario;
  public acaoBloqueada: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private apiLancamentoService: ApiLancamentoService,
    private indicadorService: ApiIndicadorService,
    private itemLancamentoService: ApiItemLancamentoService,
    private excelService: ExcelService,
    private storageService: StorageService,
    private motivoService: MotivoService,
    private _segurancaService: SegurancaCheckService,
    private router: Router,
  ) {
    this.loaditems = true;
  }

  ngOnInit() {
    this.usuario = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);

    const params = this.route.snapshot.params;
    this.idLancamento = params.idLancamento;
    this.carregarMotivos();
    this.carregarTiposAnalise();
    this.obterLancamento();
  }

  carregarMotivos() {
    this.motivoService.obterTodos()
    .pipe(map(x => x.filter(y => y.ativo)))
      .subscribe(
        result => {
          this.lstTipo = result;
          this.lstTipo.map(item => {
            this.lstMotivos.push({
              idMotivo: item.idMotivo,
              descricao: item.descricao
            })
          })
        }
      );

      this.motivosConfig = {
        singleSelection: false,
        idField: 'idMotivo',
        textField: 'descricao',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: false
      };
  }

  obterDescricaoMotivos(i){
    var result = this.lstMotivos.map(function(item) {return item.descricao;});
    return result;
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

  obterLancamento() {
    this.apiLancamentoService.visualizarLancamento(this.idLancamento).subscribe(
      result => {
        this.lancamento = result;

      },
      () => { },
      () => { this.obterDespesasLancamentos(); }
    );
  }

  obterMotivoId(id){
    var motivo = this.lstMotivos.filter(motivo => motivo.idMotivo === id)
    return motivo[0]
  }

  obterDespesasLancamentos() {
    this.apiLancamentoService.obterLancamentoDespesasPorId(this.idLancamento).subscribe(
      result => {
        this.lstDespesasLancamento = result;
        this.lstDespesasLancamento.forEach((element, index) => {
          this.lancamentosTotal += element.valor;
          var motivos = element.idMotivos.map(q => {
            return this.obterMotivoId(q)
          } )
          this.motivosSelecionados[index] = motivos;
        });

        this.loaditems = false;
      },
      () => { },
      () =>
        this.calculaSaldoFinal()
    );
  }

  calculaSaldoFinal() {
    if (this.lancamento != null) {
      this.saldoFinal = this.lancamento.valor - this.lancamentosTotal;
      this.saldolancamento = this.lancamento.valor;
    }
  }

  alteraStatusLancamento(idPrestacaoContaItemSaida: any, analise: any, index: number) {

    const tr = document.getElementById(idPrestacaoContaItemSaida + 'prestacao-de-conta-item-saida');
    // tr.classList.remove('bg-warning');   // remove the class
    tr.style.backgroundColor = '';

    if (analise.sigla === 'RetornadoAjustes') {
      // tr.classList.add('bg-warning');   // add the class
      tr.style.backgroundColor = '#ffff00';
    } else {
      // if (this.motivosSelecionados[index].length > 0) {
      //   this.motivosSelecionados[index]= []
      //   this.alteraMotivoRetornoParaAjustes(idPrestacaoContaItemSaida, this.motivosSelecionados[index], index);
      // }
      //this.alteraObservacaoRetornoParaAjustes(idPrestacaoContaItemSaida, "");
      //this.lstDespesasLancamento[index].observacao = '';
    }

    this.itemLancamentoService.alterarAnaliseDespesa(this.idLancamento, idPrestacaoContaItemSaida, analise.idIndicador, this.storageService.getUsuarioLogado().idUsuario ).subscribe((data) => {
      if (!data) {
        console.log('Falha ao alterar o status');
      } else {
        let selectdropdownlist: any;
        selectdropdownlist = document.getElementById(idPrestacaoContaItemSaida + 'MotivoRetornoParaAjustes');

        let textarea = document.getElementById(idPrestacaoContaItemSaida + 'ObservacaoRetornoParaAjustes');

        selectdropdownlist.value = '';
        if (analise.sigla !== 'RetornadoAjustes') {
          selectdropdownlist.style.visibility = 'hidden';
          textarea.style.display = 'none';
        } else {
          selectdropdownlist.style.visibility = '';
          textarea.style.display = 'block';
        }
      }
    });
  }

  public listaMotivos: any[] = [];

  alteraMotivoRetornoParaAjustes(idItemLancamento: any, motivo: [] | any, index: number) {
    const motivos = []
    
    if (Array.isArray(motivo)) {
      const motivosIds = motivo.map(item => item.idMotivo);
      this.motivosSelecionados[index] = [...motivo];
    } else {
      const motivoId = motivo.idMotivo;

      if (this.motivosSelecionados[index].includes(motivoId)) {
        this.motivosSelecionados[index] = this.motivosSelecionados[index].filter(id => id !== motivoId);
      } 
    }

    this.motivosSelecionados[index].forEach(element => {
      motivos.push(element.idMotivo)
    })

    const despesa: AlterarMotivoLancamento = {
      idLancamento: this.idLancamento,
      idPrestacaoContaSaidaItem: +idItemLancamento,
      idMotivos: motivos,
      idUsuario: +this.storageService.getUsuarioLogado().idUsuario
    };

    this.itemLancamentoService.alterarMotivoRetornoParaAjustesItemLancamento(despesa).subscribe((data) => {
    });
  }

  alteraObservacaoRetornoParaAjustes(idItemLancamento: any, observacao: string) {
    this.itemLancamentoService.alterarObservacaoRetornoParaAjustesItemLancamento(this.idLancamento, idItemLancamento, observacao, this.storageService.getUsuarioLogado().idUsuario ).subscribe((data) => {
    });
  }

  voltar() {
    history.back();
  }

  exportarClick() {
    console.log(this.lstLancamentos);
    
    this.excelService.exportAsExcelFile(this.colaboradorString(this.lstDespesasLancamento), 'Lancamentos');
  }

  colaboradorString(lstLancamentos: Array<any>){
    return lstLancamentos.map((v)=>{
      let colaboradorArray = v.colaboradores.map((y: Colaborador)=>{
        return "Nome: " + y.nome + ", Salário: " + y.salario
      });
      v.colaboradores =  colaboradorArray.join(" | ");
      console.log(v);
      return v;
    })
  }

  baixarDocumentoAnexado(e) {
    window.open(this.urlDownload + e, '_blank');
  }

  dateMask(d: any) {
    return Util.formatStringDate(d);
  }

  ativarBotaoAnalisar(despesalancamento: any) {

    const perfil = this.storageService.getUsuarioLogado().tipoUsuarioSigla;
    const status = despesalancamento.siglaStatusAtualPrestacaoContas;

    if (
      status === 'EnviadaAnalise' ||
      status === 'Reanalise' ||
      (status === 'AprovadaConferenciaDocumentacao' && perfil === 'UsuarioGestorFiscal')
    ) {
      return false;
    }
    return true;

  }
  visualizarDespesa(idLancamento){
    this.router.navigate(['/gestaoFinanceira/conta-corrente/visualizarDespesa/', idLancamento]);    
  }
}
