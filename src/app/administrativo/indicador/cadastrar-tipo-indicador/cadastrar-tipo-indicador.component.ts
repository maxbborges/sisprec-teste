import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InserirIndicadorTipo } from 'src/app/shared/models/commands/cmdIndicadorTipo';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiIndicadorTipoService } from 'src/app/shared/services/api-indicador-tipo.service';

@Component({
  selector: 'app-cadastrar-tipo-indicador',
  templateUrl: './cadastrar-tipo-indicador.component.html',
  styleUrls: ['./cadastrar-tipo-indicador.component.scss'],
  standalone: false
})
export class CadastrarTipoIndicadorComponent implements OnInit {
  public formCadastro: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private indicadorTipoService: ApiIndicadorTipoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      sigla: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      descricao: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]]
    });
  }

  salvar() {
    if (this.formCadastro.valid) {
      this.indicadorTipoService.inserirIndicadorTipo(this.formCadastro.value as InserirIndicadorTipo).subscribe((data) => {
        if (data) {
          this.alertService.exibirAlerta('Tipo de indicador cadastrado com sucesso', tipo.sucesso);
          this.router.navigate(['administrativo/indicadores']);
        } else {
          this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o tipo de indicador', tipo.erro);
        }
      }, (error) => {
        console.log('Erro ao inserir Tipo de Indicador:');
        console.log(error);
        this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o tipo de indicador', tipo.erro);
      });
    } else {
      this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios');
    }
  }
}
