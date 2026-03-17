import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListarArquivosFiltrado } from 'src/app/shared/models/commands/cmdArquivoFiltrado';
import { Indicador } from 'src/app/shared/models/responses/sisprec-response';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiArquivoService } from 'src/app/shared/services/api-arquivo.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiPlanoDeContasService } from 'src/app/shared/services/api-plano-de-contas.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-download-arquivos-despesas',
  templateUrl: './download-arquivos-despesas.component.html',
  styleUrls: ['./download-arquivos-despesas.component.scss'],
  standalone: false
})
export class DownloadArquivosDespesasComponent implements OnInit {

  public lstFederacoes: Indicador[] = [];
  public lstCategorias: any[] = [];
  public lstItemCategorias: any[] = [];
  public formPesquisa: FormGroup;
  public usuarioLogado: any;
  public disableFederacoes = true;
  public exibeItem = false;

  public urlDownload = 'https://sisprec.sestsenat.org.br/api/arquivos/';
  // public urlDownload = 'https://sisprechom.sestsenat.org.br/api/arquivos/';


  constructor(
    private formBuilder: FormBuilder,
    private indicadorService: ApiIndicadorService,
    private planoContaService: ApiPlanoDeContasService,
    private arquivoService: ApiArquivoService,
    private storageService: StorageService,
    private alertService: AlertService,

  ) { }

  ngOnInit() {

    this.usuarioLogado = this.storageService.getUsuarioLogado();

    if (this.usuarioLogado.tipoUsuario === 'Federação' || this.usuarioLogado.tipoUsuario === 'Presidente' ) {
      this.disableFederacoes = false;
    }

    this.inicializarFormulario();
    this.carregarListaFederacoes();
  }

  carregarListaFederacoes() {
    this.indicadorService.listarTodosIndicadoresPorTipoSigla('Federacao').subscribe((lstFederacoes) => {
      this.lstFederacoes = lstFederacoes;
    }, (error) => {
      console.log('Erro ao carregar lista de federações:');
      console.log(error);
    });
  }

  inicializarFormulario() {
    this.formPesquisa = this.formBuilder.group({
      exercicio: ['', Validators.required],
      federacao: ['', Validators.required],
      mes: [''],
      categoria: ['', Validators.required],
      item: ['', Validators.required]
    });
  }


  onChangeGetCategoria() {
    const exercicio = this.formPesquisa.controls.exercicio.value;


    this.planoContaService.obterCategoriasPorExercicio(exercicio).subscribe(
      data => {
        console.clear();
        this.lstCategorias = data;
      }
    );
  }

  onChangeGetItemCategoria() {
    const cat = this.formPesquisa.controls.categoria.value;

    if (cat !== 'Todos') {
      this.exibeItem = true;
      this.planoContaService.obterItemCategoriasPorIdCategoria(cat).subscribe(
        data => {
          this.lstItemCategorias = data;
        }
      );
    } else {
      this.exibeItem = false;
      this.formPesquisa.controls.categoria.setValue('');
    }
  }

  baixarArquivos() {

    let idFederacao;
    console.clear();

    if (this.usuarioLogado.tipoUsuario === 'Federação' || this.usuarioLogado.tipoUsuario === 'Presidente') {
      idFederacao = this.usuarioLogado.idFiliacao;
    } else {
      idFederacao = this.formPesquisa.controls.federacao.value;
    }

    const filtro: ListarArquivosFiltrado = {
      ano: this.formPesquisa.controls.exercicio.value,
      idCategoria: this.formPesquisa.controls.categoria.value,
      idCategoriaItem: this.formPesquisa.controls.item.value,
      mes: this.formPesquisa.controls.mes.value,
      idFederacaoDono: idFederacao
    };

    this.arquivoService.listarDocumentoFiltrado(filtro).subscribe(
      data => {
        if (data) {
          window.location.href = this.urlDownload + idFederacao + '.zip';
        } else {
          this.alertService.exibirAlerta('Não existe arquivo para o exercício selecionado', tipo.atencao);
        }
      }
    );
  }
}
