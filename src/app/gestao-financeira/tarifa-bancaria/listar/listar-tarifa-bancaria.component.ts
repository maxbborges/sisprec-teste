import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { EMPTY, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { FiltrosListaTarifasBancariasLancamentoCommand, TarifaBancariaLancamentoCommand } from "src/app/shared/models/commands/cmdLancamento";
import { TarifasBancariasVinculadasData, Usuario } from "src/app/shared/models/responses/sisprec-response";
import { SegurancaCheckService } from "src/app/shared/seguranca/seguranca-check-service";
import { AlertService, tipo } from "src/app/shared/services/alert.service";
import { ApiLancamentoService } from "src/app/shared/services/api-lancamento.service";
import { ApiPlanoDeContasService } from "src/app/shared/services/api-plano-de-contas.service";
import { ModalService } from "src/app/shared/services/modal.service";
import { StorageService } from "src/app/shared/services/storage.service";

@Component({
  selector: 'app-listar-tarifa-bancaria',
  templateUrl: './listar-tarifa-bancaria.component.html',
  standalone: false
})
export class ListarTarifaBancariaComponent implements OnInit {

  public usuarioLogado: Usuario;
  public arrayAno: number[] = [];
  public formPesquisa: FormGroup;
  public tarifas: TarifasBancariasVinculadasData[] = [];
  public acaoBloqueada: boolean = false;
  public msg: string = 'Selecione um filtro para pesquisar.';

  public nomeMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private storageService: StorageService,
    private _segurancaService: SegurancaCheckService,
    private router: Router,
    private _planoContaService: ApiPlanoDeContasService,
    private _lancamentoService: ApiLancamentoService,
    private _modal: ModalService
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.getListaAno();
    this.inicializarFormulario();
  }

  getListaAno() {
    const anoAtual = new Date().getFullYear();
    for(let i = anoAtual; i >= anoAtual - 3; i--) {
      this.arrayAno.push(i);
    }
  }

  inicializarFormulario() {
    this.formPesquisa = this.formBuilder.group({
      anoExercicio: ['', [Validators.required]],
      mesExercicio: ['', [Validators.required]],
    });
  }

  pesquisar() {
    const filtros = this.formPesquisa.value as FiltrosListaTarifasBancariasLancamentoCommand;
    this.tarifas = [];
    if(filtros.anoExercicio > 0 && filtros.mesExercicio > 0) {
      this._lancamentoService.obterTarifasBancariasLancamento(filtros.anoExercicio, filtros.mesExercicio, this.usuarioLogado.idFiliacao).subscribe(
        data => {
          this.tarifas = data;
        }
      );
    }
  }

  excluirLancamento(id: string) {
    this.alertService.exibirConfirmacaoAlerta('Deseja realmente Excluir?', 3)
    .pipe(
      take(1),
      switchMap(resultado => resultado ? of(this.excluir(id)) : EMPTY)
      )
      .subscribe(() => {});
  }

  private excluir(id: string) {
    const form = {} as TarifaBancariaLancamentoCommand;
    form.idTarifaBancariaLancamento = id;
    form.idUsuario = this.usuarioLogado.idUsuario;
    this._lancamentoService.excluirTarifaBancariaAoLancamento(form).subscribe((data) => {
      if (data.success === true) {
        this._modal.alert('Cadastro excluído com Sucesso.', 'Sucesso', 's')
        .subscribe(() => {
          this.pesquisar();
        });
      } else {
        this._modal.alert(data.message, 'Erro', 'e')
        .subscribe(() => {});
      }
    }, (error) => {
      this.alertService.exibirAlerta('Ocorreu um erro ao excluir', tipo.erro);
    });
  }

}
