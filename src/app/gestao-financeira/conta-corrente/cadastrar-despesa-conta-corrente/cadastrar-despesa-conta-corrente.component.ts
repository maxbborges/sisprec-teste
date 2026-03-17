import { formatCurrency, Location } from '@angular/common';
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
import { ApiColaboradorService } from 'src/app/shared/services/api-colaborador.service';
import { ApiFornecedorService } from 'src/app/shared/services/api-fornecedor.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiItemLancamentoService } from 'src/app/shared/services/api-item-lancamento.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ApiPlanoDeContasService } from 'src/app/shared/services/api-plano-de-contas.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cadastrar-despesa-conta-corrente',
  templateUrl: './cadastrar-despesa-conta-corrente.component.html',
  styleUrls: ['./cadastrar-despesa-conta-corrente.component.scss'],
  standalone: false
})
export class CadastrarDespesaContaCorrenteComponent implements OnInit {

  public formCadastro: FormGroup;
  public usuarioLogado: Usuario;
  public fornecedor: any;
  public relatorioViagens: any;
  public itemCategoria: any[] = [];
  public lstTipoFornecedor: any[] = [];
  public lstTipo: any[] = [];
  public lancamento: any;
  public idLancamento: any;
  public tipoFornecedor: any;
  public lstCategoria: any[] = [];
  public tipo: string;
  public urlDownload = environment.urlApiSisprec + 'arquivo/porId/';
  public listaArquivos: any[] =[];
  public acaoBloqueada: boolean = false;
  public isFornecedorSelecionado: boolean = false;
  public isRelatorioViagensSelecionado: boolean = false;

  public lstColaborador: Colaborador[] = [];
  public colaboradorSelecionado: any;
  public colaboradorSalario: number = 0;
  public lstColaboradoresSelecionados: Colaborador[] = [];

  public categoriaSelecionada: any;
  public categoriaSelecionadaCodigo: any;
  public lstComprovante: Indicador[] = [];

  public itemCategoriaSelecionadoCodigo: string;

  public anoCadastro: number = 0;

