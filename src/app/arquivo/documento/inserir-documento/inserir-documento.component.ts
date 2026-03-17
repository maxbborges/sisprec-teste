import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InserirDocumento } from 'src/app/shared/models/commands/cmdDocumento';
import { ListarNomeDocumentoFiltrado } from 'src/app/shared/models/commands/cmdNomeDocumento';
import { FiltroDetalhePrestacaoContas, Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiDocumentoService } from 'src/app/shared/services/api-documento.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiNomeDocumentoService } from 'src/app/shared/services/api-nome-documento.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-inserir-documento',
  templateUrl: './inserir-documento.component.html',
  styleUrls: ['./inserir-documento.component.scss'],
  standalone: false
})
export class InserirDocumentoComponent implements OnInit {
  public usuarioLogado: Usuario;
  public formCadastro: FormGroup;
  public lstTipoDocumento: any; // ListaNomeDocumentoCategorizado[];
  public lstFederacoes: Indicador[] = [];
  public tipoEhPrestacaoContas = false;
  public idPrestacaoContas: number;
  public tipoDocumentoSelecionado: any; // NomeDocumento;
  acaoBloqueada: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private indicadorService: ApiIndicadorService,
    private nomeDocumentoService: ApiNomeDocumentoService,
    private documentoService: ApiDocumentoService,
    private prestacaoService: ApiPrestacaoContasService,
    private storageService: StorageService,
    private router: Router,
    private _segurancaService: SegurancaCheckService) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.inicializarFormulario();
    this.carregaIdTipoPrestacaoContas();
    this.carregarListaFederacoes();
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      ano: ['', Validators.required],
      idNomeDocumento: ['', Validators.required],
      mes: ['0'],
      idArquivo: ['', Validators.required],
      idFederacaoDono: ['', Validators.required]
    });
  }

  carregaIdTipoPrestacaoContas() {
    this.indicadorService.visualizarIndicadorPorSigla('DocPrestacaoDeContas').subscribe((data) => {
      this.idPrestacaoContas = data.idIndicador;
    }, (error) => {
      console.log('Erro ao carregar dados dos indicadores de prestação de contas:');
      console.log(error);
    });
  }

  carregarListaFederacoes() {
    this.indicadorService.listarTodosIndicadoresPorTipoSigla('Federacao').subscribe((lstFederacoes) => {
      this.lstFederacoes = lstFederacoes;
    }, (error) => {
      console.log('Erro ao carregar lista de federações:');
      console.log(error);
    });
  }

  salvar() {
    // tslint:disable-next-line:max-line-length
    this.formCadastro.patchValue({ idFederacaoDono: !this.usuarioLogado.ehDex ? this.usuarioLogado.idFiliacao : 1003 });
    if (!this.tipoEhPrestacaoContas) {
      this.formCadastro.patchValue({ mes: 0 });
    }

    if (this.formCadastro.valid) {
      const documento: InserirDocumento = this.formCadastro.value;
      documento.idUsuarioCadastro = this.usuarioLogado.idUsuario;
      documento.idQuemSubiu = this.usuarioLogado.idUsuario;
      documento.idFederacaoDono = this.usuarioLogado.idFiliacao;

      this.documentoService.inserirDocumento(documento).subscribe((data) => {
        if (data) {
          this.alertService.exibirAlerta('Documento cadastrado com sucesso', tipo.sucesso);
          this.router.navigate(['arquivo/documentos']);
        } else {
          this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o documento', tipo.erro);
        }
      }, (error) => {
        console.log('Erro ao inserir Documento:');
        console.log(error);
        this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o documento', tipo.erro);
      });
      console.log('Formulário:');
      console.log(documento);
    } else {
      this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios', tipo.atencao);
    }
  }

  subiuArquivo(idArquivo: string) {
    this.formCadastro.patchValue({ idArquivo });
  }

  selecionouAno(event: any) {
    this.tipoEhPrestacaoContas = false;
    const cmdFiltrarListaNomeDocumento: ListarNomeDocumentoFiltrado = { exercicio: event.target.value, idTipo: 0, ativo: 0 };

    this.nomeDocumentoService.listarNomeDocumentoFiltrado(cmdFiltrarListaNomeDocumento).subscribe((data) => {
      this.lstTipoDocumento = data;
    }, (error) => {
      console.log('Erro ao retornar lista de documentos:');
      console.log(error);
      this.lstTipoDocumento = [];
    });
    this.formCadastro.patchValue({
      idNomeDocumento: '',
      mes: ''
    });
  }

  selecionouTipoDocumento(event: any) {
    if (this.tipoDocumentoSelecionado.idTipo === this.idPrestacaoContas) {
      this.tipoEhPrestacaoContas = true;
      this.formCadastro.controls.mes.setValidators(Validators.required);
    } else {
      this.tipoEhPrestacaoContas = false;
      this.formCadastro.controls.mes.clearValidators();
    }
    this.formCadastro.updateValueAndValidity();
    this.formCadastro.patchValue({
      idNomeDocumento: this.tipoDocumentoSelecionado.idNomeDocumento,
      mes: ''
    });
  }

  verificaTipoDocumentoSelecionado() {

    const idnomedocumento = this.formCadastro.value.idNomeDocumento;

    const tipoDocumento = this.lstTipoDocumento.filter(item => {
      // tslint:disable-next-line:no-unused-expression
      if (item.idNomeDocumento === idnomedocumento) { return item; }
      return null;
    });

    if (tipoDocumento.length > 0) {
      if (tipoDocumento[0].tipo === 'Prestação de Contas') {
        this.tipoEhPrestacaoContas = true;
      }
      // tslint:disable-next-line: one-line
      else {
        this.tipoEhPrestacaoContas = false;
      }
    }
  }

  verificaSeExistePrestacao() {
    const mes = this.formCadastro.controls.mes.value;
    const ano = this.formCadastro.controls.ano.value;

    if (mes !== '') {
      const filtro: FiltroDetalhePrestacaoContas = {
        anoExercicio: ano, mesExercicio: mes, idFederacao: this.usuarioLogado.idFiliacao, sigla: null
      };

      this.prestacaoService.verificaStatusPrestacaoContas(filtro).subscribe(
        data => {
          if (data.length > 0 && data[0].status !== 'RetornadaAjustes') {
            this.alertService.exibirAlerta('Existe um prestação de contas nesse periodo.', tipo.atencao);
            this.formCadastro.reset();
          }
        });

    }

    console.clear();
  }

}
