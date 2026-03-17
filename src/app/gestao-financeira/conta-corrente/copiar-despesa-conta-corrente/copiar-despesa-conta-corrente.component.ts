import { formatCurrency } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { ModalCadastroFornecedorComponent } from 'src/app/shared/components/modal-cadastro-fornecedor/modal-cadastro-fornecedor.component';
import { InserirLancamentoSaidaItem } from 'src/app/shared/models/commands/cmdLancamento';
import { Colaborador, Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { ModalPesquisaFornecedorComponent } from 'src/app/shared/pesquisa-fornecedor/modal-pesquisa-fornecedor.component';
import { ModalPesquisaRelatorioViagensComponent } from 'src/app/shared/pesquisa-relatorio-viagens/modal-pesquisa-relatorio-viagens.component';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiArquivoService } from 'src/app/shared/services/api-arquivo.service';
import { ApiColaboradorService } from 'src/app/shared/services/api-colaborador.service';
import { ApiFornecedorService } from 'src/app/shared/services/api-fornecedor.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiItemLancamentoService } from 'src/app/shared/services/api-item-lancamento.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ApiPlanoDeContasService } from 'src/app/shared/services/api-plano-de-contas.service';
import { ApiRelatorioViagensService } from 'src/app/shared/services/api-relatorio-viagens.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-copiar-despesa-conta-corrente',
  templateUrl: './copiar-despesa-conta-corrente.component.html',
  styleUrls: ['./copiar-despesa-conta-corrente.component.scss'],
  standalone: false
})
export class CopiarDespesaContaCorrenteComponent implements OnInit {

  public formCopiar: FormGroup;
  public usuarioLogado: Usuario;
  public idDespesaOriginal: any;
  public itemCategoria: any[] = [];
  public lstTipoFornecedor: any[] = [];
  public lstTipo: any[] = [];
  public despesaOriginal: any;
  public lancamento: any;
  public tipoFornecedor: any;
  public fornecedor: any;
  public tipo: string = "Despesa";
  public lstCategoria: any[] = [];
  public mostrararquivo = true;
  public listaArquivos: any[] = [];
  public urlDownload = environment.urlApiSisprec + 'arquivo/porId/';
  public acaoBloqueada = false;
  public isFornecedorSelecionado = false;
  public isRelatorioViagensSelecionado: boolean = false;
  public relatorioViagens: any;

  public lstColaborador: Colaborador[] = [];
  public colaboradorSelecionado: any;
  public colaboradorSalario: number = 0;
  public lstColaboradoresSelecionados: Colaborador[] = [];

  public categoriaSelecionada: any;
  public categoriaSelecionadaCodigo: any;
  public lstComprovante: Indicador[] = [];

  public itemCategoriaSelecionadoCodigo: string;

  public isTipoDespesa: boolean = false;
  public anoCadastro: number = 0;

  public comprovanteSelecionado: string;
  public numeroDoComprovante: string;
  public dataDoComprovante: Date;

