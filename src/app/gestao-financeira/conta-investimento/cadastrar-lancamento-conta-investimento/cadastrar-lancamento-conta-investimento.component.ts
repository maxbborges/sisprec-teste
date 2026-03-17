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
  selector: 'app-cadastrar-lancamento-conta-investimento',
  templateUrl: './cadastrar-lancamento-conta-investimento.component.html',
  styleUrls: ['./cadastrar-lancamento-conta-investimento.component.scss'],
  standalone: false
})
export class CadastrarLancamentoContaInvestimentoComponent implements OnInit {
  public usuarioLogado: Usuario;
  public formCadastro: FormGroup;
  public lstTipoLancamento: Indicador[] = [];
  public lstItemLancamento: ItemLancamento[] = [];
  public lstItens: Indicador[] = [];
  public desativarSalvar = true;
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
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.carregarListaTipoLancamento();
    this.inicializarFormulario();
    this.carregarExercicio();
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      idTipoLancamento: ['', [Validators.required]],
      anoExercicio: ['', [Validators.required]],
      mesExercicio: ['', [Validators.required]],
      dataEvento: ['', [Validators.required]],
      valor: ['', [Validators.required]],
      idItemLancamento: [null, [Validators.required]]
    });
  }

  carregarExercicio() {
    console.log(this.router.url)
    console.log(this.router.url.split("cadastrarLancamento/"));
    const urlSplit = this.router.url.split("cadastrarLancamento/")
    if (urlSplit[1] !== undefined) {
      const dataExercicio = urlSplit[1].split('/'); // primeiro item do array será o ano e o segundo será o mês

      if (dataExercicio[0] !== null && dataExercicio[0] !== undefined) {
        this.formCadastro.get("anoExercicio").setValue(dataExercicio[0]);
        this.formCadastro.get("mesExercicio").setValue(dataExercicio[1]);
      }
    }
  }

  carregarListaTipoLancamento() {
    this.indicadorService.listarTodosIndicadoresPorTipoSigla('TipoLancamentoContaInvestimento').subscribe((lstTipos) => {
      this.lstTipoLancamento = lstTipos;
    }, (error) => {
      console.log('Erro ao carregar lista de tipos de lançamento:');
      console.log(error);
    });
  }

  carregarListaItensLancamento() {
    // if (this.formCadastro.controls.idTipoLancamento.valid && this.formCadastro.controls.anoExercicio.valid) {
    this.formCadastro.get("idItemLancamento").setValue(null);
    const cmdFiltrarListaItens: ListarItensLancamentoFiltrado = {
      idTipoLancamento: this.formCadastro.controls.idTipoLancamento.value,
      anoExercicio: this.formCadastro.controls.anoExercicio.value
    };
    this.itemLancamentoService.listarItensLancamentoFiltrado(cmdFiltrarListaItens).subscribe((lstItens) => {
      this.lstItemLancamento = lstItens;
    }, (error) => {
      console.log('Erro ao carregar lista de itens:');
      console.log(error);
    });
    // }
  }

  salvar() {

    if (!confirm('Deseja realmente salvar?')) { return false; }

    const lancamento: InserirLancamento = this.formCadastro.value;
    lancamento.idUsuarioCadastro = this.usuarioLogado.idUsuario;
    lancamento.idFederacao = this.usuarioLogado.idFiliacao;
    console.log('Valores:');
    console.log(lancamento);
    if (this.formCadastro.valid) {
      this.lancamentoService.inserirLancamentoContaInvestimento(lancamento).subscribe((data) => {
        if (data) {
          this.alertService.exibirAlerta('Lançamento cadastrado com sucesso', tipo.sucesso);
          // this.router.navigate(['gestaoFinanceira/conta-investimento/extrato']);
          this.ngOnInit();
        } else {
          this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o lançamento na Conta Investimento', tipo.erro);
        }
      }, (error) => {
        console.log('Erro ao inserir Lançamento CI:');
        console.log(error);
        this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o lançamento na Conta Investimento', tipo.erro);
      });
      console.log('Salvando lançamento conta corrente:');
      console.log(this.formCadastro.value);
    } else {
      this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios', tipo.atencao);
    }
  }

  mudouAno(){
    this.carregarListaItensLancamento();
    this.verificaSeExistePrestacao();
  }


  verificaSeExistePrestacao() {
    const mes = this.formCadastro.controls.mesExercicio.value;
    const ano = this.formCadastro.controls.anoExercicio.value;

    if (mes !== '') {
      const filtro: FiltroDetalhePrestacaoContas = {
        anoExercicio: ano, mesExercicio: mes, idFederacao: this.usuarioLogado.idFiliacao, sigla: null
      };

      this.prestacaoService.verificaStatusPrestacaoContas(filtro).subscribe(
        data => {
          console.log(data);
          if (data.length > 0 && data[0].status !== 'RetornadaAjustes') {
            this.alertService.exibirAlerta('Existe um prestação de contas nesse periodo.', tipo.atencao);
            this.formCadastro.reset();
          }
        });

    }
  }
}
