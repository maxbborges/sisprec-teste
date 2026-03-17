import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { EMPTY, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { TarifaBancariaLancamentoCommand } from 'src/app/shared/models/commands/cmdLancamento';
import { LancamentoSaidaPorMesAnoData, Usuario } from "src/app/shared/models/responses/sisprec-response";
import { SegurancaCheckService } from "src/app/shared/seguranca/seguranca-check-service";
import { AlertService, tipo } from "src/app/shared/services/alert.service";
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ApiPlanoDeContasService } from "src/app/shared/services/api-plano-de-contas.service";
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from "src/app/shared/services/storage.service";

@Component({
  selector: 'app-cadastrar-tarifa-bancaria',
  templateUrl: './cadastrar-tarifa-bancaria.component.html',
  standalone: false
})
export class CadastrarTarifaBancariaComponent implements OnInit {

  public formCadastro: FormGroup;
  public usuarioLogado: Usuario;
  public arrayAno: number[] = [];
  public lstCategorias: any[] = [];
  public lstItemCategorias: any[] = [];
  public ano: number = 0;
  public mes: number = 0;
  public lstLancamentos: LancamentoSaidaPorMesAnoData[] = [];
  public acaoBloqueada: boolean = false;
  private idTarifaBancariaLancamento: string;
  public isEdicao: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private storageService: StorageService,
    private _segurancaService: SegurancaCheckService,
    private router: Router,
    private _planoContaService: ApiPlanoDeContasService,
    private _lancamentoService: ApiLancamentoService,
    private _modal: ModalService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.idTarifaBancariaLancamento = this.route.snapshot.params.idTarifaBancariaLancamento;
    this.inicializarFormulario();
    this.getListaAno();
    this.buscarTarifaById();
  }

  getListaAno() {
    const anoAtual = new Date().getFullYear();
    for(let i = anoAtual; i >= anoAtual - 3; i--) {
      this.arrayAno.push(i);
    }
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      anoExercicio: ['', [Validators.required]],
      mesExercicio: [{ value: "", disabled: true }, [Validators.required]],
      idCategoria: ['', [Validators.required]],
      idCategoriaItem: ['', [Validators.required]],
      idLancamento: ['', [Validators.required]],
    });
  }

  private buscarTarifaById() {
    if(this.idTarifaBancariaLancamento != undefined) {
      this._lancamentoService.obterTarifaBancariaVinculadaById(this.idTarifaBancariaLancamento).subscribe(
        data => {
          this.isEdicao = true;
          this.ano = data.anoExercicio;
          this.mes = data.mesExercicio;
          this.formCadastro.get('anoExercicio').setValue(data.anoExercicio);
          this.formCadastro.get('mesExercicio').setValue(data.mesExercicio);
          this.onChangeGetCategoria(data.anoExercicio);
          this.onChangeGetItemCategoria(data.idCategoria);
          this.obterLancamentoSaida();
          this.formCadastro.get('idCategoria').setValue(data.idCategoria);
          this.formCadastro.get('idCategoriaItem').setValue(data.idCategoriaItem);
          this.formCadastro.get('idLancamento').setValue(data.idLancamento);
        }
      );
    }
  }

  onChangeGetCategoria(ano: number) {
    this.ano = ano;
    this.formCadastro.get('mesExercicio').enable(); // Habilita o campo mesExercicio
    this.formCadastro.get('mesExercicio').setValidators(Validators.required); // Define o validador required para o campo mesExercicio
    this.formCadastro.get('mesExercicio').updateValueAndValidity(); // Atualiza o estado do campo mesExercicio
    this.obterLancamentoSaida();
    this.lstCategorias = [];
    this.lstItemCategorias = [];
    this._planoContaService.obterCategoriasPorExercicio(ano).subscribe(
      data => {
        this.lstCategorias = data.filter(x => x.codigo == 13);
      }
    );
  }

  onChangeGetItemCategoria(idCategoria: string) {
    this._planoContaService.obterItemCategoriasPorIdCategoria(idCategoria).subscribe(
      data => {
        this.lstItemCategorias = data;
      }
    );
  }

  onChangeGetLancamentoSaida(mes: number) {
    this.mes = mes;
    this.obterLancamentoSaida();
  }

  obterLancamentoSaida() {
    this.lstLancamentos = [];
    if(this.ano > 0 && this.mes > 0) {
      this._lancamentoService.obterLancamentosSaidaPorAnoMesExercicio(this.ano, this.mes, this.usuarioLogado.idFiliacao).subscribe(
        data => {
          this.lstLancamentos = data;
        }
      );
    }
  }

  salvar() {
    const form = this.formCadastro.value as TarifaBancariaLancamentoCommand;
    form.idFederacao = this.usuarioLogado.idFiliacao;
    form.idUsuario = this.usuarioLogado.idUsuario;
    this.alertService.exibirConfirmacaoAlerta('Deseja realmente salvar?', 3)
    .pipe(
      take(1),
      switchMap(resultado => resultado ? of(this.inserir(form)) : EMPTY)
      )
      .subscribe(() => {});
  }

  inserir(form: TarifaBancariaLancamentoCommand) {
    if(this.idTarifaBancariaLancamento == undefined)
      this.novo(form);
    else
      this.alterar(form);
  }

  private novo(form: TarifaBancariaLancamentoCommand) {
    this._lancamentoService.inserirTarifaBancariaAoLancamento(form).subscribe((data) => {
      if (data.success === true) {
        this._modal.alert('Cadastro realizado com Sucesso.', 'Sucesso', 's')
        .subscribe(() => {
          this.router.navigate(['gestaoFinanceira/tarifa-bancaria']);
        });
      } else {
        this._modal.alert(data.message, 'Erro', 'e')
        .subscribe(() => {
          this.formCadastro.reset();
        });
      }
    }, (error) => {
      this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar', tipo.erro);
    });
  }

  private alterar(form: TarifaBancariaLancamentoCommand) {
    form.idTarifaBancariaLancamento = this.idTarifaBancariaLancamento;
    this._lancamentoService.alterarTarifaBancariaAoLancamento(form).subscribe((data) => {
      if (data.success === true) {
        this._modal.alert('Cadastro alterado com Sucesso.', 'Sucesso', 's')
        .subscribe(() => {
          this.router.navigate(['gestaoFinanceira/tarifa-bancaria']);
        });
      } else {
        this._modal.alert(data.message, 'Erro', 'e')
        .subscribe(() => {
          this.formCadastro.reset();
        });
      }
    }, (error) => {
      this.alertService.exibirAlerta('Ocorreu um erro ao alterar', tipo.erro);
    });
  }

  voltar() {
    this.router.navigate(['gestaoFinanceira/tarifa-bancaria']);
  }

}
