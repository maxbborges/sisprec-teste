import { formatCurrency } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalCadastroFornecedorComponent } from 'src/app/shared/components/modal-cadastro-fornecedor/modal-cadastro-fornecedor.component';
import { AlterarLancamentoDespesa } from 'src/app/shared/models/commands/cmdLancamento';
import { Colaborador, Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { ModalPesquisaFornecedorComponent } from 'src/app/shared/pesquisa-fornecedor/modal-pesquisa-fornecedor.component';
import { ModalPesquisaRelatorioViagensComponent } from 'src/app/shared/pesquisa-relatorio-viagens/modal-pesquisa-relatorio-viagens.component';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
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
  selector: 'app-editar-despesa-conta-corrente',
  templateUrl: './editar-despesa-conta-corrente.component.html',
  styleUrls: ['./editar-despesa-conta-corrente.component.scss'],
  standalone: false
})
export class EditarDespesaContaCorrenteComponent implements OnInit {

  public formEditar: FormGroup;
  public usuarioLogado: Usuario;
  public idDespesa: any;
  public itemCategoria: any[] = [];
  public lstTipoFornecedor: any[] = [];
  public lstTipo: any[] = [];
  public despesa: any;
  public lancamento: any;
  public tipoFornecedor: any;
  public fornecedor: any;
  public tipo: string = "Despesa";
  public lstCategoria: any[] = [];
  public mostrararquivo = false;
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
    private relatorioViagensService: ApiRelatorioViagensService,
    private colaboradorService: ApiColaboradorService
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.idDespesa = this.route.snapshot.params.idDespesa;
    this.inicializarFormulario();

