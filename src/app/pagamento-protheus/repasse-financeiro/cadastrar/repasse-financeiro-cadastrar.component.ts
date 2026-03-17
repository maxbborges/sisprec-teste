import { formatDate } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { debounceTime } from "rxjs/operators";
import {
  CommandEnviarPagamento,
  CommandPagamentoRepasseFinanceiro
} from "src/app/shared/models/commands/cmdPagamento";
import {
  Indicador,
  Usuario
} from "src/app/shared/models/responses/sisprec-response";
import { SegurancaCheckService } from "src/app/shared/seguranca/seguranca-check-service";
import { AlertService, tipo } from "src/app/shared/services/alert.service";
import { ApiIndicadorService } from "src/app/shared/services/api-indicador.service";
import { ApiPagamentoService } from "src/app/shared/services/api-pagamento.service";
import { ApiPrestacaoContasService } from "src/app/shared/services/api-prestacao-contas.service";
import { ApiProdutividadeService } from "src/app/shared/services/api-produtividade.service";
import { ModalService } from "src/app/shared/services/modal.service";
import { StorageService } from "src/app/shared/services/storage.service";


@Component({
  selector: "app-cadastrar-repasse-financeiro",
  templateUrl: "./repasse-financeiro-cadastrar.component.html",
  standalone: false
})
export class CadastrarRepasseFinanceiroComponent implements OnInit {

  item: any;
  public formCadastro: FormGroup;
  public usuarioLogado: Usuario;
  public acaoBloqueada: boolean = false;
  public nomeArquivo: string;
  public federacoes: Indicador[];
  private idPagamento: string;
  public enviadoProtheus: boolean = false;
  public enviandoProtheus: boolean = false;
  public sigla: string;
  public meses: Array<any> = [
    { mes: 'Janeiro APORTE', value: 0 },
    { mes: 'Janeiro', value: 1 },
    { mes: 'Fevereiro', value: 2 },
    { mes: 'Março', value: 3 },
    { mes: 'Abril', value: 4 },
    { mes: 'Maio', value: 5 },
    { mes: 'Junho', value: 6 },
    { mes: 'Julho', value: 7 },
    { mes: 'Agosto', value: 8 },
    { mes: 'Setembro', value: 9 },
    { mes: 'Outubro', value: 10 },
    { mes: 'Novembro', value: 11 },
    { mes: 'Dezembro', value: 12 }
  ];
  public mesesNoAno: Array<object> = [];
  public anos: Array<number> = [];

