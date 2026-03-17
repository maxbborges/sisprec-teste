import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { InserirIndicador } from 'src/app/shared/models/commands/cmdIndicador';
import { IndicadorTipo } from 'src/app/shared/models/responses/sisprec-response';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiIndicadorTipoService } from 'src/app/shared/services/api-indicador-tipo.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-cadastrar-indicador',
  templateUrl: './cadastrar-indicador.component.html',
  styleUrls: ['./cadastrar-indicador.component.scss'],
  standalone: false
})
export class CadastrarIndicadorComponent implements OnInit {
  public formCadastro: FormGroup;
  public lstIndicadorTipo: IndicadorTipo[] = [];
  public selectedMotivo = false;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private indicadorTipoService: ApiIndicadorTipoService,
    private indicadorService: ApiIndicadorService,
    private router: Router,
    private storage: StorageService
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.carregarTipoNomeDocumento();
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      nome: ['', [Validators.required]],
      sigla: ['', [Validators.required]],
      valor: ['', [Validators.maxLength(20)]],
      idIndicadorTipo: ['', Validators.required]
    });
  }

  carregarTipoNomeDocumento() {
    this.indicadorTipoService.listarTodosIndicadoresTipo()
      .pipe(map(x => x.filter(y => {
        if (this.storage.getUsuarioLogado().idTipoUsuario === 5 || this.storage.getUsuarioLogado().idTipoUsuario === 6) {
          return y.idIndicadorTipo === 1007;
        } else {
          return y;
        }
      })))
      .subscribe((lstIndicadoresTipo) => {
        this.lstIndicadorTipo = lstIndicadoresTipo;
      }, (error) => {
        console.log('Ocorreu um erro ao listar os indicadores tipo:');
        console.log(error);
      });
  }

  salvar() {

    if (this.selectedMotivo) {
      this.formCadastro.patchValue({
        sigla: this.capitalizeFirstLetter(this.formCadastro.value.nome),
        valor: Math.random().toString(36).substring(7)
      });
    }

    if (this.formCadastro.valid) {
      this.indicadorService.inserirIndicador(this.formCadastro.value as InserirIndicador).subscribe((data) => {
        if (data) {
          this.alertService.exibirAlerta('Indicador cadastrado com sucesso', tipo.sucesso);
          this.router.navigate(['administrativo/indicadores']);
        } else {
          this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o indicador', tipo.erro);
        }
      }, (error) => {
        console.log('Erro ao inserir Tipo de Indicador:');
        console.log(error);
        this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o indicador', tipo.erro);

      });
    } else {
      this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios', tipo.atencao);
    }
  }

  capitalizeFirstLetter(text: string) {

    const a = text.split(' ');
    let textresult = '';
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < a.length; index++) {
      const element = a[index];
      textresult += element.charAt(0).toUpperCase() + element.slice(1);
    }
    return textresult;
  }

  verificaTipo(event) {
    const idmotivo = event.target.value;
    const motivo = this.lstIndicadorTipo.filter((value) => value.idIndicadorTipo.toString() === idmotivo);

    if (motivo[0].nome === 'Motivo') {
      this.selectedMotivo = true;
    } else {
      this.selectedMotivo = false;
      this.formCadastro.patchValue({
        sigla: '',
        valor: ''
      });
    }

  }
}
