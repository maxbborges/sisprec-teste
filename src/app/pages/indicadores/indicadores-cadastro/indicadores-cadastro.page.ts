import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ItemLancamentoService } from 'src/app/services/item-lancamento.service';
import { MotivoService } from 'src/app/services/motivo.service';
import { Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';
@Component({ templateUrl: './indicadores-cadastro.page.html',
  standalone: false
})
export class IndicadoresCadastroPage implements OnInit {

  enviando = false;
  indicadorForm: FormGroup;
  usuario: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private fb: FormBuilder,
    private itemLancamentoService: ItemLancamentoService,
    private m: ModalService,
    private motivoService: MotivoService,
    private router: Router,
    private storageService: StorageService,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit(): void {
    this.usuario = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);

    this.indicadorForm = this.fb.group({
      nome: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      entradaOuSaida: ['', [Validators.required]]
    });
    this.c.entradaOuSaida.disable();
  }

  salvar(): void {
    this.enviando = true;
    if (this.indicadorForm.invalid) {
      this.m.alert('Campo(s) obrigatório(s) não preenchido(s).');
      return;
    }
    if (this.c.tipo.value === 'motivo') {
      this.motivoService.cadastrar({
        descricao: this.c.nome.value,
        idUsuario: this.usuario.idUsuario,
      }).subscribe(x => {
        if (x) {
          this.m.alert('Indicador cadastrado com sucesso.', 'Sucesso', 's')
            .subscribe(y => {
              if (y) {
                this.router.navigate(['/admin/indicadores']);
              }
            });
        }
      });
    } else {
      let idTipoLancamento: string;
      if (this.c.tipo.value === 'itemContaCorrente' && this.c.entradaOuSaida.value === 'entrada') {
        idTipoLancamento = '1008';
      } else if (this.c.tipo.value === 'itemContaCorrente' && this.c.entradaOuSaida.value === 'saida') {
        idTipoLancamento = '1009';
      } else if (this.c.tipo.value === 'itemContaInvestimento' && this.c.entradaOuSaida.value === 'entrada') {
        idTipoLancamento = '1004';
      } else if (this.c.tipo.value === 'itemContaInvestimento' && this.c.entradaOuSaida.value === 'saida') {
        idTipoLancamento = '1005';
      }
      this.itemLancamentoService.cadastrar({
        item: this.c.nome.value,
        idTipoLancamento,
        idUsuario: this.usuario.idUsuario,
      }).subscribe(x => {
        if (x) {
          this.m.alert('Indicador cadastrado com sucesso.', 'Sucesso', 's')
            .subscribe(y => {
              if (y) {
                this.router.navigate(['/admin/indicadores']);
              }
            });
        }
      });
    }
  }

  cancelar(): void {
    this.m.confirm('Deseja cancelar?')
      .subscribe(x => {
        if (x) {
          this.router.navigate(['/admin/indicadores']);
        }
      });
  }

  colocarValidadorEntradaOuSaida(evento: any): void {
    const valor = evento.target.value;
    if (valor === 'itemContaCorrente' || valor === 'itemContaInvestimento') {
      this.c.entradaOuSaida.enable();
    } else {
      this.c.entradaOuSaida.setValue('');
      this.c.entradaOuSaida.disable();
    }
  }

  get c() {
    return this.indicadorForm.controls;
  }
}
