import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, range } from "rxjs";
import { toArray } from "rxjs/operators";
import { DefinirPrazoCommand } from "src/app/shared/models/commands/cmdEstimativaDeCusto";
import { Usuario } from "src/app/shared/models/responses/sisprec-response";
import { SegurancaCheckService } from "src/app/shared/seguranca/seguranca-check-service";
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiEstimativaDeCustoService } from 'src/app/shared/services/api-estimativa-de-custo.service';
import { ModalService } from "src/app/shared/services/modal.service";
import { StorageService } from "src/app/shared/services/storage.service";

@Component({
  selector: 'app-definir-prazo',
  templateUrl: './definir-prazo.component.html',
  styles: [],
  standalone: false
})
export class DefinirPrazoComponent implements OnInit {

  public form: FormGroup;
  public anos: Observable<number[]>;
  public usuario: Usuario;
  public acaoBloqueada: boolean = false;
  private ano: number;
  private mes: number;
  public idPrazoEnvioPrestacaoContas: string = null;
  public loading: boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _storage: StorageService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _modal: ModalService,
    private _segurancaService: SegurancaCheckService,
    private _serviceApi: ApiEstimativaDeCustoService,
    private _alertService: AlertService,
  ) { }

  ngOnInit() {
    this.usuario = this._storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);
    this.inicializarForm();
    this.carregarListaAnos();
  }

  private inicializarForm() {
    this.form = this._fb.group({
      anoExercicio: ['', Validators.required],
      mesExercicio: ['', Validators.required],
      dataLimitePagamento: ['', Validators.required],
      dataEnvioEmail: ['', Validators.required],
    });
  }

  private buscarPrazoDefinidoCadastrado() {
    if(this.ano > 0 && this.mes > 0) {
      this.loading = true;
      this._serviceApi
      .getPrazoDefinidoPorAnoMes(this.ano, this.mes)
      .subscribe(data => {
        if(data != null) {
          this.idPrazoEnvioPrestacaoContas = data.idPrazoEnvioPrestacaoContas;
          this.form.patchValue({
            dataLimitePagamento: this.formatDate(data.dataLimitePagamento),
            dataEnvioEmail: this.formatDate(data.dataEnvioEmail),
          });
        } else {
          this.idPrazoEnvioPrestacaoContas = null;
          this.form.patchValue({
            dataLimitePagamento: '',
            dataEnvioEmail: '',
          });
        }
        this.loading = false;
      });
    }
  }

  private carregarListaAnos() {
    const anoAtual = new Date().getFullYear();
    this.anos = range(anoAtual, (anoAtual + 2) - anoAtual).pipe(toArray());
  }

  salvar() {
    let command: DefinirPrazoCommand = this.form.value;
    command.idUsuariCadastro = this.usuario.idUsuario;
    command.idPrazoEnvioPrestacaoContas = this.idPrazoEnvioPrestacaoContas;
    this._serviceApi
      .definirPrazo(command)
      .subscribe(
        x => {
          if(x.success) {
            this.sucesso();
          } else {
            let erros = '';
            x.data.forEach(item => erros += item.message);
            this.warn(erros)
          }
        },
        () => this.erro()
      );
  }

  limparForm () {
    this.idPrazoEnvioPrestacaoContas = null;
    this.ano = 0;
    this.mes = 0;
    this.form.reset({
      dataLimitePagamento: '',
      dataEnvioEmail: '',
      anoExercicio: '',
      mesExercicio: '',
    });
  }

  private sucesso() {
    this._modal.alert('Prazo definido com Sucesso.', 'Sucesso', 's')
      .subscribe(() => {
        this.limparForm();
      });
  }

  private erro() {
    this._modal.alert('Ocorreu um erro. Tente novamente mais tarde.', 'Erro', 'e')
      .subscribe(() => this.form.enable());
  }

  private warn(erros: string) {
    this._modal.alert(erros, 'Atenção', 'a')
      .subscribe(() => this.form.enable());
  }

  onChangeAno(ano: number) {
    if(ano > 0) {
      this.ano = ano;
      this.buscarPrazoDefinidoCadastrado();
    }
  }

  onChangeMes(mes: number) {
    if(mes > 0) {
      this.mes = mes;
      this.buscarPrazoDefinidoCadastrado();
    }
  }

  private formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  enviarEmail() {
    if (this._alertService.exibirConfirmacao('Deseja realmente disparar o e-mail para todas as Federações?', tipo.atencao)) {
      this._serviceApi
      .enviarEmailManualDifinicaoPrazo(this.idPrazoEnvioPrestacaoContas)
      .subscribe(
        x => x ? this.sucessoEnvioEmail() : this.erro(),
        () => this.erro()
      );
    }
  }

  private sucessoEnvioEmail() {
    this._modal.alert('E-mail enviado com sucesso.', 'Sucesso', 's')
      .subscribe(() => {
        this.limparForm();
      });
  }

  desabilitarOpacaoEnviarEmail () {
    return this.idPrazoEnvioPrestacaoContas == null;
  }

}
