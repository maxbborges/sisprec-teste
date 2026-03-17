import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ItemLancamentoService } from 'src/app/services/item-lancamento.service';
import { MotivoService } from 'src/app/services/motivo.service';
import { Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({ templateUrl: './indicadores-lista.page.html',
  standalone: false
})
export class IndicadoresListaPage implements OnInit {

  carregando = false;
  indicadorForm: FormGroup;
  indicadores: any = [];
  usuario: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private fb: FormBuilder,
    private itemLancamentoService: ItemLancamentoService,
    private m: ModalService,
    private motivoService: MotivoService,
    private storageService: StorageService,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit(): void {
    this.usuario = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);
    this.indicadorForm = this.fb.group({
      tipo: 'itemContaCorrente',
      entradaOuSaida: 'entrada'
    });
    this.carregarIndicadores(this.c.tipo.value, this.c.entradaOuSaida.value);
  }

  filtrar(): void {
    this.carregarIndicadores(this.c.tipo.value, this.c.entradaOuSaida.value);
  }

  desabilitar(indicador: any) {
    this.m.confirm('Deseja mesmo desabilitar?')
      .subscribe(x => {
        if (!x) {
          return;
        }
        this.carregando = true;
        if (indicador.tipo === 'Motivo') {
          this.motivoService.desabilitar({
            idMotivo: indicador.id,
            idUsuario: this.usuario.idUsuario
          }).subscribe(y => {
            if (y) {
              this.carregando = false;
              this.carregarIndicadores(this.c.tipo.value, this.c.entradaOuSaida.value);
            }
          });
        } else {
          this.itemLancamentoService.desabilitar({
            idItemLancamento: indicador.id,
            idUsuario: this.usuario.idUsuario
          }).subscribe(y => {
            if (y) {
              this.carregando = false;
              this.carregarIndicadores(this.c.tipo.value, this.c.entradaOuSaida.value);
            }
          });
        }
      });
  }

  reabilitar(indicador: any) {
    this.m.confirm('Deseja mesmo reabilitar?')
      .subscribe(x => {
        if (!x) {
          return;
        }
        this.carregando = true;

        if (indicador.tipo === 'Motivo') {
          this.motivoService.reabilitar({
            idMotivo: indicador.id,
            idUsuario: this.usuario.idUsuario
          }).subscribe(y => {
            if (y) {
              this.carregando = false;
              this.carregarIndicadores(this.c.tipo.value, this.c.entradaOuSaida.value);
            }
          });
        } else {
          this.itemLancamentoService.reabilitar({
            idItemLancamento: indicador.id,
            idUsuario: this.usuario.idUsuario
          }).subscribe(y => {
            if (y) {
              this.carregando = false;
              this.carregarIndicadores(this.c.tipo.value, this.c.entradaOuSaida.value);
            }
          });
        }
      });
  }

  moverCima(indicador: any): void {
    this.carregando = true;

    if (indicador.tipo === 'Motivo') {
      this.motivoService.mover({
        idMotivo: indicador.id,
        novaOrdem: indicador.ordem - 1,
        idUsuario: this.usuario.idUsuario
      }).subscribe(x => {
        if (x) {
          this.carregando = false;
          this.carregarIndicadores(this.c.tipo.value, this.c.entradaOuSaida.value);
        }
      });
    } else {
      this.itemLancamentoService.mover({
        idItemLancamento: indicador.id,
        idTipoLancamento: indicador.idTipo,
        novaOrdem: indicador.ordem - 1,
        idUsuario: this.usuario.idUsuario
      }).subscribe(x => {
        if (x) {
          this.carregando = false;
          this.carregarIndicadores(this.c.tipo.value, this.c.entradaOuSaida.value);
        }
      });
    }
  }

  moverBaixo(indicador: any): void {
    this.carregando = true;

    if (indicador.tipo === 'Motivo') {
      this.motivoService.mover({
        idMotivo: indicador.id,
        novaOrdem: indicador.ordem + 1,
        idUsuario: this.usuario.idUsuario
      }).subscribe(x => {
        if (x) {
          this.carregando = false;
          this.carregarIndicadores(this.c.tipo.value, this.c.entradaOuSaida.value);
        }
      });
    } else {
      this.itemLancamentoService.mover({
        idItemLancamento: indicador.id,
        idTipoLancamento: indicador.idTipo,
        novaOrdem: indicador.ordem + 1,
        idUsuario: this.usuario.idUsuario
      }).subscribe(x => {
        if (x) {
          this.carregando = false;
          this.carregarIndicadores(this.c.tipo.value, this.c.entradaOuSaida.value);
        }
      });
    }
  }

  colocarValidadorEntradaOuSaida(): void {
    if (this.c.tipo.value === 'itemContaCorrente' || this.c.tipo.value === 'itemContaInvestimento') {
      this.c.entradaOuSaida.enable();
      this.c.entradaOuSaida.setValue('entrada');
    } else {
      this.c.entradaOuSaida.setValue('');
      this.c.entradaOuSaida.disable();
    }
  }

  private carregarIndicadores(tipo: string, entradaOuSaida: string) {
    if (tipo === 'motivo') {
      this.motivoService.obterTodos()
        .subscribe(x => {
          this.indicadores = x.map(y => {
            return {
              id: y.idMotivo,
              ordem: y.ordem ? y.ordem : '-',
              idTipo: null,
              tipo: 'Motivo',
              siglaTipo: 'motivo',
              nome: y.descricao,
              status: y.ativo ? 'Habilitado' : 'Desabilitado',
              ativo: y.ativo
            };
          });
        });
    } else {
      let idTipoLancamento: string;
      if (tipo === 'itemContaCorrente' && entradaOuSaida === 'entrada') {
        idTipoLancamento = '1008';
      } else if (tipo === 'itemContaCorrente' && entradaOuSaida === 'saida') {
        idTipoLancamento = '1009';
      } else if (tipo === 'itemContaInvestimento' && entradaOuSaida === 'entrada') {
        idTipoLancamento = '1004';
      } else if (tipo === 'itemContaInvestimento' && entradaOuSaida === 'saida') {
        idTipoLancamento = '1005';
      }
      this.itemLancamentoService.obterTodos(idTipoLancamento)
        .subscribe(x => {
          this.indicadores = x.map(y => {
            return {
              id: y.idItemLancamento,
              ordem: y.ordem ? y.ordem : '-',
              idTipo: y.idTipoLancamento,
              tipo: y.tipoLancamento.indicadorTipo.sigla === 'TipoLancamentoContaCorrente'
                ? 'Item conta corrente' : 'Item conta investimento',
              siglaTipo: 'item-lancamento',
              nome: y.item,
              status: y.ativo ? 'Habilitado' : 'Desabilitado',
              ativo: y.ativo
            };
          });
        });
    }
  }

  get c() {
    return this.indicadorForm.controls;
  }

}