  public isDespesaComComprovant: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private _modal: ModalService,
    private indicadorService: ApiIndicadorService,
    private lancamentoService: ApiLancamentoService,
    private itemLancamentoService: ApiItemLancamentoService,
    private fornecedorService: ApiFornecedorService,
    private storageService: StorageService,
    private planoContaService: ApiPlanoDeContasService,
    private apiArquivoService: ApiArquivoService,
    private _segurancaService: SegurancaCheckService,
    private ngbModal: NgbModal,
    private router: Router,
    private m: ModalService,
    private alertService: AlertService,
    private relatorioViagensService: ApiRelatorioViagensService,
    private colaboradorService: ApiColaboradorService
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.idDespesaOriginal = this.route.snapshot.params.idDespesa;
    this.inicializarFormulario();
    this.obterColaboradores();
    this.obterTipos();
    this.obterTiposComprovante();
    this.obterDespesaOriginal();
  }

  obterArquivos() {
    const filtros = {
      idDespesa: this.idDespesaOriginal,
      idArquivos: []
    };

    this.apiArquivoService.listarArquivos(filtros).subscribe(
      data => {
        data.map(item => {
          let arquivo = {
            idArquivo: item.idArquivo,
            nomeArquivo: item.nomeArquivo
          };
          this.listaArquivos.push(arquivo);
          this.formCopiar.value.idArquivos.push(arquivo.idArquivo);
        });
      }
    );
  }

  deletarArquivo(i: number) {
    this.listaArquivos.splice(i, 1);
    this.formCopiar.value.idArquivos.splice(i, 1);
    if (this.formCopiar.value.idArquivos.length === 0) {
      this.formCopiar.patchValue({idArquivo : null});
    }
    this.verificaValidadeFormulario();
  }

  subiuArquivo(arquivo: any) {
    this.formCopiar.patchValue({idArquivo : '00000000-0000-0000-0000-000000000000'});
    this.listaArquivos.push(arquivo);
    this.formCopiar.value.idArquivos.push(arquivo.idArquivo);
  }

  onChangeTipo(tipoConta: any) {
    this.despesaOriginal.idTipo = tipoConta.idIndicador;
    this.tipo = tipoConta.nome;
    this.limparDadosFornecedorSelecionado();
    this.isDespesa();
  }

  obterCategoriaPlanoDeConta(ano: any) {
    this.planoContaService.obterCategoriasPorExercicio(ano).subscribe(
      data => {
        this.lstCategoria = data;
        this.onChangeFiltrarCategoriaItem();
      }
    );
  }

obterDespesaOriginal() {
    this.lancamentoService.obterLancamentoDespesasPorIdDespesa(this.idDespesaOriginal).subscribe(
      data => {
        this.despesaOriginal = data;
        this.tipo = this.despesaOriginal.tipo;
        // this.comprovanteSelecionado = this.despesaOriginal.idTipoComprovante;
        // this.numeroDoComprovante = this.despesaOriginal.numeroComprovante;

        // Primeiro preenche o formulário
        this.populaCamposFormulario();

        // Depois obtém o lançamento e arquivos
        this.obterLancamento();
        // this.obterArquivos();

        if(data.idRelatorioViagens !== null && data.idRelatorioViagens !== undefined) {
          this.relatorioViagensService.recuperarRelatorioPorId(data.idRelatorioViagens).subscribe((v) => {
            this.relatorioViagens = v;
            this.isRelatorioViagensSelecionado = true;
          })
        }
      },
      (error) => {
        console.log(error);
      }
    );
}

  onChangeFiltrarCategoriaItem() {
    this.itemCategoriaSelecionadoCodigo = "";
    const selecao = this.formCopiar.controls.idCategoria.value;

    const categoriaSelecionada = this.lstCategoria.find(x => x.idCategoriaItemPlanoDeConta === selecao);
    if (selecao != '') {
      this.categoriaSelecionadaCodigo = categoriaSelecionada.codigo;
      this.planoContaService.obterItemCategoriasPorIdCategoria(selecao).subscribe(
        data => {
          this.itemCategoria = data;
          let idItemCategoria = this.itemCategoria[0].idItemPlanoDeConta;

          this.itemCategoria.forEach((value) => {
            if(value.idItemPlanoDeConta === this.formCopiar.controls.idCategoriaItem.value){
              idItemCategoria = this.formCopiar.controls.idCategoriaItem.value
            }
          });

          this.formCopiar.controls.idCategoriaItem.setValue(idItemCategoria);
          this.defineItem(idItemCategoria);
          this.defineCategoria(selecao);

          this.despesaOriginal.colaboradores.forEach(element => {
            this.colaboradorSelecionado = element.idColaborador;
            this.colaboradorSalario = element.salario;
            this.addColaborador(this.colaboradorSalario, false);
          });

          this.isTipoDespesa = (this.despesaOriginal.idTipo == 1014);
          this.isDespesa();
        },
        (error) => {
          console.log(error);
        },
        () => {
          this.verificaValidadeFormulario();
        }
      );
    }
  }

  inicializarFormulario() {
    this.formCopiar = this.formBuilder.group({
      idTipo: ['', [Validators.required]],
      idCategoria: ['', [Validators.required]],
      idCategoriaItem: ['', [Validators.required]],
      dataEvento: ['', [Validators.required]],
      valor: ['', [Validators.required]],
      idTipoFornecedor: [''],
      numeroDocumento: [''],
      descricao: [''],
      idArquivo:  ['', [Validators.required, Validators.minLength(4)]],
      idArquivos: [[], [Validators.nullValidator]],
      nomeRazaoSocial: [''],
      idFornecedor: [0],
      idRelatorioViagens: [null],
      ano: ['', [Validators.nullValidator]],
      mes: ['', [Validators.nullValidator]],
      idColaborador:[''],
      salario: [0, [Validators.required, Validators.min(0)]],
      idTipoComprovante: [''],
      numeroComprovante: [''],
      dataComprovante: [''],
      idFederacao: this.usuarioLogado.idFiliacao,
      idUsuario: this.usuarioLogado.idUsuario,
      verificarSaldoLancamento: true
    });
  }