  public comprovanteSelecionado: string;
  public numeroDoComprovante: string;
  public dataDoComprovante: Date;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private storageService: StorageService,
    private fornecedorService: ApiFornecedorService,
    private lancamentoService: ApiLancamentoService,
    private itemLancamentoService: ApiItemLancamentoService,
    private indicadorService: ApiIndicadorService,
    private route: ActivatedRoute,
    private planoContaService: ApiPlanoDeContasService,
    private _segurancaService: SegurancaCheckService,
    private ngbModal: NgbModal,
    private router: Router,
    private m: ModalService,
    private colaboradorService: ApiColaboradorService,
    private location: Location
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);

    this.route.params.subscribe(params => {
      if (params) {
        this.idLancamento = params.idLancamento;
      }
    });
    this.inicializarFormulario();
    this.obterLancamento();
    this.obterTipos();
    this.obterTipoFornecedor();
    this.obterTiposComprovante();
    this.obterColaboradores();
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      idTipo: ['', [Validators.required]],
      idCategoria: ['', [Validators.required]],
      idCategoriaItem: ['', [Validators.required]],
      dataEvento: ['', [Validators.required]],
      valor: ['', [Validators.required]],
      idTipoFornecedor: [''],
      numeroDocumento: [''],
      idFornecedor: [0],
      idRelatorioViagens: [null],
      descricao: [''],
      idArquivo:  ['', [Validators.required, Validators.minLength(4)]],
      idArquivos: [[], [Validators.nullValidator]],
      ano: ['', [Validators.nullValidator]],
      mes: ['', [Validators.nullValidator]],
      idFederacao: this.usuarioLogado.idFiliacao,
      idUsuario: this.usuarioLogado.idUsuario,
      verificarSaldoLancamento : true,
      nomeRazaoSocial: [''],
      idColaborador:[''],
      salario: [0, [Validators.required, Validators.min(0)]],
      idTipoComprovante: [''],
      numeroComprovante: [''],
      dataComprovante: ['']
    });
  }

  subiuArquivo(idNovoArquivo: any) {
    //this.lstArquivo.push(idArquivo);
    this.formCadastro.patchValue({idArquivo : 'true'});
    this.listaArquivos.push(idNovoArquivo)
    this.formCadastro.value.idArquivos.push(idNovoArquivo.idArquivo);
  }

  deletarArquivo(i: number){
    this.listaArquivos.splice(i, 1);
    this.formCadastro.value.idArquivos.splice(i, 1);
    if(this.formCadastro.value.idArquivos.length == 0){
      this.formCadastro.patchValue({idArquivo : null});
    }
  }

  obterLancamento() {
    this.lancamentoService.visualizarLancamento(this.idLancamento).subscribe(
      result => {
        this.lancamento = result;
        if(result.dataCadastro != null && result.dataCadastro != undefined && result.dataCadastro != ""){
          this.anoCadastro = new Date(result.dataCadastro).getFullYear();
        }
        this.formCadastro.patchValue({ano: this.lancamento.anoExercicio})
        this.formCadastro.patchValue({mes: this.lancamento.mesExercicio})
        this.obterCategoriaPlanoDeConta(this.lancamento.anoExercicio);
      }
    );
  }

  obterTipos() {
    this.indicadorService.listarTodosIndicadoresPorTipoId(9).subscribe(
      result => {
        this.lstTipo = result;
      }
    );
  }

  obterTipoFornecedor() {
    this.indicadorService.listarTodosIndicadoresPorTipoId(4).subscribe(
      result => {
        this.lstTipoFornecedor = result;
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

  obterCategoriaPlanoDeConta(ano: number) {
    this.lstCategoria = []
    this.itemCategoria = []
    this.planoContaService.obterCategoriasPorExercicio(ano).subscribe(
      data => {
        this.lstCategoria = data;
      }
    );
  }

  onChangeFiltrarCategoriaItem() {
    this.itemCategoriaSelecionadoCodigo = "";
    const selecao = this.formCadastro.controls.idCategoria.value;
    this.defineCategoria(selecao);
    const categoriaSelecionada = this.lstCategoria.find(x => x.idCategoriaItemPlanoDeConta === selecao);
    if(categoriaSelecionada.codigo == 13) {
      this.formCadastro.get('idArquivo').clearValidators();
      this.formCadastro.get('idArquivo').updateValueAndValidity();
    } else {
      this.formCadastro.get('idArquivo').setValidators([Validators.required, Validators.minLength(4)]);
      this.formCadastro.get('idArquivo').updateValueAndValidity();
    }

    this.planoContaService.obterItemCategoriasPorIdCategoria(selecao).subscribe(
      data => {
        this.itemCategoria = data;
        this.formCadastro.controls.idCategoriaItem.setValue(this.itemCategoria[0].idItemPlanoDeConta);
        this.defineItem(this.itemCategoria[0].idItemPlanoDeConta);
      }
    );
  }

  // tslint:disable-next-line:no-shadowed-variable
  onChangeTipo(tipo: any) {
    this.tipo = tipo.nome;
    this.limparDadosFornecedorSelecionado();
    this.excluirRelatorioViagensSelecionado();
  }

  pesquisaFornecedor() {

    const modalRef = this.ngbModal.open(ModalPesquisaFornecedorComponent,{ size: 'lg', centered: true });

    modalRef.componentInstance.retorno.subscribe((x) => {
      this.preencherDadosFornecedor(x);
    });

    modalRef.result.then((_sucesso) => {}, (erro) => {
      if(erro == "cadastrar-fornecedor") {
        this.cadastrarFornecedor();
      }
    })
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
      this.formCadastro.get('numeroDocumento').setValue(x.numeroDocumento);
      this.formCadastro.get('nomeRazaoSocial').setValue(x.nome);
      this.formCadastro.get('idFornecedor').setValue(x.idFornecedor);
      this.isFornecedorSelecionado = true;
    } else {
      alert('Ocorreu um erro ao selecionar o Fornecedor. Favor verifique.');
      this.isFornecedorSelecionado = false;
    }
  }

  verificaTipoFornecedor(event) {
    console.clear();
    this.tipoFornecedor = event.target.id;
  }

  inserir(form: InserirLancamentoSaidaItem)
  {
    form.colaboradores = [];
    this.lstColaboradoresSelecionados.forEach(element => {
      form.colaboradores.push({idLancamento: form.idLancamento,
        IdPrestacaoContaItemSaida: 0,
        idUsuarioCadastro: this.usuarioLogado.idUsuario,
        idColaborador: element.idColaborador,
        salario: +this.removerformatarValor(element.salario).toFixed(2)}
      );
    });

    form = this.setUndefinedAsNull(form);
    try{
      if(form.dataComprovante.toString() == ''){ form.dataComprovante = null; }
    }catch{}
    this.itemLancamentoService.inserirLancamentoSaidaItem(form).subscribe((data) => {
      if (data == true) {
        this.m.alert('Despesa cadastrada com sucesso!', 'Sucesso', 's');
        this.formCadastro.reset();
        this.location.back();
        //this.router.navigate(['gestaoFinanceira/conta-corrente/despesasLancamento/' + this.idLancamento]);
      } else {
        let resultado$ =  this.m.confirm('Os totais de despesas ultrapassam o valor estimado para esse item, deseja continuar?',null)
        resultado$.subscribe(resultado => {
          if(resultado){
            form.verificarSaldoLancamento = false;
            this.inserir(form);
          }
        })
      }
    }, (error) => {
      this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar', tipo.erro);
    });
  }

  setUndefinedAsNull(form: InserirLancamentoSaidaItem){
    const chaves :Array<string> = Object.keys(form);

    chaves.forEach((chave) => {
      if(form[chave] === undefined){
        form[chave] = "";
      }
    });

    return form;
  }

  salvar() {
    let abortar = this.validarSalarioDespesa();
    if(abortar) return;
    abortar = this.validarComprovante();
    if(abortar) return;
    if (this.tipo === 'Devolução') {
      this.formCadastro.patchValue({ idTipoFornecedor: 0, numeroDocumento: '00' });
    }

    if(this.formCadastro.get('idTipo').value == 1014 && this.formCadastro.get('idFornecedor').value == 0 && !this.isDespesa()) {
      this.m.alert('Por favor, selecione um Fornecedor', 'Aviso', 'a')
      return;
    }

    if(this.lstColaboradoresSelecionados.length === 0 && this.isDespesa()){
      this.m.alert('Por favor, selecione um Colaborador', 'Atenção', 'a');
      return;
    }

    if (this.formCadastro.valid) {
      if(this.isDespesa()){
        this.limparDadosFornecedorSelecionado();
        this.excluirRelatorioViagensSelecionado();
      } else {
        this.lstColaboradoresSelecionados = [];
      }

      if(!this.isCategoriaSelecionadaViagensOuDiariasNoPais) {
      this.excluirRelatorioViagensSelecionado();
    }

      const form = this.formCadastro.value as InserirLancamentoSaidaItem;
      form.idLancamento = this.idLancamento;
      var dataC = null;
      if(form.dataComprovante){
        dataC = form.dataComprovante.toString().replace("-","").replace("-","");
      }
      var abortCadastro = false;
      if(this.usuarioLogado.tipoUsuarioSigla == "UsuarioFederacao" && this.tipo == 'Despesa'){
        if(dataC != null){
          this.itemLancamentoService.getLancamentoSaidaItem(form.idLancamento,+form.idTipoComprovante, form.numeroComprovante, dataC,this.usuarioLogado.idFiliacao).subscribe(
              (data) => {
                if(data == null){
                  console.clear();
                  this.m.confirm('Deseja realmente salvar?',null)
                    .pipe(
                      take(1),
                      switchMap(resultado => resultado ? of(this.inserir(form)) : EMPTY)
                      )
                    .subscribe(() => {});
                }else
                {
                  var dt = new Date(form.dataComprovante+'T00:00:00');
                  var tipo = this.lstComprovante.filter(
                    (item) => item.idIndicador == +form.idTipoComprovante
                  )[0].nome;
                  this.m.alert(`Já existe uma despesa com o número ${form.numeroComprovante} para ${tipo} na data ${ dt.toLocaleDateString('pt-BR')}. Verifique os dados antes de prosseguir neste lançamento.`, 'Aviso', 'a');
                  abortCadastro = true;
                }
              },
              (error) => {

              }
            )
            if (abortCadastro) return;
        }else{
          console.clear();
          this.m.confirm('Deseja realmente salvar?',null)
            .pipe(
              take(1),
              switchMap(resultado => resultado ? of(this.inserir(form)) : EMPTY)
              )
            .subscribe(() => {});
        }
      }else{
        console.clear();
        this.m.confirm('Deseja realmente salvar?',null)
          .pipe(
            take(1),
            switchMap(resultado => resultado ? of(this.inserir(form)) : EMPTY)
            )
          .subscribe(() => {});
      }
    } else {
      this.m.alert('Por favor, preencha todos os campos obrigatório', 'Aviso', 'a')
    }
  }

  excluirFornecedor() {
    this.limparDadosFornecedorSelecionado();
  }

  limparDadosFornecedorSelecionado() {
    this.isFornecedorSelecionado = false;
    this.formCadastro.get('numeroDocumento').setValue('');
    this.formCadastro.get('nomeRazaoSocial').setValue('');
    this.formCadastro.get('idFornecedor').setValue(0);
  }

  excluirRelatorioViagensSelecionado() {
     this.formCadastro.get('idRelatorioViagens').setValue(null);
     this.isRelatorioViagensSelecionado = false;
     this.relatorioViagens = null;
  }

  cancelar() {
    this.m.confirm('Deseja cancelar?').subscribe(resultado => {

      if (resultado) {
        this.router.navigate(['gestaoFinanceira/fornecedor']);
        return;
      }

      this.m.close();
    });
  }

  //Colaborador
  obterColaboradores() {
    this.lstColaborador = []
    this.itemCategoria = []
    this.colaboradorService.listarTodosColaboradores(this.usuarioLogado.idFiliacao).subscribe(
      data => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        this.lstColaborador = data.filter(c => {
          if (!c.dataDesligamento) return true;
          const dataDesligamento = new Date(c.dataDesligamento);
          dataDesligamento.setHours(0, 0, 0, 0);
          return dataDesligamento > hoje;
        })
      }
    );
  }

  addColaborador(){
    let abortar = this.validarSalarioDespesa(true);
    if(abortar) return;
    this.lstColaboradoresSelecionados.forEach(element => {
      if(element.idColaborador == this.colaboradorSelecionado) {
        this.m.alert('Colaborador já registrado', 'Aviso', 'a');
        abortar = true;
      }
    });
    if(abortar) return;
    this.lstColaborador.forEach(element => {
      if(element.idColaborador == this.colaboradorSelecionado) {
        element.salario = formatCurrency(this.formCadastro.get('salario').value,'pt-Br','R$');
        this.lstColaboradoresSelecionados.push(element);
      }
    });
  }
  validarSalarioDespesa(isIncluirDigitacao: Boolean = false): Boolean{
    let abortar:Boolean = false;
    var totalDespesa = this.formCadastro.get('valor').value;
    var salarioSelecionado = 0.0;
    if (isIncluirDigitacao){
      salarioSelecionado = this.formCadastro.get('salario').value ? this.formCadastro.get('salario').value : 0.0;
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
    return false;
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
  }
  defineItem(item){
    const selecaoItem = this.itemCategoria.filter(element => {
      if(element.idItemPlanoDeConta == item){
        return element;
      }
    })
    this.itemCategoriaSelecionadoCodigo = selecaoItem[0].codigo;
  }

  pesquisaViagens(){
    //abrir modal
    const modalRef = this.ngbModal.open(ModalPesquisaRelatorioViagensComponent,{ size: 'lg', centered: true });

    //recuperar selecionado
    modalRef.componentInstance.retorno.subscribe((x) => {
      if (x != null) {
        this.relatorioViagens = x;
        this.formCadastro.get('idRelatorioViagens').setValue(x.idRelatorioViagens);
        this.isRelatorioViagensSelecionado = true;
      } else {
        alert('Ocorreu um erro ao selecionar o Relatório de Viagens. Favor verifique.');
        this.excluirRelatorioViagensSelecionado();
      }
    });

  }

   isDespesa(){
      return (this.tipo == 'Despesa' &&
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
      if(categoriaSelect == false) return categoriaSelect;
      if(itemSelect) return itemSelect;
      return false;
    }
    
  get objCategoriaItemSelecionada() {
    const idCategoria = this.formCadastro.controls.idCategoria.value;
    return this.lstCategoria.find(c => c.idCategoriaItemPlanoDeConta === idCategoria) || null;
  }
  
  get isCategoriaSelecionadaViagensOuDiariasNoPais() {
    if (!this.objCategoriaItemSelecionada) return false;
    const desc = this.objCategoriaItemSelecionada.descricao.toUpperCase().trim();
    return  desc === 'VIAGENS' || desc === 'DIÁRIAS NO PAÍS';
  }
}