  public federacao: Indicador;
  public ano: any = 0;
  public mes: any = 0;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private _segurancaService: SegurancaCheckService,
    private ngbModal: NgbModal,
    private router: Router,
    private apiIndicadorService: ApiIndicadorService,
    private apiPrestacaoService: ApiPrestacaoContasService,
    private _apiService: ApiPagamentoService,
    private _modal: ModalService,
    private _apiServiceProdutividade: ApiProdutividadeService,
    private cdRef: ChangeDetectorRef
  ) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(
      this.usuarioLogado
    );

    this.apiIndicadorService
      .listarTodosIndicadoresPorTipoSigla("Federacao")
      .subscribe((federacoes) => (this.federacoes = federacoes));

    this.route.params.subscribe((params) => {
      if (JSON.stringify(params) !== "{}") {
        this.idPagamento = params.idPagamento;
        this.carregarDados();
      }
    });
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      idFederacao: ["", [Validators.required]],
      numeroTitulo: { value: "", disabled: true },
      dataEmissao: { value: "" },
      dataVencimento: ["", [Validators.required]],
      valorTitulo: ["", [Validators.required]],
      observacao: ["", [Validators.required]],
      ano: ["99", [Validators.required]],
      mes: ["99", [Validators.required]]
    });
    const dataEmissaoFormatada = formatDate(new Date(), "yyyy-MM-dd", "en-US");
    this.formCadastro.get("dataEmissao").setValue(dataEmissaoFormatada);
    this.checaEspacos();
    this.mesesNoAno = this.meses;

    for (let i = 2020; i <= new Date().getFullYear(); i++){
      this.anos.push(i);
    }

  }

  carregarDados() {
    if (this.idPagamento != undefined) {
      this._apiService.buscarPagamentoById(this.idPagamento).subscribe(
        (data) => {
          this.enviadoProtheus = data.enviadoProtheus;
          this.formCadastro.get("idFederacao").setValue(data.idFederacao);
          this.formCadastro.get("numeroTitulo").setValue(data.numeroTitulo);
          this.formCadastro.get("dataEmissao").setValue(data.dataEmissao);
          this.formCadastro.get("dataVencimento").setValue(data.dataVencimento);
          this.formCadastro.get("valorTitulo").setValue(data.valorTitulo);
          this.formCadastro.get("observacao").setValue(data.observacao);
          this.formCadastro.get("mes").setValue(data.mes);
          this.formCadastro.get("ano").setValue(data.ano);
          this.getMesesNoAno();
        },
        () => this.erro()
      );
    }
  }

  salvar() {
    if (this.idPagamento != undefined) {
      this.confirmacaoAlterar();
    } else {
      this.confirmacaoCadastrarNovo();
    }
  }

  private confirmacaoCadastrarNovo() {
    let resultado$ = this.alertService.exibirConfirmacaoAlerta(
      "Deseja realmente Salvar?",
      tipo.atencao
    );
    resultado$.subscribe((resultado) => {
      if (resultado) {
        const pagamento: CommandPagamentoRepasseFinanceiro = this.transformPagamento();
        this._apiService.inserirPagamentoRepasseFinanceiro(pagamento).subscribe(
          (x) => {
            if (x.success) {
              this.idPagamento = x.data;
              this.sucesso();
            } else {
              let erros = "";
              if (x.message !== "") {
                this.erro();
                return;
              }
              x.data.forEach((item) => (erros += item.message));
              this.warn(erros);
            }
          },
          () => {
            this.erro();
          }
        );
      }
    });
  }

  private confirmacaoAlterar() {
    let resultado$ = this.alertService.exibirConfirmacaoAlerta(
      "Deseja realmente Salvar?",
      tipo.atencao
    );
    resultado$.subscribe((resultado) => {
      if (resultado) {
        const pagamento: CommandPagamentoRepasseFinanceiro =
          this.transformPagamento();
        pagamento.idPagamento = this.idPagamento;
        this._apiService.alterarPagamentoRepasseFinanceiro(pagamento).subscribe(
          (x) => {
            if (x.success) {
              this.sucesso();
            } else {
              let erros = "";
              if (x.message !== "") {
                this.erro();
                return;
              }
              x.data.forEach((item) => (erros += item.message));
              this.warn(erros);
            }
          },
          () => this.erro()
        );
      }
    });
  }

  private sucesso() {
    let resultado$ = this.alertService.exibirConfirmacaoAlerta(
      "O Pagamento foi salvo com sucesso, deseja enviar para o Protheus?",
      tipo.sucesso
    );
    resultado$.subscribe((resultado) => {
      if (resultado) {
        this.enviarPagamentoProtheus();
      } else {
        this.router.navigate(["pagamento-protheus/repasse-financeiro/listar"]);
      }
    });
  }

  onEnviarPagamentoProtheus() {
    let resultado$ = this.alertService.exibirConfirmacaoAlerta(
      "Deseja realmente enviar para o Protheus?",
      tipo.atencao
    );
    resultado$.subscribe((resultado) => {
      if (resultado) {
        if (this.formCadastro.get("valorTitulo").value < 0) {
          this.erroValorNegativo();
        } else {
          this.salvarEenviarProtheus();
        }
      }
    });
  }

  private salvarEenviarProtheus() {
    if (this.idPagamento != undefined) {
      this.alterarEnviar();
    } else {
      this.inserirEnviar();
    }
  }

  private inserirEnviar() {
    const pagamento: CommandPagamentoRepasseFinanceiro =
      this.transformPagamento();

    if(this.formCadastro.get('mes').value == 0){ //se o mês for janeiro APORTE não fazer a verificação
      this.inserirPagamento(pagamento);
    } else {
      const date = new Date(this.formCadastro.get('ano').value + "-" + this.formCadastro.get('mes').value + "-01");
      date.setMonth(date.getMonth() - 1);

      this.apiPrestacaoService.buscarTodosPrestacoesContasPorV2(
        {
          anoExercicio: date.getFullYear(),
          mesExercicio: date.getMonth() + 1,
          IdFederacao: this.formCadastro.get('idFederacao').value
        }).subscribe((res) => {
            if (res.length === 0 || res[0].nomeStatusPrestacaoContas !== "Aprovada Gestor Fiscal") {
              this.erroPendenciaMesAnterior();
            } else { 
              this.inserirPagamento(pagamento);
            }
          });
    }
  }

  private inserirPagamento(pagamento: CommandPagamentoRepasseFinanceiro){
    this._apiService.inserirPagamentoRepasseFinanceiro(pagamento).subscribe(
      (x) => {
        if (x.success) {
          this.idPagamento = x.data;
          this.enviarPagamentoProtheus();
        } else {
          let erros = "";
          if (x.message !== "") {
            this.erro();
            return;
          }
          x.data.forEach((item) => (erros += item.message));
          this.warn(erros);
        }
      },
      () => this.erro()
    );
  }

  private transformPagamento() {
    let pagamento: CommandPagamentoRepasseFinanceiro = this.formCadastro.value;
    pagamento.idUsuario = this.usuarioLogado.idUsuario;
    pagamento.dataEmissao = this.formCadastro.get("dataEmissao").value;

    pagamento.idFederacao = this.formCadastro.get("idFederacao").value;
    pagamento.numeroTitulo = this.formCadastro.get("numeroTitulo").value;
    pagamento.dataEmissao = this.formCadastro.get("dataEmissao").value;
    pagamento.dataVencimento = this.formCadastro.get("dataVencimento").value;
    pagamento.valorTitulo = this.formCadastro.get("valorTitulo").value;
    pagamento.ano = Number(this.formCadastro.get("ano").value);
    pagamento.mes = Number(this.formCadastro.get("mes").value == 0 ? 1 : this.formCadastro.get("mes").value);
    const observacao = this.formCadastro.get("observacao").value;
    pagamento.observacao = observacao.trim();
    return pagamento;
  }

  private alterarEnviar() {
    const pagamento: CommandPagamentoRepasseFinanceiro = this.transformPagamento();
    pagamento.idPagamento = this.idPagamento;

    if(this.formCadastro.get('mes').value == 0){ //se o mês for janeiro APORTE não fazer a verificação
      this.alterarPagamento(pagamento);
    }else {
      const date = new Date(this.formCadastro.get('ano').value + "-" + this.formCadastro.get('mes').value + "-01");
      date.setMonth(date.getMonth() - 1);

      this.apiPrestacaoService.buscarTodosPrestacoesContasPorV2(
      {
        anoExercicio: date.getFullYear(),
        mesExercicio: date.getMonth() + 1,
        IdFederacao: this.formCadastro.get('idFederacao').value
      }).subscribe((res) => {
        if (res.length === 0 || res[0].nomeStatusPrestacaoContas !== "Aprovada Gestor Fiscal") {
          this.erroPendenciaMesAnterior();
        } else {
          this.alterarPagamento(pagamento);
        }
      });
    }
  }

  private alterarPagamento(pagamento: CommandPagamentoRepasseFinanceiro){
    this._apiService.alterarPagamentoRepasseFinanceiro(pagamento).subscribe(
      (x) => {
        if (x.success) {
          this.enviarPagamentoProtheus();
        } else {
          let erros = "";
          if (x.message !== "") {
            this.erro();
            return;
          }
          x.data.forEach((item) => (erros += item.message));
          this.warn(erros);
        }
      },
      () => this.erro()
    );
  }

  private enviarPagamentoProtheus() {
    if(this.formCadastro.get('mes').value == 0){ //se o mês for janeiro APORTE não fazer a verificação
      this.enviarProtheusFunction();
    } else{
      const date = new Date(this.formCadastro.get('ano').value + "-" + this.formCadastro.get('mes').value + "-01");
      date.setMonth(date.getMonth() - 1);

      this.apiPrestacaoService.buscarTodosPrestacoesContasPorV2(
        {
          anoExercicio: date.getFullYear(),
          mesExercicio: date.getMonth() + 1,
          IdFederacao: this.formCadastro.get('idFederacao').value
        }).subscribe((res) => {
          if (res.length === 0 || res[0].nomeStatusPrestacaoContas !== "Aprovada Gestor Fiscal") {
            this.erroPendenciaMesAnterior();
          } else {
            this.enviarProtheusFunction();
          }
      });
    }
  }

  private enviarProtheusFunction(){
    if (this.idPagamento != null && this.idPagamento != undefined) {
      const pagamentoEnviar: CommandEnviarPagamento = {
        idPagamento: this.idPagamento,
        idUsuario: this.usuarioLogado.idUsuario,
      };

      this.enviandoProtheus = true;

      this._apiService.enviarPagamentoProtheus(pagamentoEnviar).subscribe(
        (x) => {
          if (x.success) {
            this.enviandoProtheus = false;
            this.envioSucesso();
          } else {
            this.enviandoProtheus = false;
            this.warn(x.message);
            this.router.navigate([
              "pagamento-protheus/repasse-financeiro/listar",
            ]);
          }
        },
        () => this.erro()
      );
    } else {
      this.warn("Pagamento não informado.");
    }
  }

  private envioSucesso() {
    this._modal
      .alert("Pagamento enviado com Sucesso.", "Sucesso", "s")
      .subscribe(() => {
        this.router.navigate(["pagamento-protheus/repasse-financeiro/listar"]);
      });
  }

  private warn(erros: string) {
    this._modal.alert(erros, "Atenção", "a");
  }

  private erro() {
    this.enviandoProtheus = false;
    this._modal.alert("Ocorreu um erro favor verifique.", "Erro", "e");
  }

  private erroValorNegativo() {
    this.enviandoProtheus = false;
    this._modal.alert("Pagamento não permitido!", "Erro", "e");
  }

  private erroPendenciaMesAnterior() {
    this.enviandoProtheus = false;
    this._modal.alert("Pagamento não permitido! Federação ainda possui pendência na prestação do mês anterior.", "Erro", "e");
  }

  voltar() {
    this.router.navigate(["pagamento-protheus/repasse-financeiro/listar"]);
  }

  dataVencimentoValidator(): ValidationErrors | null {

    const dataVencimento = this.formCadastro.get('dataVencimento').value ? this.formCadastro.get('dataVencimento').value : null;
    const dataEmissao = this.formCadastro.get('dataEmissao').value;
    let vencimento = dataVencimento || new Date();

    if (!dataVencimento) {
      vencimento.setDate(vencimento.getDate() + 2);
    }
    const dataEmissaoFormatada = formatDate(dataEmissao, "yyyy-MM-dd", "en-US");
    const dataVencimentoFormatada = formatDate(
      vencimento,
      "yyyy-MM-dd",
      "en-US"
    );

    if (dataVencimentoFormatada < dataEmissaoFormatada) {
      this.formCadastro.get('dataVencimento').setErrors({ dataInvalida: true });
        return
    }

    return null;
  }

  checaEspacos() {
    const observacaoControl = this.formCadastro.get("observacao");
    observacaoControl.valueChanges
      .pipe(debounceTime(150))
      .subscribe((value) => {
        if (value.trim() === "") {
          observacaoControl.setErrors({ emptyField: true });
          observacaoControl.markAsTouched();
        }
      });
  }

  /**
   * Método unificado para carregar o Valor do Título.
   * Substitui os antigos carregaValores(), carregaValoresAno() e carregaValoresMes().
   * Chamado quando Federação, Ano ou Mês são alterados.
   */
  private atualizarValorTitulo() {
    if (!this.federacao) return;

    const frmValorTitulo = this.formCadastro.get('valorTitulo');

    if (this.ano === null || this.ano === undefined || isNaN(this.ano) || this.ano == 99) {
      return;
    }
    if (this.mes === null || this.mes === undefined || isNaN(this.mes) || this.mes == 99) {
      return;
    }

    const isAporte = this.mes == 0;
    this._apiServiceProdutividade
      .buscarValorProdutividadePorReferencia(this.federacao.sigla, this.ano, (this.mes == 0 ? 1 : this.mes), isAporte)
      .subscribe(
        (item) => {
          setTimeout(() => {
            if (!item || !item.success) {
              frmValorTitulo.setValue(0);
              const msg = (item && item.message) ? item.message : "Parâmetros de cálculo não encontrados para a Federação e Ano selecionados.";
              this._modal.alert(msg, "Atenção", "a");
              return;
            }

            let valorStr = item.data;
            if (typeof valorStr === 'string') {
              valorStr = valorStr.replace(',', '.');
            }
            const valorTitulo = Number(valorStr);

            frmValorTitulo.setValue(valorTitulo);
            this.cdRef.detectChanges();

            if (valorTitulo <= 0) {
              const msgDetalhe = valorTitulo < 0
                ? `O valor do título ficou negativo (R$ ${valorTitulo.toFixed(2)}). O abatimento do licenciamento excedeu o valor base do repasse.`
                : "O valor do título retornou zero. Verifique os parâmetros de cálculo e a produtividade cadastrada.";
              this._modal.alert(msgDetalhe, "Atenção", "a");
            }
          });
        },
        (error) => {
          setTimeout(() => {
            frmValorTitulo.setValue(0);
            const msg = (error && error.error && error.error.message)
              ? error.error.message
              : "Erro ao calcular o valor do título.";
            this._modal.alert(msg, "Erro", "e");
          });
        }
      );
  }

  carregaValores(event: any) {
    this.federacao = this.federacoes.find(e => e.idIndicador === Number(event.target.value));
    this.ano = +this.formCadastro.get('ano').value;
    this.mes = +this.formCadastro.get('mes').value;
    this.atualizarValorTitulo();
  }

  carregaValoresAno(event: any) {
    this.federacao = this.federacoes.find(e => e.idIndicador === Number(this.formCadastro.get('idFederacao').value));
    if (event && event.target) {
      this.ano = +event.target.value;
    } else {
      this.ano = +this.formCadastro.get('ano').value;
    }
    this.mes = +this.formCadastro.get('mes').value;
    this.formCadastro.get('ano').markAsTouched();
    this.cdRef.detectChanges();
    this.atualizarValorTitulo();
  }
  carregaValoresMes(event: any) {
    this.federacao = this.federacoes.find(e => e.idIndicador === Number(this.formCadastro.get('idFederacao').value));
    this.ano = +this.formCadastro.get('ano').value;
    this.mes = +event.target.value;
    this.formCadastro.get('mes').markAsTouched();
    this.cdRef.detectChanges();
    this.atualizarValorTitulo();
  }

  verifyValue() {
    let frmValorTitulo = this.formCadastro.get('valorTitulo');
      if (frmValorTitulo.value === 0) {
        frmValorTitulo.setErrors({ emptyField: true });
        frmValorTitulo.markAsTouched();
      }
  }
  public getMesesNoAno(event: any = undefined) {
    const date = new Date();
    if (this.formCadastro.get('ano').value >= new Date().getFullYear()) {
      const maxMes = date.getMonth() + 1;
      this.mesesNoAno = this.meses.filter((v) => v.value <= maxMes);
    } else {
      this.mesesNoAno = this.meses;
    }
    this.carregaValoresAno(event);
  }
}