populaCamposFormulario() {
    if (!this.despesaOriginal) return;

    this.formCopiar.patchValue({
      idTipo: this.despesaOriginal.idTipo,
      idCategoria: this.despesaOriginal.idCategoria,
      idCategoriaItem: this.despesaOriginal.idCategoriaItem,
      dataEvento: this.tratarData(this.despesaOriginal.dataEvento),
      valor: this.despesaOriginal.valor,
      idTipoFornecedor: this.despesaOriginal.idTipoFornecedor,
      numeroDocumento: this.despesaOriginal.numeroDocumentoFornecedor,
      descricao: this.despesaOriginal.descricao,
      idArquivo: this.despesaOriginal.idArquivo || '00000000-0000-0000-0000-000000000000',
      nomeRazaoSocial: this.despesaOriginal.fornecedor,
      idFornecedor: this.despesaOriginal.idFornecedor || 0,
      // idTipoComprovante: this.despesaOriginal.idTipoComprovante,
      // numeroComprovante: this.despesaOriginal.numeroComprovante,
      // dataComprovante: this.tratarData(this.despesaOriginal.dataComprovante)
    });

    // Preenche os colaboradores
    if (this.despesaOriginal.colaboradores && this.despesaOriginal.colaboradores.length > 0) {
      this.lstColaboradoresSelecionados = [...this.despesaOriginal.colaboradores];
    }

    this.isFornecedorSelecionado = (this.despesaOriginal.idFornecedor > 0);
    this.tipo = this.despesaOriginal.tipo;

    // Força a validação após o preenchimento
    this.formCopiar.updateValueAndValidity();
}

  obterTipos() {
    this.indicadorService.listarTodosIndicadoresPorTipoId(9).subscribe(
      result => {
        this.lstTipo = result;
      }
    );
  }

  obterTiposComprovante() {
    this.indicadorService.listarTodosIndicadoresPorTipoId(13).subscribe(
      result => {
        this.lstComprovante = result;
      }
    );
  }

  // obterLancamento() {
  //   this.lancamentoService.visualizarLancamento(this.despesaOriginal.idLancamento).subscribe(
  //     data => {
  //       this.lancamento = data;
  //       this.obterCategoriaPlanoDeConta(this.lancamento.anoExercicio);
  //       if(data.dataCadastro != null && data.dataCadastro != undefined && data.dataCadastro != ""){
  //         this.anoCadastro = new Date(data.dataCadastro).getFullYear();
  //       }
  //     }
  //   );
  // }

    obterLancamento() {
     this.lancamentoService.visualizarLancamento(this.despesaOriginal.idLancamento).subscribe(
      result => {
        this.lancamento = result;
        if(result.dataCadastro != null && result.dataCadastro != undefined && result.dataCadastro != ""){
          this.anoCadastro = new Date(result.dataCadastro).getFullYear();
        }
        this.formCopiar.patchValue({ano: this.lancamento.anoExercicio})
        this.formCopiar.patchValue({mes: this.lancamento.mesExercicio})
        this.obterCategoriaPlanoDeConta(this.lancamento.anoExercicio);
      }
    );
  }

  tratarData(data: Date): string {
    if (!data) {
      return '';
    }
    const dataConvertida = data.toString();
    const dataTratada = dataConvertida.split('T');
    return dataTratada[0];
  }

  verificaTipoFornecedor(event) {
    this.tipoFornecedor = event.target.id;
  }

  salvar() {
    let abortar = this.validarSalarioDespesa();
    if(abortar) return;
    abortar = this.validarComprovante();
    if(abortar) return;
    if (this.tipo === 'Devolução') {
      this.formCopiar.patchValue({ idTipoFornecedor: 0, numeroDocumento: '00' });
    }
    if (this.formCopiar.get('idTipo').value == 1014 && this.formCopiar.get('idFornecedor').value == 0 && !this.isTipoDespesa) {
      this._modal.alert('Por favor, selecione um Fornecedor', 'Atenção', 'a');
      return;
    }

    if(this.lstColaboradoresSelecionados.length === 0 && this.isTipoDespesa){
      this._modal.alert('Por favor, selecione um Colaborador', 'Atenção', 'a');
      return;
    }

    if(this.isTipoDespesa){
        this.limparDadosFornecedorSelecionado();
      } else {
        this.lstColaboradoresSelecionados = [];
    }

    const form = this.formCopiar.value as InserirLancamentoSaidaItem;
    form.idLancamento = this.lancamento.idLancamento;
    form.colaboradores = [];

    this.lstColaboradoresSelecionados.forEach(element => {
      form.colaboradores.push({
        idLancamento: form.idLancamento,
        IdPrestacaoContaItemSaida: 0,
        idUsuarioCadastro: this.usuarioLogado.idUsuario,
        idColaborador: element.idColaborador,
        salario: +this.removerformatarValor(element.salario).toFixed(2)}
      );
    });

    if (this.formCopiar.valid) {
      var dataC = null;
      if(this.formCopiar.controls.dataComprovante.value){
        dataC = this.formCopiar.controls.dataComprovante.value.toString().replace("-","").replace("-","");
      }
      var abortCadastro = false;
      if(this.usuarioLogado.tipoUsuarioSigla == "UsuarioFederacao" && this.tipo == 'Despesa'){
          if(dataC != null){
            this.itemLancamentoService.getLancamentoSaidaItem(
              this.lancamento.idLancamento,
              +this.formCopiar.controls.idTipoComprovante.value,
              this.formCopiar.controls.numeroComprovante.value,
              dataC,
              this.usuarioLogado.idFiliacao
            ).subscribe(
              (data) => {
                if(data == null){
                  this.m.confirm('Deseja realmente salvar?',null)
                    .pipe(
                      take(1),
                      switchMap(resultado => resultado ? of(this.inserirNovaDespesa(form)) : EMPTY)
                    )
                    .subscribe(() => {});
                } else {
                  var dt = new Date(this.formCopiar.controls.dataComprovante.value+'T00:00:00');
                  var tipo = this.lstComprovante.filter(
                    (item) => item.idIndicador == +this.formCopiar.controls.idTipoComprovante.value
                  )[0].nome;
                  this.m.alert(`Já existe uma despesa com o número ${this.formCopiar.controls.numeroComprovante.value} para ${tipo} na data ${ dt.toLocaleDateString('pt-BR')}. Verifique os dados antes de prosseguir neste lançamento.`, 'Aviso', 'a');
                  abortCadastro = true;
                }
              },
              (error) => {
                console.error(error);
              }
            );
            if (abortCadastro) return;
          }else{
            this.m.confirm('Deseja realmente salvar?',null)
            .pipe(
              take(1),
              switchMap(resultado => resultado ? of(this.inserirNovaDespesa(form)) : EMPTY)
            )
            .subscribe(() => {});
          }
      } else {
        this.m.confirm('Deseja realmente salvar?',null)
          .pipe(
            take(1),
            switchMap(resultado => resultado ? of(this.inserirNovaDespesa(form)) : EMPTY)
          )
          .subscribe(() => {});
      }
    } else {
      this._modal.alert('Por favor, preencha todos os campos obrigatórios', 'Atenção', 'a');
    }
  }

  inserirNovaDespesa(form: InserirLancamentoSaidaItem) {
    if(!this.isCategoriaSelecionadaViagensOuDiariasNoPais) {
      this.excluirRelatorioViagensSelecionado();
    }
    this.itemLancamentoService.inserirLancamentoSaidaItem(form).subscribe((data) => {
      if (data == true) {
        this.m.alert('Despesa cadastrada com sucesso!', 'Sucesso', 's');
        this.formCopiar.reset();
        this.router.navigate(['gestaoFinanceira/conta-corrente/despesasLancamento/' + this.lancamento.idLancamento]);
      } else {
        let resultado$ = this.m.confirm('Os totais de despesas ultrapassam o valor estimado para esse item, deseja continuar?', null)
        resultado$.subscribe(resultado => {
          if(resultado){
            form.verificarSaldoLancamento = false;
            this.inserirNovaDespesa(form);
          }
        })
      }
    }, (error) => {
      this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar', tipo.erro);
    });
  }

  alterarArquivo() {
    this.mostrararquivo = true;
  }

  excluirFornecedor() {
    this.limparDadosFornecedorSelecionado();
  }

  limparDadosFornecedorSelecionado() {
    this.isFornecedorSelecionado = false;
    this.formCopiar.get('numeroDocumento').setValue('');
    this.formCopiar.get('nomeRazaoSocial').setValue('');
    this.formCopiar.get('idFornecedor').setValue(0);
  }

  pesquisaFornecedor() {
    const modalRef = this.ngbModal.open(ModalPesquisaFornecedorComponent, { size: 'lg', centered: true });

    modalRef.componentInstance.retorno.subscribe((x) => {
      this.preencherDadosFornecedor(x);
    });

    modalRef.result.then((_sucesso) => {}, (erro) => {
      if(erro == "cadastrar-fornecedor") {
        this.cadastrarFornecedor();
      }
    });
  }

  cadastrarFornecedor() {
    const modalRefCadastro = this.ngbModal.open(ModalCadastroFornecedorComponent,{ size: 'lg', centered: true });
    modalRefCadastro.componentInstance.retorno.subscribe((x) => {
      this.preencherDadosFornecedor(x);
    })

    modalRefCadastro.result.then((_sucesso) => {}, (erro) => {
      if(erro == "voltar") {
        this.pesquisaFornecedor();
      }
    })
  }

  preencherDadosFornecedor(x: any){
    if (x != null) {
      this.fornecedor = x;
      this.formCopiar.get('numeroDocumento').setValue(x.numeroDocumento);
      this.formCopiar.get('nomeRazaoSocial').setValue(x.nome);
      this.formCopiar.get('idFornecedor').setValue(x.idFornecedor);
      this.isFornecedorSelecionado = true;
    } else {
      alert('Ocorreu um erro ao selecionar o Fornecedor. Favor verifique.');
      this.isFornecedorSelecionado = false;
    }
  }

  private verificaValidadeFormulario() {
    const codigosBusca = ['13.01', '13.02', '13.03'];

    const encontrados = this.itemCategoria.filter(item => codigosBusca.includes(item.codigo));

    if (encontrados.length > 0) {
      this.formCopiar.get('idArquivo').clearValidators();
      this.formCopiar.get('idArquivo').updateValueAndValidity();
    } else {
      this.formCopiar.get('idArquivo').setValidators([Validators.required, Validators.minLength(4)]);
      this.formCopiar.get('idArquivo').updateValueAndValidity();
    }
  }

  cancelar() {
    this._modal.confirm('Deseja cancelar?').subscribe(resultado => {
      if (resultado) {
        this.router.navigate(['gestaoFinanceira/conta-corrente/despesasLancamento/' + this.lancamento.idLancamento]);
        return;
      }
      this._modal.close();
    });
  }

  // Métodos de colaborador (os mesmos do componente de edição)
  obterColaboradores() {
    this.lstColaborador = []
    this.itemCategoria = []
    this.colaboradorService.listarTodosColaboradores(this.usuarioLogado.idFiliacao).subscribe(
      data => {
        this.lstColaborador = data;
      }
    );
  }

  addColaborador(salario, showMsg: boolean = true) {
    let abortar = this.validarSalarioDespesa(true);
    if(abortar) return;
    abortar = false;

    this.lstColaboradoresSelecionados.forEach(element => {
      if(element.idColaborador == this.colaboradorSelecionado) {
        if (showMsg) this.m.alert('Colaborador já registrado', 'Aviso', 'a');
        abortar = true;
      }
    });

    if(abortar) return;

    this.lstColaborador.forEach(element => {
      if(element.idColaborador == this.colaboradorSelecionado) {
        element.salario = formatCurrency(salario,'pt-Br','R$');
        this.lstColaboradoresSelecionados.push(element);
      }
    });
  }

  validarSalarioDespesa(isIncluirDigitacao: Boolean = false): Boolean {
    let abortar:Boolean = false;
    var totalDespesa = this.formCopiar.get('valor').value;
    var salarioSelecionado = 0.0;

    if (isIncluirDigitacao) {
      salarioSelecionado = this.formCopiar.get('salario').value ? this.formCopiar.get('salario').value : 0.0;
    }

    var totalSalarios = 0 + salarioSelecionado;

    this.lstColaboradoresSelecionados.forEach(element => {
      totalSalarios = totalSalarios + this.removerformatarValor(element.salario);
    });

    if(totalSalarios > totalDespesa) {
      this.m.alert('O valor dos salários superam a despesa informada', 'Aviso', 'a');
      abortar = true;
    }

    return abortar;
  }

  validarComprovante(): Boolean {
    let abortar:Boolean = false;
    if(this.isDespesaComComprovante()) {
      let invalidar = false;
      if(this.comprovanteSelecionado == undefined || this.comprovanteSelecionado.length == 0) {
        this.m.alert('Informe o Tipo do Documento!', 'Aviso', 'a');
        abortar = true;
      }
      if(this.numeroDoComprovante == undefined || this.numeroDoComprovante.length == 0) {
        this.m.alert('Informe o número do Documento!', 'Aviso', 'a');
        abortar = true;
      }
      this.dataDoComprovante = this.formCopiar.controls.dataComprovante.value;
      if(this.dataDoComprovante == null || this.dataDoComprovante == undefined || this.dataDoComprovante.toString() == '') {
        this.m.alert('Informe uma Data válida para o Documento!', 'Aviso', 'a');
        abortar = true;
      }
    }
    return abortar;
  }

  removerColaborador(idColaborador) {
    this.lstColaboradoresSelecionados = this.lstColaboradoresSelecionados.filter((x) => {
      if(x.idColaborador != idColaborador) return x;
    })
  }

  removerformatarValor(valor: any): number {
    try {
      let valorTratado = '';
      if(valor == null || valor == undefined) {
        return 0;
      } else if(valor.toString().includes('R$')) {
        valorTratado = valor.replace(/[^\d,]+/g, '').trim();
        valorTratado = valorTratado.replace(',','.').trim();
        return +valorTratado;
      } else if(valor.toString().includes('%')) {
        valorTratado = valor.replace('%','').trim();
        return +valorTratado;
      } else if(valor.toString().includes(',')) {
        valorTratado = valor.replace(',','.').trim();
        return +valorTratado;
      } else {
        return +valor;
      }
    } catch(err) {
      return 0;
    }
  }

  mostrarCategoria(event) {
    const idCategoria = event.target.value;
    this.defineCategoria(idCategoria);
  }

  defineCategoria(idCategoria) {
    const selecaoItem = this.lstCategoria.filter(element => {
      if(element.idCategoriaItemPlanoDeConta == idCategoria) {
        return element;
      }
    });

    this.categoriaSelecionada = selecaoItem[0].idCategoriaItemPlanoDeConta;
    this.categoriaSelecionadaCodigo = selecaoItem[0].codigo;
  }

  mostrarItem(event) {
    const item = event.target.value;
    this.defineItem(item);
    this.defineCategoria(this.categoriaSelecionada);
    if(this.formCopiar.controls.idTipo.value == '1014') this.tipo = 'Despesa';
    this.isDespesa();
    this.isDespesaComComprovante();
  }

  defineItem(item) {
    const selecaoItem = this.itemCategoria.filter(element => {
      if(element.idItemPlanoDeConta == item) {
        return element;
      }
    });

    this.itemCategoriaSelecionadoCodigo = selecaoItem[0].codigo;
    this.isDespesaComComprovante();
  }

  isDespesa() {
    if(this.tipo == undefined && this.despesaOriginal.idTipo == '1014') {
      this.tipo = 'Despesa';
    }

    this.isTipoDespesa = (this.tipo == 'Despesa' &&
      (['3.01', '3.02', '8.04','8.07'].includes(this.itemCategoriaSelecionadoCodigo)) &&
      this.anoCadastro >= 2025
    );
  }

  isDespesaComComprovante() {
    var categoriaSelect = (this.tipo == 'Despesa' &&
      !([3, 10, 11,13].includes(this.categoriaSelecionadaCodigo)) &&
      this.anoCadastro >= 2025);

    var itemSelect = (this.tipo == 'Despesa' &&
      !(['1.05', '1.07', '1.08','1.18','2.11','7.01','7.02','7.05'].includes(this.itemCategoriaSelecionadoCodigo)) &&
      this.anoCadastro >= 2025);

    if(categoriaSelect == false) {
      this.isDespesaComComprovant = categoriaSelect;
      return categoriaSelect;
    }

    if(itemSelect) {
      this.isDespesaComComprovant = itemSelect;
      return itemSelect;
    }

    return false;
  }

  excluirRelatorioViagensSelecionado() {
     this.formCopiar.get('idRelatorioViagens').setValue(null);
     this.isRelatorioViagensSelecionado = false;
     this.relatorioViagens = null;
  }

  pesquisaViagens(){
    //abrir modal
    const modalRef = this.ngbModal.open(ModalPesquisaRelatorioViagensComponent,{ size: 'lg', centered: true });

    //recuperar selecionado
    modalRef.componentInstance.retorno.subscribe((x) => {
      if (x != null) {
        this.relatorioViagens = x;
        this.formCopiar.get('idRelatorioViagens').setValue(x.idRelatorioViagens);
        this.isRelatorioViagensSelecionado = true;
      } else {
        alert('Ocorreu um erro ao selecionar o Relatório de Viagens. Favor verifique.');
        this.isRelatorioViagensSelecionado = false;
      }
    });

  }
  
  get objCategoriaItemSelecionada() {
    const idCategoria = this.formCopiar.controls.idCategoria.value;
    return this.lstCategoria.find(c => c.idCategoriaItemPlanoDeConta === idCategoria) || null;
  }
  
  get isCategoriaSelecionadaViagensOuDiariasNoPais() {
    if (!this.objCategoriaItemSelecionada) return false;
    const desc = this.objCategoriaItemSelecionada.descricao.toUpperCase().trim();
    return  desc === 'VIAGENS' || desc === 'DIÁRIAS NO PAÍS';
  }
}