    this.obterColaboradores();
    this.obterTipos();
    this.obterTiposComprovante();
    this.obterLancamentoSaidaItem();
    this.obterArquivos();
  }

  obterArquivos() {
    const filtros = {
      idDespesa: this.idDespesa,
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
          this.formEditar.value.idArquivos.push(arquivo.idArquivo);
        });
      }
    );
  }

  deletarArquivo(i: number) {
    this.listaArquivos.splice(i, 1);
    this.formEditar.value.idArquivos.splice(i, 1);
    if (this.formEditar.value.idArquivos.length === 0) {
      this.formEditar.patchValue({idArquivo : null});
    }
    this.verificaValidadeFormulario();
  }

  subiuArquivo(arquivo: any) {
    this.formEditar.patchValue({idArquivo : '00000000-0000-0000-0000-000000000000'});
    this.listaArquivos.push(arquivo);
    this.formEditar.value.idArquivos.push(arquivo.idArquivo);
  }

  onChangeTipo(tipoConta: any) {
    this.despesa.idTipo = tipoConta.idIndicador;
    this.tipo = tipoConta.nome;
    this.limparDadosFornecedorSelecionado();
    this.excluirRelatorioViagensSelecionado();
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

  obterLancamentoSaidaItem() {
    this.lancamentoService.obterLancamentoDespesasPorIdDespesa(this.idDespesa).subscribe(
      data => {
        this.despesa = data;
        this.tipo = this.despesa.tipo;
        this.comprovanteSelecionado = this.despesa.idTipoComprovante;
        this.numeroDoComprovante = this.despesa.numeroComprovante;
        //this.dataDoComprovante = new Date(this.despesa.dataComprovante);

        if(data.idRelatorioViagens !== null && data.idRelatorioViagens !== undefined) {
          this.relatorioViagensService.recuperarRelatorioPorId(data.idRelatorioViagens).subscribe((v) => {
            this.relatorioViagens = v;
            this.isRelatorioViagensSelecionado = true;
          })
        }
      },
      (error) => {
        console.log(error);
      },
      () => {
        this.obterLancamento();
        this.populaCamposFormulario();
      }
    );
  }

  onChangeFiltrarCategoriaItem() {
    this.itemCategoriaSelecionadoCodigo = "";
    const selecao = this.formEditar.controls.idCategoria.value;

    const categoriaSelecionada = this.lstCategoria.find(x => x.idCategoriaItemPlanoDeConta === selecao);
    if (selecao != '') {
      this.categoriaSelecionadaCodigo = categoriaSelecionada.codigo;
      this.planoContaService.obterItemCategoriasPorIdCategoria(selecao).subscribe(
        data => {
          this.itemCategoria = data;
          let idItemCategoria = this.itemCategoria[0].idItemPlanoDeConta;
          //this.categoriaSelecionada = idCategoria;
          this.itemCategoria.forEach((value) => {
            if(value.idItemPlanoDeConta === this.formEditar.controls.idCategoriaItem.value){
              idItemCategoria = this.formEditar.controls.idCategoriaItem.value
            }
          });
          this.formEditar.controls.idCategoriaItem.setValue(idItemCategoria);
          this.defineItem(idItemCategoria);
          this.defineCategoria(selecao);
          this.despesa.colaboradores.forEach(element => {
            this.colaboradorSelecionado = element.idColaborador;
            this.colaboradorSalario = element.salario;
            this.addColaborador(this.colaboradorSalario,false);
          });
          this.isTipoDespesa = (this.despesa.idTipo == 1014);
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
    this.formEditar = this.formBuilder.group({
      idDespesa: ['', [Validators.required]],
      idLançamento: ['', [Validators.required]],
      idTipo: ['', [Validators.required]],
      idCategoria: ['', [Validators.required]],
      idCategoriaItem: ['', [Validators.required]],
      dataEvento: ['', [Validators.required]],
      valor: ['', [Validators.required]],
      idTipoFornecedor: [''],
      numeroDocumento: [''],
      idRelatorioViagens: [null],
      descricao: [''],
      idArquivo:  ['', [Validators.required, Validators.minLength(4)]],
      idArquivos: [[], [Validators.nullValidator]],
      nomeRazaoSocial: [''],
      idFornecedor: [0],
      idColaborador:[''],
      salario: [0, [Validators.required, Validators.min(0)]],
      idTipoComprovante: [''],
      numeroComprovante: [''],
      dataComprovante: ['']
    });
    this.formEditar.controls.idDespesa.setValue("")
    this.formEditar.controls.idDespesa.updateValueAndValidity();
  }

  populaCamposFormulario() {
    this.formEditar.patchValue({
      idDespesa: this.despesa.idPrestacaoContaItemSaida,
      idLançamento: this.despesa.idLancamento,
      idTipo: this.despesa.idTipo,
      idCategoria: this.despesa.idCategoria,
      idCategoriaItem: this.despesa.idCategoriaItem,
      dataEvento: this.tratarData(this.despesa.dataEvento),
      valor: this.despesa.valor,
      idTipoFornecedor: this.despesa.idTipoFornecedor,
      numeroDocumento: this.despesa.numeroDocumentoFornecedor,
      descricao: this.despesa.descricao,
      idArquivo: this.despesa.idArquivo,
      nomeRazaoSocial: this.despesa.fornecedor,
      idFornecedor: this.despesa.idFornecedor,
      idRelatorioViagens: this.despesa.idRelatorioViagens,
      idTipoComprovante: this.despesa.idTipoComprovante,
      numeroComprovante: this.despesa.numeroComprovante,
      dataComprovante: this.tratarData(this.despesa.dataComprovante)
    });

    if (this.despesa.idFornecedor > 0) {
      this.isFornecedorSelecionado = true;
    }
    this.tipo = this.despesa.tipo;
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
  obterLancamento() {
    this.lancamentoService.visualizarLancamento(this.despesa.idLancamento).subscribe(
      data => {
        this.lancamento = data;
        this.obterCategoriaPlanoDeConta(this.lancamento.anoExercicio);
        if(data.dataCadastro != null && data.dataCadastro != undefined && data.dataCadastro != ""){
          this.anoCadastro = new Date(data.dataCadastro).getFullYear();
        }
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

  editar() {
    let abortar = this.validarSalarioDespesa();
    if(abortar) return;
    abortar = this.validarComprovante();
    if(abortar) return;
    // Permite que o lançamento seja alterado sem o arquivo. O arquivo não será alterado
    if (this.formEditar.value.idArquivo === '' || this.formEditar.value.idArquivo === null) {
      this.formEditar.patchValue({ idArquivo: '00000000-0000-0000-0000-000000000000' });
    }

    if (this.formEditar.get('idTipo').value == 1014 && this.formEditar.get('idFornecedor').value == 0 && !this.isTipoDespesa) {
      this._modal.alert('Por favor, selecione um Fornecedor', 'Atenção', 'a');
      return;
    }

    if(this.lstColaboradoresSelecionados.length === 0 && this.isTipoDespesa){
      this._modal.alert('Por favor, selecione um Colaborador', 'Atenção', 'a');
      return;
    }

    if(this.isTipoDespesa){
        this.limparDadosFornecedorSelecionado();
        this.excluirRelatorioViagensSelecionado();
      } else {
        this.lstColaboradoresSelecionados = [];
    }

    if(!this.isCategoriaSelecionadaViagensOuDiariasNoPais) {
      this.excluirRelatorioViagensSelecionado();
    }

    const lancamento: AlterarLancamentoDespesa = this.formEditar.value;
    lancamento.idDespesa = this.despesa.idPrestacaoContaItemSaida;
    lancamento.verificarSaldoLancamento = true;
    lancamento.idUsuario = this.usuarioLogado.idUsuario;
    lancamento.idCategoriaItem = this.formEditar.controls.idCategoriaItem.value;
    lancamento.colaboradores = [];
    this.lstColaboradoresSelecionados.forEach(element => {
      lancamento.colaboradores.push({idLancamento: null,
        IdPrestacaoContaItemSaida: this.idDespesa,
        idUsuarioCadastro: this.usuarioLogado.idUsuario,
        idColaborador: element.idColaborador,
        salario: +this.removerformatarValor(element.salario).toFixed(2)}
      );
    });

    if (this.formEditar.valid) {
      if(this.usuarioLogado.tipoUsuarioSigla == "UsuarioFederacao"){
        var idLancamento = this.formEditar.controls.idLançamento.value;
        var idTipoComp = this.formEditar.controls.idTipoComprovante.value;
        var numeroComp = this.formEditar.controls.numeroComprovante.value;
        var dataC = null;
        if(this.formEditar.controls.dataComprovante.value){
          dataC = this.formEditar.controls.dataComprovante.value.toString().replace("-","").replace("-","");
          if(dataC == '19000101' || dataC == "") {
            dataC = null;
            lancamento.dataComprovante = null;
          }
        }
        var abortCadastro = false;
        if(this.isDespesaComComprovant == false){
          idLancamento = null;
          idTipoComp = null;
          numeroComp = null;
          dataC = null;
          lancamento.dataComprovante = null;
          lancamento.numeroComprovante = null;
          lancamento.idTipoComprovante = null;
        }
        if(dataC != null && numeroComp != null && numeroComp != ""){
          this.itemLancamentoService.getLancamentoSaidaItem(idLancamento,+idTipoComp, numeroComp, dataC,this.usuarioLogado.idFiliacao).subscribe(
            (data) => {
              if(data == null || (data.data !== null && data.data.length > 0 && data.data[0].idPrestacaoContaItemSaida == this.idDespesa)){//outra verificacao aqui
                console.clear();
                this.lancamentoService.alterarLancamentoDespesa(lancamento).subscribe((data) => {
                  if (data) {
                    this._modal.alert('Lançamento alterado com sucesso',"Sucesso","s");
                    this.router.navigate(['gestaoFinanceira/conta-corrente/despesasLancamento/' + this.lancamento.idLancamento]);
                  } else {
                    this._modal.alert('Ocorreu um erro ao alterar o lançamento na Conta Corrente', 'Erro', 'e');
                  }
                }, (error) => {
                  this._modal.alert('Ocorreu um erro ao alterar o lançamento na Conta Corrente', 'Erro', 'e');
                });
              }else
              {
                var dt = new Date(this.formEditar.controls.dataComprovante.value+'T00:00:00');
                var tipo = this.lstComprovante.filter(
                  (item) => item.idIndicador == +this.formEditar.controls.idTipoComprovante.value
                )[0].nome;
                this.m.alert(`Já existe uma despesa com o número ${this.formEditar.controls.numeroComprovante.value} para ${tipo} na data ${ dt.toLocaleDateString('pt-BR')}. Verifique os dados antes de prosseguir neste lançamento.`, 'Aviso', 'a');
                abortCadastro = true;
              }
            },
            (error) => {
  
            }
          )
          if (abortCadastro) return;
        }else{
          console.clear();
          this.lancamentoService.alterarLancamentoDespesa(lancamento).subscribe((data) => {
            if (data) {
              this._modal.alert('Lançamento alterado com sucesso',"Sucesso","s");
              this.router.navigate(['gestaoFinanceira/conta-corrente/despesasLancamento/' + this.lancamento.idLancamento]);
            } else {
              this._modal.alert('Ocorreu um erro ao alterar o lançamento na Conta Corrente', 'Erro', 'e');
            }
          }, (error) => {
            this._modal.alert('Ocorreu um erro ao alterar o lançamento na Conta Corrente', 'Erro', 'e');
          });
        }
      }
    } else {
      this._modal.alert('Por favor, preencha todos os campos obrigatórios', 'Atenção', 'a');
    }
  }

  alterarArquivo() {
    this.mostrararquivo = true;
  }

  excluirFornecedor() {
    this.limparDadosFornecedorSelecionado();
  }

  limparDadosFornecedorSelecionado() {
    this.isFornecedorSelecionado = false;
    this.formEditar.get('numeroDocumento').setValue('');
    this.formEditar.get('nomeRazaoSocial').setValue('');
    this.formEditar.get('idFornecedor').setValue(0);
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
    modalRefCadastro.componentInstance.retorno.subscribe((x:any) => {
      this.preencherDadosFornecedor(x);
    });

    modalRefCadastro.result.then((_sucesso) => {}, (erro) => {
      if(erro == "voltar") {
        this.pesquisaFornecedor();
      }
    });
  }

  preencherDadosFornecedor(x:any){
    if (x != null) {
      this.fornecedor = x;
      this.formEditar.get('numeroDocumento').setValue(x.numeroDocumento);
      this.formEditar.get('nomeRazaoSocial').setValue(x.nome);
      this.formEditar.get('idFornecedor').setValue(x.idFornecedor);
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
      this.formEditar.get('idArquivo').clearValidators();
      this.formEditar.get('idArquivo').updateValueAndValidity();
    } else {
      this.formEditar.get('idArquivo').setValidators([Validators.required, Validators.minLength(4)]);
      this.formEditar.get('idArquivo').updateValueAndValidity();
    }
  }

  cancelar() {
    this._modal.confirm('Deseja cancelar?').subscribe(resultado => {

      if (resultado) {
        this.router.navigate(['gestaoFinanceira/fornecedor']);
        return;
      }

      this._modal.close();
    });
  }

  //Colaborador
  obterColaboradores() {
    this.lstColaborador = []
    this.itemCategoria = []
    this.colaboradorService.listarTodosColaboradores(this.usuarioLogado.idFiliacao).subscribe(
      data => {
        this.lstColaborador = data;
      }
    );
  }

  addColaborador(salario,showMsg: boolean = true){
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
  validarSalarioDespesa(isIncluirDigitacao: Boolean = false): Boolean{
    let abortar:Boolean = false;
    var totalDespesa = this.formEditar.get('valor').value;
    var salarioSelecionado = 0.0;
    if (isIncluirDigitacao){
      salarioSelecionado = this.formEditar.get('salario').value ? this.formEditar.get('salario').value : 0.0;
    }
    var totalSalarios = 0 + salarioSelecionado;
    this.lstColaboradoresSelecionados.forEach(element => {
      totalSalarios = totalSalarios + this.removerformatarValor(element.salario);
    });
    if(totalSalarios > totalDespesa){
      this.m.alert('O valor dos salários superam a despesa informada', 'Aviso', 'a');
      abortar = true;
    }
    return abortar;
  }
  validarComprovante(): Boolean{
    let abortar:Boolean = false;
    return abortar;
  }
  removerColaborador(idColaborador){
    this.lstColaboradoresSelecionados = this.lstColaboradoresSelecionados.filter((x)=>{
      if(x.idColaborador != idColaborador) return x;
    })
    if(this.lstColaboradoresSelecionados.length == 0){
      //this.formCadastro.get('valor').enable();
    }
  }
  removerformatarValor(valor: any): number {
    try{
      let valorTratado = '';
      if(valor == null || valor == undefined){
        return 0;
      }else if(valor.toString().includes('R$')){
        valorTratado = valor.replace(/[^\d,]+/g, '').trim();
        valorTratado = valorTratado.replace(',','.').trim();
        return +valorTratado;
      }else if(valor.toString().includes('%')){
        valorTratado = valor.replace('%','').trim();
        return +valorTratado;
      }else if(valor.toString().includes(',')){
        valorTratado = valor.replace(',','.').trim();
        return +valorTratado;
      }else{
        return +valor;
      }
    }catch(err){

    }
  }
  mostrarCategoria(event){
    const idCategoria = event.target.value;
    this.defineCategoria(idCategoria);
  }
  defineCategoria(idCategoria){
    const selecaoItem = this.lstCategoria.filter(element => {
      if(element.idCategoriaItemPlanoDeConta == idCategoria){
        return element;
      }
    })
    this.categoriaSelecionada = selecaoItem[0].idCategoriaItemPlanoDeConta;
    this.categoriaSelecionadaCodigo = selecaoItem[0].codigo;
  }
  mostrarItem(event){
    const item = event.target.value;
    this.defineItem(item);
    this.defineCategoria(this.categoriaSelecionada);
    if(this.formEditar.controls.idTipo.value == '1014') this.tipo = 'Despesa';
    this.isDespesa();
    this.isDespesaComComprovante();
  }
  defineItem(item){
    const selecaoItem = this.itemCategoria.filter(element => {
      if(element.idItemPlanoDeConta == item){
        return element;
      }
    })
    this.itemCategoriaSelecionadoCodigo = selecaoItem[0].codigo;
    this.isDespesaComComprovante();
  }
  isDespesa(){
    if(this.tipo == undefined && this.despesa.idTipo == '1014') {this.tipo = 'Despesa';}
    this.isTipoDespesa = (this.tipo == 'Despesa' &&
      (['3.01', '3.02', '8.04','8.07'].includes(this.itemCategoriaSelecionadoCodigo)) &&
      this.anoCadastro >= 2025
    );
  }
  isDespesaComComprovante(){
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
     this.formEditar.get('idRelatorioViagens').setValue(null);
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
        this.formEditar.get('idRelatorioViagens').setValue(x.idRelatorioViagens);
        this.isRelatorioViagensSelecionado = true;
      } else {
        alert('Ocorreu um erro ao selecionar o Relatório de Viagens. Favor verifique.');
        this.isRelatorioViagensSelecionado = false;
      }
    });
    
  }
  
  get objCategoriaItemSelecionada() {
    const idCategoria = this.formEditar.controls.idCategoria.value;
    return this.lstCategoria.find(c => c.idCategoriaItemPlanoDeConta === idCategoria) || null;
  }
  
  get isCategoriaSelecionadaViagensOuDiariasNoPais() {
    if (!this.objCategoriaItemSelecionada) return false;
    const desc = this.objCategoriaItemSelecionada.descricao.toUpperCase().trim();
    return  desc === 'VIAGENS' || desc === 'DIÁRIAS NO PAÍS';
  }
}
