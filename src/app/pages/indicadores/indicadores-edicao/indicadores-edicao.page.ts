import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ItemLancamentoService } from 'src/app/services/item-lancamento.service';
import { MotivoService } from 'src/app/services/motivo.service';
import { Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';
@Component({ templateUrl: './indicadores-edicao.page.html',
  standalone: false
})
export class IndicadoresEdicaoPage implements OnInit {

  enviando = false;
  indicadorForm: FormGroup;
  usuario: Usuario;

  itemContaCorrenteDesativado = false;
  itemContaInvestimentoDesativado = false;
  motivoDesativado = false;
  acaoBloqueada: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
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
      id: '',
      nome: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      entradaOuSaida: ['', [Validators.required]]
    });

    this.activatedRoute.data.subscribe(x => {
      this.indicadorForm.patchValue(x.indicador);
      if (x.indicador.tipo === 'motivo') {
        this.itemContaCorrenteDesativado = true;
        this.itemContaInvestimentoDesativado = true;
        this.c.entradaOuSaida.disable();
      } else {
        this.motivoDesativado = true;
      }
    });
  }

  salvar(): void {
    this.enviando = true;
    if (this.indicadorForm.invalid) {
      this.m.alert('Campo(s) obrigatório(s) não preenchido(s).');
      return;
    }
    if (this.c.tipo.value === 'motivo') {
      this.motivoService.editar({
        idMotivo: this.c.id.value,
        descricao: this.c.nome.value,
        idUsuario: this.usuario.idUsuario,
      }).subscribe(x => {
        if (x) {
          this.m.alert('Indicador editado com sucesso.', 'Sucesso', 's')
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
      this.itemLancamentoService.editar({
        idItemLancamento: this.c.id.value,
        item: this.c.nome.value,
        idTipoLancamento,
        idUsuario: this.usuario.idUsuario,
      }).subscribe(x => {
        if (x) {
          this.m.alert('Indicador editado com sucesso.', 'Sucesso', 's')
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
      this.c.entradaOuSaida.disable();
    }
  }

  get c() {
    return this.indicadorForm.controls;
  }
}
