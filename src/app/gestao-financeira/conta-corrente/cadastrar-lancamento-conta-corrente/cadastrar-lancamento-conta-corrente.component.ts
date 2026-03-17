import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarItensLancamentoFiltrado } from 'src/app/shared/models/commands/cmdItensLancamento';
import { InserirLancamento } from 'src/app/shared/models/commands/cmdLancamento';
import { FiltroDetalhePrestacaoContas, Indicador, ItemLancamento, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiItemLancamentoService } from 'src/app/shared/services/api-item-lancamento.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-cadastrar-lancamento-conta-corrente',
  templateUrl: './cadastrar-lancamento-conta-corrente.component.html',
  styleUrls: ['./cadastrar-lancamento-conta-corrente.component.scss'],
  standalone: false
})
export class CadastrarLancamentoContaCorrenteComponent implements OnInit {
  public usuarioLogado: Usuario;
  public formCadastro: FormGroup;
  public lstTipoLancamento: Indicador[] = [];
  public lstItemLancamento: ItemLancamento[] = [];
  public lstItens: Indicador[] = [];
  public desativarSalvar = true;
  public idAplicacaoCI = 0;
  public idResgateCI = 0;
  public idLancCCEntrada = 0;
  public exibirCampoItem = false;
  public exibirCampoArquivo = false;
  public nomeArquivo: string = '';
  public idArquivo: string = '';
  acaoBloqueada: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private indicadorService: ApiIndicadorService,
    private lancamentoService: ApiLancamentoService,
    private itemLancamentoService: ApiItemLancamentoService,
    private prestacaoService: ApiPrestacaoContasService,
    private storageService: StorageService,
    private router: Router,
    private _segurancaService: SegurancaCheckService,
    private location: Location
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.carregarListaTipoLancamento();
    this.carregarIdTipoAplicacao();
    this.carregarIdTipoResgate();
    this.carregarIdTipoEntrada();
    this.inicializarFormulario();
    this.limparDadosArquivo();
    this.carregarExercicio();
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      idTipoLancamento: ['', [Validators.required]],
      anoExercicio: ['', [Validators.required]],
      mesExercicio: ['', [Validators.required]],
      dataEvento: ['', [Validators.required]],
      valor: ['', [Validators.required]],
      idItemLancamento: [null]
    });

  }

  carregarExercicio(){
    console.log(this.router.url)
    console.log(this.router.url.split("cadastrarLancamento/"));
    const urlSplit = this.router.url.split("cadastrarLancamento/")
    if (urlSplit[1] !== undefined){
      const dataExercicio = urlSplit[1].split('/'); // primeiro item do array será o ano e o segundo será o mês

      if (dataExercicio[0] !== null && dataExercicio[0] !== undefined){
        this.formCadastro.get("anoExercicio").setValue(dataExercicio[0]);
        this.formCadastro.get("mesExercicio").setValue(dataExercicio[1]);
      }
    }
  }

  carregarListaTipoLancamento() {
    this.indicadorService.listarTodosIndicadoresPorTipoSigla('TipoLancamentoContaCorrente').subscribe((lstTipos) => {
      this.lstTipoLancamento = lstTipos;
    }, (error) => {
      console.log('Erro ao carregar lista de tipos de lançamento:');
      console.log(error);
    });
  }

  carregarListaItensLancamento() {

    if (this.formCadastro.controls.idTipoLancamento.valid && this.formCadastro.controls.anoExercicio.valid) {
      const cmdFiltrarListaItens: ListarItensLancamentoFiltrado = {
        idTipoLancamento: this.formCadastro.controls.idTipoLancamento.value,
        anoExercicio: this.formCadastro.controls.anoExercicio.value
      };
      console.log(cmdFiltrarListaItens);
      this.itemLancamentoService.listarItensLancamentoFiltrado(cmdFiltrarListaItens).subscribe((lstItens) => {
        this.lstItemLancamento = lstItens;
      }, (error) => {
        console.log('Erro ao carregar lista de itens:');
        console.log(error);
      });
    }
  }

  salvar() {

    if (confirm('Deseja realmente salvar?')) {

      const lancamento: InserirLancamento = this.formCadastro.value;
      lancamento.idUsuarioCadastro = this.usuarioLogado.idUsuario;
      lancamento.idFederacao = this.usuarioLogado.idFiliacao;
      lancamento.idArquivo = this.idArquivo;
      console.log('Valores:');
      console.log(lancamento);

      if (this.formCadastro.valid) {
        this.lancamentoService.inserirLancamentoContaCorrente(lancamento).subscribe((data) => {
          if (data) {
            this.alertService.exibirAlerta('Lançamento cadastrado com sucesso', tipo.sucesso);
            this.location.back();
            // this.router.navigate(['gestaoFinanceira/conta-corrente/extrato']);
            this.ngOnInit();
          } else {
            this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o lançamento na Conta Corrente', tipo.erro);
          }
        }, (error) => {
          console.log('Erro ao inserir Lançamento CI:');
          console.log(error);
          this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o lançamento na Conta Corrente', tipo.erro);
        });
        console.log('Salvando lançamento conta corrente:');
        console.log(this.formCadastro.value);
      } else {
        this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios', tipo.atencao);
      }
    }
  }

  carregarIdTipoResgate() {
    this.indicadorService.visualizarIndicadorPorSigla('LancCCResgateCI').subscribe((indicador) => {
      this.idResgateCI = indicador.idIndicador;
    });
  }

  carregarIdTipoAplicacao() {
    this.indicadorService.visualizarIndicadorPorSigla('LancCCAplicacaoCI').subscribe((indicador) => {
      this.idAplicacaoCI = indicador.idIndicador;
    });
  }

  carregarIdTipoEntrada() {
    this.indicadorService.visualizarIndicadorPorSigla('LancCCEntrada').subscribe((indicador) => {
      this.idLancCCEntrada = indicador.idIndicador;
    });
  }

  mudarTipoLancamento() {

    if (this.formCadastro.controls.idTipoLancamento.value === this.idResgateCI ||
      this.formCadastro.controls.idTipoLancamento.value === this.idAplicacaoCI) {
      this.exibirCampoItem = false;
      this.formCadastro.controls.idItemLancamento.clearValidators();
      this.formCadastro.patchValue({
        idItemLancamento: null
      });
    } else {
      this.formCadastro.patchValue({
        idItemLancamento: null
      });
      this.exibirCampoItem = true;
      this.formCadastro.controls.idItemLancamento.setValidators(Validators.required);
    }
    if(this.formCadastro.controls.idTipoLancamento.value === this.idLancCCEntrada) {
      this.exibirCampoArquivo = true;
    } else {
      this.exibirCampoArquivo = false;
    }
    this.formCadastro.updateValueAndValidity();
    this.carregarListaItensLancamento();
  }

  mudouAno(){
    this.carregarListaItensLancamento();
    this.verificaSeExistePrestacao();
  }

  verificaSeExistePrestacao() {
    const mes = this.formCadastro.controls.mesExercicio.value;
    const ano = this.formCadastro.controls.anoExercicio.value;

    if (mes !== '' && ano !== '') {
      const filtro: FiltroDetalhePrestacaoContas = {
        anoExercicio: ano, mesExercicio: mes, idFederacao: this.usuarioLogado.idFiliacao, sigla: null
      };

      this.prestacaoService.verificaStatusPrestacaoContas(filtro).subscribe(
        data => {
          if (data.length > 0 && data[0].status !== 'RetornadaAjustes') {
            this.alertService.exibirAlerta('Existe um prestação de contas nesse periodo.', tipo.atencao);
            this.formCadastro.get('mesExercicio').setValue('');
            this.formCadastro.get('mesExercicio').updateValueAndValidity();
          }
        });

    }

    console.clear();
    console.log(mes);
    console.log(ano);
  }

  subiuArquivo(event) {
    this.nomeArquivo = event.nomeArquivo;
    this.idArquivo = event.idArquivo;
  }

  limparDadosArquivo() {
    this.nomeArquivo = '';
    this.idArquivo = null;
    this.exibirCampoArquivo = false;
  }

}
