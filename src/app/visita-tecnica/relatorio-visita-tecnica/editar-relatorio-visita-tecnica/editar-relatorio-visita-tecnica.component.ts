import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Indicador, Usuario, Visita } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiVisitaService } from 'src/app/shared/services/api-visita.service';
import { StorageService } from 'src/app/shared/services/storage.service';


@Component({
  selector: 'app-editar-relatorio-visita-tecnica',
  templateUrl: './editar-relatorio-visita-tecnica.component.html',
  styleUrls: ['./editar-relatorio-visita-tecnica.component.scss'],
  standalone: false
})
export class EditarRelatorioVisitaTecnicaComponent implements OnInit {
  public idVisita: string;
  public visita: Visita;
  public usuarioLogado: Usuario;
  public formEditar: FormGroup;
  public desativarSalvar = true;
  acaoBloqueada: boolean = false;
  public lstFederacoes: Indicador[] = [];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private indicadorService: ApiIndicadorService,
    private apiVisitaService: ApiVisitaService,   

    private storageService: StorageService,
    private router: Router,
    private _segurancaService: SegurancaCheckService) {}

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);

    this.idVisita = this.route.snapshot.params.idVisita;
    this.inicializarFormulario();
    this.carregarListaFederacoes();

    this.apiVisitaService.visualizarVisita(this.idVisita).subscribe((visita) => {
      this.visita = visita;
    }, (error) => {
      console.log('Erro ao carregar visita:');
      console.log(error);
    }, () => {
      this.populaCamposFormulario();
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

  inicializarFormulario() {
    this.formEditar = this.formBuilder.group({
      idFederacao: ['', [Validators.required]],
      anoExercicio: ['', [Validators.required]],
      mesExercicio: ['', [Validators.required]]
    });
  }

  populaCamposFormulario() {
    this.formEditar.patchValue({
      anoExercicio: this.visita.anoExercicio,
      mesExercicio: this.visita.mesExercicio,
      idFederacao: this.visita.idFederacao
    });
  }

  salvar() {
    console.clear();
    const visita: Visita = this.formEditar.value;
    visita.idVisita = this.visita.idVisita;
    visita.idArquivo = this.visita.idArquivo;
    visita.idUsuarioAlteracao = this.usuarioLogado.idUsuario;

    if (this.formEditar.valid) {
      this.apiVisitaService.atualizarVisita(visita).subscribe((data) => {
        if (data) {
          this.alertService.exibirAlerta('Relatório de Visita Técnica alterada com sucesso', tipo.sucesso);
          this.router.navigate(['visitaTecnica/listarRelatorioVisitaTecnica'],  { queryParams: {ano: visita.anoExercicio, mes: visita.mesExercicio, idFederacao: visita.idFederacao}});
        } else {
          this.alertService.exibirAlerta('Ocorreu um erro ao alterar o Relatório de Visita Técnica', tipo.erro);
        }
      }, (error) => {
        console.log('Erro ao alterar Relatório de Visita Técnica');
        console.log(error);
        this.alertService.exibirAlerta('Ocorreu um erro ao alterar o Relatório de Visita Técnica', tipo.erro);
      });
      console.log('Alterando Relatório de Visita Técnica:');
      console.log(this.formEditar.value);
    } else {
      this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios', tipo.atencao);
    }
  }


  subiuArquivo(event) {
    this.visita.nomeArquivo = event.nomeArquivo;
    this.visita.idArquivo = event.idArquivo;
  }

  apagarArquivo(){
    this.visita.idArquivo = null;
    this.visita.nomeArquivo = null;
  }

}
