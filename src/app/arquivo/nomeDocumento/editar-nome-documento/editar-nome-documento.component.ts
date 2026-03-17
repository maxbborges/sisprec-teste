import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, range } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { FederacaoNomeDocumento, Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiNomeDocumentoService } from 'src/app/shared/services/api-nome-documento.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({ templateUrl: './editar-nome-documento.component.html',
  standalone: false
})
export class EditarNomeDocumentoComponent implements OnInit {

  anos: Observable<number[]>;
  federacoes: FederacaoNomeDocumento[];
  form: FormGroup;
  idNomeDocumento: number;
  tiposDocumento: Observable<Indicador[]>;
  usuario: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiIndicadorService: ApiIndicadorService,
    private apiNomeDocumentoService: ApiNomeDocumentoService,
    private fb: FormBuilder,
    private m: ModalService,
    private router: Router,
    private storageService: StorageService,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit() {

    this.idNomeDocumento = this.activatedRoute.snapshot.params.idNomeDocumento;
    this.usuario = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);
    this.carregarListaAnos();
    this.carregarListaTiposDocumento();
    this.inicializarForm();
    this.carregarVisualizacaoNomeDocumento();

  }

  salvar() {

    if (this.form.invalid) {
      this.m.alert('Campo obrigatório não preenchido');
      return;
    }

    this.form.disable();

    this.apiNomeDocumentoService
      .alterarNomeDocumento(this.form.value)
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
      idNomeDocumento: this.idNomeDocumento,
      exercicio: ['', Validators.required],
      idTipo: ['', Validators.required],
      nome: ['', Validators.required],
      federacoes: this.fb.array([]),
      idUsuarioAlteracao: this.usuario.idUsuario
    });

  }

  private carregarVisualizacaoNomeDocumento() {

    this.apiNomeDocumentoService.visualizarNomeDocumento(this.idNomeDocumento)
      .subscribe(x => {

        this.federacoes = x.federacoes;

        x.federacoes.forEach(() =>
          this.federacoesFa.push(
            this.fb.group({
              idFederacao: '',
              idNomeDocumento: '',
              ativo: ''
            })
          )
        );

        this.form.patchValue(x);

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

  private sucesso() {

    this.m.alert('A edição do Nome de Documento foi realizada com sucesso.', 'Sucesso', 's')
      .subscribe(() => this.router.navigate(['/arquivo/nomeDocumento']));

  }

  private erro() {

    this.m.alert('Ocorreu um erro. Tente novamente mais tarde.', 'Erro', 'e')
      .subscribe(() => this.form.enable());

  }

}
