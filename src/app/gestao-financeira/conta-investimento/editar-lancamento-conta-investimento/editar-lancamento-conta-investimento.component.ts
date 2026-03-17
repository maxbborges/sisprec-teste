import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListarItensLancamentoFiltrado } from 'src/app/shared/models/commands/cmdItensLancamento';
import { AlterarLancamento } from 'src/app/shared/models/commands/cmdLancamento';
import { Indicador, ItemLancamento, Lancamento, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiItemLancamentoService } from 'src/app/shared/services/api-item-lancamento.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-editar-lancamento-conta-investimento',
  templateUrl: './editar-lancamento-conta-investimento.component.html',
  styleUrls: ['./editar-lancamento-conta-investimento.component.scss'],
  standalone: false
})
export class EditarLancamentoContaInvestimentoComponent implements OnInit {
  public idLancamento: string;
  public lancamento: Lancamento;
  public usuarioLogado: Usuario;
  public formEditar: FormGroup;
  public lstTipoLancamento: Indicador[] = [];
  public lstItemLancamento: ItemLancamento[] = [];
  public lstItens: Indicador[] = [];
  public desativarSalvar = true;
  public idAplicacaoCI = 0;
  public idResgateCI = 0;
  public exibirCampoItem = false;
  acaoBloqueada: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private indicadorService: ApiIndicadorService,
    private lancamentoService: ApiLancamentoService,
    private itemLancamentoService: ApiItemLancamentoService,
    private storageService: StorageService,
    private _segurancaService: SegurancaCheckService,
    private router: Router) {}

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.idLancamento = this.route.snapshot.params.idLancamento;
    this.inicializarFormulario();
    console.clear();

    this.lancamentoService.visualizarLancamento(this.idLancamento).subscribe((lancamento) => {
      this.lancamento = lancamento;
      this.inicializarFormulario();
    }, (error) => {
      console.log('Erro ao carregar lançamento:');
      console.log(error);
    }, () => {

      this.populaCamposFormulario();
      this.carregarListaItensLancamento();
    });

  }

  inicializarFormulario() {
    this.formEditar = this.formBuilder.group({
      anoExercicio:     ['', [Validators.required]],
      mesExercicio:     ['', [Validators.required]],
      dataEvento:       ['', [Validators.required]],
      valor:            ['', [Validators.required]],
      idItemLancamento: [null]
    });
  }

  populaCamposFormulario() {

    this.formEditar.patchValue({
      anoExercicio: this.lancamento.anoExercicio,
      mesExercicio: this.lancamento.mesExercicio,
      dataEvento: this.lancamento.dataEvento,
      valor: this.lancamento.valor,
      idItemLancamento: this.lancamento.idItemLancamento
    });


  }

  carregarListaItensLancamento() {
    if (this.formEditar.controls.anoExercicio.valid) {
      const cmdFiltrarListaItens: ListarItensLancamentoFiltrado = {
        idTipoLancamento: this.lancamento.idTipoLancamento,
        anoExercicio: this.formEditar.controls.anoExercicio.value
      };
      this.itemLancamentoService.listarItensLancamentoFiltrado(cmdFiltrarListaItens).subscribe((lstItens) => {
        this.lstItemLancamento = lstItens;
      }, (error) => {
        console.log('Erro ao carregar lista de itens:');
        console.log(error);
      });
    }
  }

  salvar() {
    const lancamento: AlterarLancamento = this.formEditar.value;
    lancamento.idLancamento = this.lancamento.idLancamento;
    lancamento.idUsuarioAlteracao = this.usuarioLogado.idUsuario;
    if (this.formEditar.valid) {
      this.lancamentoService.alterarLancamento(lancamento).subscribe((data) => {
        if (data) {
          this.alertService.exibirAlerta('Lançamento alterado com sucesso', 0);
          this.router.navigate(['gestaoFinanceira/conta-corrente/extrato']);
        } else {
          this.alertService.exibirAlerta('Ocorreu um erro ao alterar o lançamento na Conta Corrente', 0);
        }
      }, (error) => {
        console.log('Erro ao alterar Lançamento CC:');
        console.log(error);
        this.alertService.exibirAlerta('Ocorreu um erro ao alterar o lançamento na Conta Corrente', 0);
      });
    } else {
      this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios', 0);
    }
  }

  tratarData(data: Date): string {
    const dataConvertida = data.toString();
    const dataTratada = dataConvertida.split('T');
    return dataTratada[0];
  }
}
