import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Observable } from "rxjs";
import { Util } from "src/app/shared/helpers/util";
import { CommandCadastrarParametrosCalculo, CommandPesquisarParametrosCalculo, ParametrosCalculoResponse } from "src/app/shared/models/commands/cmdParametrosCalculo";
import { Indicador, Usuario } from "src/app/shared/models/responses/sisprec-response";
import { SegurancaCheckService } from "src/app/shared/seguranca/seguranca-check-service";
import { ApiIndicadorService } from "src/app/shared/services/api-indicador.service";
import { ApiParametrosCalculoService } from "src/app/shared/services/api-parametros-calculo.service";
import { ModalService } from "src/app/shared/services/modal.service";
import { StorageService } from "src/app/shared/services/storage.service";

@Component({
  selector: "app-listar-parametros-calculo",
  templateUrl: "./parametros-calculo-listar.component.html",
  standalone: false
})
export class ListarParametrosCalculoComponent implements OnInit {

  public form: FormGroup;
  public usuarioLogado: Usuario;
  public acaoBloqueada: boolean = false;
  public parametros: ParametrosCalculoResponse[] = [];
  public federacoes: Observable<Indicador[]>;
  public anos: number[] = [];
  public msg: string = "Selecione um filtro para pesquisar.";
  public meses = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, mes: Util.mes(i + 1) }));

  constructor(
    private _formBuilder: FormBuilder,
    private storageService: StorageService,
    private _segurancaService: SegurancaCheckService,
    private apiIndicadorService: ApiIndicadorService,
    private apiParametrosCalculoService: ApiParametrosCalculoService,
    private _modal: ModalService,
  ) {}

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.inicializarForm();
    this.listarFederacoes();
  }

  private inicializarForm() {
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual - 5; i <= anoAtual + 5; i++) {
      this.anos.push(i);
    }
    this.form = this._formBuilder.group({
      ano: [""],
      idFederacao: [""],
      valorRepasse: [""],
      quantidadeVeiculos: [""],
      valorLicenciamento: [""],
      mesAbatimento: [""],
    });
  }

  private listarFederacoes() {
    this.federacoes = this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla("Federacao");
  }

  getNomeMes(valor: number): string {
    return Util.mes(valor);
  }

  pesquisar() {
    const filtros: CommandPesquisarParametrosCalculo = {
      ano: this.form.value.ano || null,
      idFederacao: this.form.value.idFederacao || null,
    };

    this.apiParametrosCalculoService.pesquisar(filtros).subscribe(
      (resultado) => {
        this.parametros = resultado;
        if (!resultado || resultado.length === 0) {
          this.msg = "Não foi encontrado nenhum parâmetro para a pesquisa realizada.";
        }
      },
      () => {
        this._modal.alert("Erro ao pesquisar parâmetros de cálculo.", "Erro", "e");
      }
    );
  }

  salvar() {
    const f = this.form.value;

    if (!f.ano || !f.idFederacao || !f.valorRepasse || !f.quantidadeVeiculos || !f.valorLicenciamento || !f.mesAbatimento) {
      this._modal.alert("Preencha todos os campos antes de cadastrar.", "Atenção", "e");
      return;
    }

    const comando: CommandCadastrarParametrosCalculo = {
      ano: +f.ano,
      idFederacao: +f.idFederacao,
      valorRepasse: +f.valorRepasse,
      valorLicenciamento: +f.valorLicenciamento,
      quantidadeVeiculos: +f.quantidadeVeiculos,
      mesAbatimento: +f.mesAbatimento,
      idUsuario: this.usuarioLogado.idUsuario,
    };

    this.apiParametrosCalculoService.cadastrar(comando).subscribe({
      next: (result) => {
        // Verifica se realmente foi cadastrado
        if (result && result.success) {
          this._modal.alert("Parâmetro cadastrado com sucesso.", "Sucesso", "s");
          this.pesquisar();
        } else {
          this._modal.alert("Erro ao cadastrar parâmetro de cálculo.", "Erro", "e");
        }
      },
      error: (error) => {
        let msg = "Erro ao cadastrar parâmetro de cálculo.";
        if (error && error.error && typeof error.error.message === 'string' &&
            (error.error.message.includes('Já existe') || error.error.message.includes('Ano') || error.error.message.includes('Federação'))) {
          msg = "Combinação Ano + Federação já estão cadastradas.";
        }
        this._modal.alert(msg, "Erro", "e");
      }
    });
  }

  excluir(id: number) {
    this._modal.confirm(
      "Deseja realmente excluir este parâmetro de cálculo?",
      "Confirmação",
      "a"
    ).subscribe((confirmou) => {
      if (confirmou) {
        this.apiParametrosCalculoService.excluir(id).subscribe(
          () => {
            this._modal.alert("Parâmetro excluído com sucesso.", "Sucesso", "s");
            this.pesquisar();
          },
          () => {
            this._modal.alert("Erro ao excluir parâmetro de cálculo.", "Erro", "e");
          }
        );
      }
    });
  }

  isPermitirExcluir() {
    return (
      this.usuarioLogado.tipoUsuario == "Desenvolvedor" ||
      this.usuarioLogado.tipoUsuario.includes("Gestor")
    );
  }

  isAnoFederacaoExistente(): boolean {
    const f = this.form.value;
    if (!f.ano || !f.idFederacao) return false;
    return this.parametros.some(p => p.ano === +f.ano && p.idFederacao === +f.idFederacao);
  }
}
