import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, range } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { FederacaoNomeDocumento, Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiNomeDocumentoService } from 'src/app/shared/services/api-nome-documento.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({ templateUrl: './cadastrar-nome-documento.component.html',
  standalone: false
})
export class CadastrarNomeDocumentoComponent implements OnInit {

  anos: Observable<number[]>;
  federacoes: FederacaoNomeDocumento[];
  form: FormGroup;
  tiposDocumento: Observable<Indicador[]>;
  usuario: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private apiIndicadorService: ApiIndicadorService,
    private apiNomeDocumentoService: ApiNomeDocumentoService,
    private fb: FormBuilder,
    private m: ModalService,
    private router: Router,
    private storageService: StorageService,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit() {

    this.usuario = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);
    this.carregarListaAnos();
    this.carregarListaTiposDocumento();
    this.carregarListaFederacoes();
    this.inicializarForm();

  }

  salvar() {

    if (this.form.invalid) {
      this.m.alert('Campo obrigatório não preenchido');
      return;
    }

    this.form.disable();

    this.apiNomeDocumentoService
      .inserirNomeDocumento(this.form.value)
      .subscribe(
        x => x ? this.sucesso() : this.erro(),
        () => this.erro()
      );

  }

  cancelar() {

    this.m.confirm('Deseja cancelar?')
      .subscribe(x => {
        if (x) {
          this.router.navigate(['/arquivo/nomeDocumento']);
        }
      });

  }

  private get federacoesFa() {

    return this.form.controls.federacoes as FormArray;

  }

  private inicializarForm() {

    this.form = this.fb.group({
      exercicio: ['', Validators.required],
      idTipo: ['', Validators.required],
      nome: ['', Validators.required],
      federacoes: this.fb.array([]),
      idUsuarioCadastro: this.usuario.idUsuario
    });

  }

  private carregarListaAnos() {

    const ano = 2020;
    const anoAtual = new Date().getFullYear();

    this.anos = range(ano, (anoAtual + 2) - ano).pipe(toArray());

  }

  private carregarListaTiposDocumento() {

    this.tiposDocumento = this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('tipodocumento');

  }

  private carregarListaFederacoes() {

    this.apiNomeDocumentoService.listarFederacaoNomeDocumento()
      .subscribe(x => {
        this.federacoes = x;
        x.forEach(y => this.federacoesFa.push(
          this.fb.group({
            idFederacao: y.idFederacao,
            idNomeDocumento: null,
            ativo: false
          })
        ));
      });

  }

  private sucesso() {

    this.m.alert('O cadastro do novo Nome de Documento foi realizado com sucesso.', 'Sucesso', 's')
      .subscribe(() => this.router.navigate(['/arquivo/nomeDocumento']));

  }

  private erro() {

    this.m.alert('Ocorreu um erro. Tente novamente mais tarde.', 'Erro', 'e')
      .subscribe(() => this.form.enable());

  }

}
