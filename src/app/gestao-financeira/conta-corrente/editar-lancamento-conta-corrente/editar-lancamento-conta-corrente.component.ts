import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ListarItensLancamentoFiltrado } from 'src/app/shared/models/commands/cmdItensLancamento';
import { AlterarLancamento } from 'src/app/shared/models/commands/cmdLancamento';
import { Indicador, ItemLancamento, Lancamento, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiItemLancamentoService } from 'src/app/shared/services/api-item-lancamento.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { StorageService } from 'src/app/shared/services/storage.service';


@Component({
  selector: 'app-editar-lancamento-conta-corrente',
  templateUrl: './editar-lancamento-conta-corrente.component.html',
  styleUrls: ['./editar-lancamento-conta-corrente.component.scss'],
  standalone: false
})
export class EditarLancamentoContaCorrenteComponent implements OnInit {
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
  public idLancCCEntrada = 0;
  public exibirCampoItem = false;
  acaoBloqueada: boolean = false;
  public exibirCampoArquivo = false;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private indicadorService: ApiIndicadorService,
    private lancamentoService: ApiLancamentoService,
    private itemLancamentoService: ApiItemLancamentoService,
    private storageService: StorageService,
    private location: Location,
    private _segurancaService: SegurancaCheckService) {}

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);

    this.idLancamento = this.route.snapshot.params.idLancamento;
    this.inicializarFormulario();
    this.lancamentoService.visualizarLancamento(this.idLancamento).subscribe((lancamento) => {
      this.lancamento = lancamento;
    }, (error) => {
      console.log('Erro ao carregar lançamento:');
      console.log(error);
    }, () => {
      this.populaCamposFormulario();
      this.carregarListaItensLancamento();
      this.carregarIdTipoEntrada();
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
    console.clear();
    const lancamento: AlterarLancamento = this.formEditar.value;
    lancamento.idLancamento = this.lancamento.idLancamento;
    lancamento.idArquivo = this.lancamento.idArquivo;
    lancamento.idUsuarioAlteracao = this.usuarioLogado.idUsuario;

    if (this.formEditar.valid) {
      this.lancamentoService.alterarLancamento(lancamento).subscribe((data) => {
        if (data) {
          this.alertService.exibirAlerta('Lançamento alterado com sucesso', tipo.sucesso);
          this.location.back();
        } else {
          this.alertService.exibirAlerta('Ocorreu um erro ao alterar o lançamento na Conta Corrente', tipo.erro);
        }
      }, (error) => {
        console.log('Erro ao alterar Lançamento CC:');
        console.log(error);
        this.alertService.exibirAlerta('Ocorreu um erro ao alterar o lançamento na Conta Corrente', tipo.erro);
      });
      console.log('Alterando lançamento na conta corrente:');
      console.log(this.formEditar.value);
    } else {
      this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios', tipo.atencao);
    }
  }

  tratarData(data: Date): string {
    const dataConvertida = data.toString();
    const dataTratada = dataConvertida.split('T');
    return dataTratada[0];
  }

  subiuArquivo(event) {
    this.lancamento.nomeArquivo = event.nomeArquivo;
    this.lancamento.idArquivo = event.idArquivo;
  }

  apagarArquivo(){
    this.lancamento.idArquivo = null;
    this.lancamento.nomeArquivo = null;
  }

  carregarIdTipoEntrada() {
    this.indicadorService.visualizarIndicadorPorSigla('LancCCEntrada').subscribe((indicador) => {
      this.idLancCCEntrada = indicador.idIndicador;
      
      if(this.lancamento.idTipoLancamento === this.idLancCCEntrada) {
        this.exibirCampoArquivo = true;
      } else {
        this.exibirCampoArquivo = false;
      }

    });
  }

}
