import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";
import { Util } from "src/app/shared/helpers/util";
import { CommandAlterarParametrosCalculo } from "src/app/shared/models/commands/cmdParametrosCalculo";
import { Indicador, Usuario } from "src/app/shared/models/responses/sisprec-response";
import { SegurancaCheckService } from "src/app/shared/seguranca/seguranca-check-service";
import { ApiIndicadorService } from "src/app/shared/services/api-indicador.service";
import { ApiParametrosCalculoService } from "src/app/shared/services/api-parametros-calculo.service";
import { ModalService } from "src/app/shared/services/modal.service";
import { StorageService } from "src/app/shared/services/storage.service";

@Component({
  selector: "app-cadastrar-parametros-calculo",
  templateUrl: "./parametros-calculo-cadastrar.component.html",
  standalone: false
})
export class CadastrarParametrosCalculoComponent implements OnInit {

  public formCadastro: FormGroup;
  public usuarioLogado: Usuario;
  public acaoBloqueada: boolean = false;
  public federacoes: Observable<Indicador[]>;
  public isEdicao: boolean = false;
  public idParametro: number;
  public anos: number[] = [];
  public meses = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, mes: Util.mes(i + 1) }));

  constructor(
    private _formBuilder: FormBuilder,
    private storageService: StorageService,
    private _segurancaService: SegurancaCheckService,
    private router: Router,
    private route: ActivatedRoute,
    private apiIndicadorService: ApiIndicadorService,
    private apiParametrosCalculoService: ApiParametrosCalculoService,
    private _modal: ModalService
  ) {}

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);

    this.inicializarForm();
    this.listarFederacoes();

    const id = this.route.snapshot.paramMap.get("idParametro");
    if (id) {
      this.isEdicao = true;
      this.idParametro = +id;
      this.carregarParametro(this.idParametro);
    }
  }

  private inicializarForm() {
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual - 5; i <= anoAtual + 5; i++) {
      this.anos.push(i);
    }
    this.formCadastro = this._formBuilder.group({
      ano: ["", Validators.required],
      idFederacao: ["", Validators.required],
      valorRepasse: ["", Validators.required],
      valorLicenciamento: ["", Validators.required],
      quantidadeVeiculos: ["", Validators.required],
      mesAbatimento: ["", Validators.required],
    });
  }

  private listarFederacoes() {
    this.federacoes = this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla("Federacao");
  }

  private carregarParametro(id: number) {
    this.apiParametrosCalculoService.buscarPorId(id).subscribe(
      (param) => {
        this.formCadastro.patchValue({
          ano: param.ano,
          idFederacao: param.idFederacao,
          valorRepasse: param.valorRepasse,
          valorLicenciamento: param.valorLicenciamento,
          quantidadeVeiculos: param.quantidadeVeiculos,
          mesAbatimento: param.mesAbatimento,
        });
      },
      () => {
        this._modal.alert("Erro ao carregar parâmetro de cálculo.", "Erro", "e");
      }
    );
  }

  salvar() {
    if (this.formCadastro.invalid) {
      this._modal.alert("Preencha todos os campos obrigatórios.", "Atenção", "e");
      return;
    }

    const f = this.formCadastro.value;
    const comando: CommandAlterarParametrosCalculo = {
      idParametroCalculo: this.idParametro,
      ano: +f.ano,
      idFederacao: +f.idFederacao,
      valorRepasse: +f.valorRepasse,
      valorLicenciamento: +f.valorLicenciamento,
      quantidadeVeiculos: +f.quantidadeVeiculos,
      mesAbatimento: +f.mesAbatimento,
      idUsuario: this.usuarioLogado.idUsuario,
    };

    this.apiParametrosCalculoService.alterar(comando).subscribe({
      next: (result) => {
        if (result && result.success) {
          this._modal.alert("Parâmetro alterado com sucesso.", "Sucesso", "s");
          this.voltar();
        } else {
          let msg = "Erro ao alterar parâmetro de cálculo.";
          if (result && typeof result.message === 'string' && result.message.includes('Já existe um parâmetro cadastrado para este Ano e Federação')) {
            msg = "Combinação Ano e Federação já estão cadastradas";
          }
          this._modal.alert(msg, "Erro", "e");
        }
      },
      error: (error) => {
        let msg = "Erro ao alterar parâmetro de cálculo.";
        if (error && error.error && typeof error.error.message === 'string' && error.error.message.includes('Já existe um parâmetro cadastrado para este Ano e Federação')) {
          msg = "Combinação Ano e Federação já estão cadastradas";
        }
        this._modal.alert(msg, "Erro", "e");
      }
    });
  }

  voltar() {
    this.router.navigate(["/pagamento-protheus/parametros-calculo/listar"]);
  }
}
