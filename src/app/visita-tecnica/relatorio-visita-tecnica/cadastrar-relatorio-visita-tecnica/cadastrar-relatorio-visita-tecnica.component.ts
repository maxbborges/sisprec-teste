import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Indicador, Usuario, Visita } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiVisitaService } from 'src/app/shared/services/api-visita.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-cadastrar-relatorio-visita-tecnica',
  templateUrl: './cadastrar-relatorio-visita-tecnica.component.html',
  styleUrls: ['./cadastrar-relatorio-visita-tecnica.component.scss'],
  standalone: false
})
export class CadastrarRelatorioVisitaTecnicaComponent implements OnInit {
  public usuarioLogado: Usuario;
  public formCadastro: FormGroup;
  public desativarSalvar = true;
  public nomeArquivo: string = '';
  public idArquivo: string = null ;
  public lstFederacoes: Indicador[] = [];
  acaoBloqueada: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private indicadorService: ApiIndicadorService,
    private apiVisitaService: ApiVisitaService,    
    private storageService: StorageService,
    private router: Router,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.carregarListaFederacoes();
    this.inicializarFormulario();
    this.limparDadosArquivo();
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      idFederacao: ['', [Validators.required,Validators.min(0)]],
      anoExercicio: ['', [Validators.required]],
      mesExercicio: ['', [Validators.required]]
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

    if (confirm('Deseja realmente salvar?')) {

      const visita: Visita = this.formCadastro.value;
      visita.idUsuarioCadastro = this.usuarioLogado.idUsuario;
      visita.idArquivo = this.idArquivo;

      if (this.formCadastro.valid) {
        this.apiVisitaService.inserirVisita(visita).subscribe((data) => {
          if (data) {
            this.alertService.exibirAlerta('Relatório de visita técnica cadastrada com sucesso', tipo.sucesso);
            this.router.navigate(['visitaTecnica/listarRelatorioVisitaTecnica'],  { queryParams: {ano: visita.anoExercicio, mes: visita.mesExercicio, idFederacao: visita.idFederacao}});
          } else {
            this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o relatório de visita técnica', tipo.erro);
          }
        }, (error) => {
          console.log('Erro ao inserir relatório de visita técnica:');
          console.log(error);
          this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o relatório de visita técnica', tipo.erro);
        });
        console.log('Salvando lançamento conta corrente:');
        console.log(this.formCadastro.value);
      } else {
        this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios', tipo.atencao);
      }
    }
  }

  subiuArquivo(event) {
    this.nomeArquivo = event.nomeArquivo;
    this.idArquivo = event.idArquivo;
  }

  limparDadosArquivo() {
    this.nomeArquivo = '';
    this.idArquivo = null;
  }

}
