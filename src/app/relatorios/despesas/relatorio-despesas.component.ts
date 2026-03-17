import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, range } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import { RelatorioDespesaFiltros } from 'src/app/shared/models/commands/cmdLancamento';
import { CategoriasParaRelatorio, Indicador, RelatorioDespesa, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiRelatorioService } from 'src/app/shared/services/api-relatorio.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import * as XLSX from 'xlsx';
import { TipoUsuario } from './../../shared/models/responses/sisprec-response';

@Component({ templateUrl: './relatorio-despesas.component.html',
  standalone: false
})
export class RelatorioDespesasComponent implements OnInit {

  f: FormGroup;
  federacoes$: Observable<Indicador[]>;
  anos: Observable<number[]>;
  usuario: Usuario;
  relatorioDespesa$: Observable<RelatorioDespesa[]>;
  categorias: CategoriasParaRelatorio[];
  categoriaSelecionada: CategoriasParaRelatorio;
  listaStatus: Indicador[];
  filtrosRelatorio: RelatorioDespesaFiltros;
  listaMeses = [
    {
      value: 1,
      nome: 'Janeiro'
    },
    {
      value: 2,
      nome: 'Fevereiro'
    },
    {
      value: 3,
      nome: 'Março'
    },
    {
      value: 4,
      nome: 'Abril'
    },
    {
      value: 5,
      nome: 'Maio'
    },
    {
      value: 6,
      nome: 'Junho'
    },
    {
      value: 7,
      nome: 'Julho'
    },
    {
      value: 8,
      nome: 'Agosto'
    },
    {
      value: 9,
      nome: 'Setembro'
    },
    {
      value: 10,
      nome: 'Outubro'
    },
    {
      value: 11,
      nome: 'Novembro'
    },
    {
      value: 12,
      nome: 'Dezembro'
    }
  ];

  constructor(
    private apiIndicadorService: ApiIndicadorService,
    private apiRelatorioService: ApiRelatorioService,
    private fb: FormBuilder,
    private storageService: StorageService
  ) { }

  ngOnInit() {

    this.f = this.fb.group({
      idFederacao: '',
      idStatus: '',
      mes: '',
      ano: ['', Validators.required],
      categoria: ['', Validators.required],
    });

    this.usuario = this.storageService.getUsuarioLogado();

    if (this.verificarPerfil) {
      this.f.controls.idFederacao.setValidators([Validators.required]);
      this.federacoes$ = this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('federacao')
        .pipe(map(x => x.filter(y => y.sigla !== 'DEX')));
    } else {
      this.f.controls.idFederacao.setValue(this.usuario.idFiliacao);
    }

    this.carregarListaAnos();

    this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('StatusPrestacaoContas').subscribe(data => {
      this.listaStatus = data;
    });
  }

  clicarPesquisar() {

    const filtros: RelatorioDespesaFiltros = {
      idFederacao: this.f.get('idFederacao').value,
      ano: this.f.get('ano').value,
      idStatus: this.f.get('idStatus').value,
      mes: this.f.get('mes').value,
      categoria: this.categoriaSelecionada
    }
    if (this.f.invalid) {
      return;
    }
    this.relatorioDespesa$ = this.apiRelatorioService.buscarRelatorioDespesa(filtros);
  }

  get verificarPerfil(): boolean {
    return this.usuario.tipoUsuarioSigla === TipoUsuario.ConferenciaDocumentacao
      || this.usuario.tipoUsuarioSigla === TipoUsuario.GestorFiscal
      || this.usuario.tipoUsuarioSigla === TipoUsuario.Desenvolvedor
      || this.usuario.tipoUsuarioSigla === TipoUsuario.Auditoria
  }

  onChangeAno(ano: number) {
    if(ano > 0) {
      this.apiRelatorioService.buscarListaCategorias(ano).subscribe(data => {
        this.categorias = data;
      })
    } else {
      this.categorias = [];
      this.categoriaSelecionada = null;
    }
  }

  clicarBaixarExcel() {
    const element = document.getElementById('table-rel-despesas');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    // console.log(ws);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    // console.log(wb);

    XLSX.writeFile(wb, 'RelatorioDeDespesas.xlsx');
  }

  private carregarListaAnos() {

    const ano = 2020;
    const anoAtual = new Date().getFullYear();

    this.anos = range(ano, (anoAtual + 1) - ano).pipe(toArray());

  }

}
