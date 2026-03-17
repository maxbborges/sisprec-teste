import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Observable, range } from 'rxjs';
import { map, toArray } from 'rxjs/operators';

import { ListaPrestacoesContas } from 'src/app/prestacao-de-contas/pesquisar-prestacao-contas/lista-prestacoes-contas';
import { Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({ templateUrl: './pesquisar-prestacao-contas.component.html',
  standalone: false
})
export class PesquisarPrestacaoContasComponent implements OnInit {

  prestacoesContas: ListaPrestacoesContas[] = [];
  federacoes: Observable<Indicador[]>;
  status: Observable<Indicador[]>;
  exercicios: Observable<string[]>;
  f: FormGroup;
  prestacoesContasSelecionadas: ListaPrestacoesContas[] = [];
  versoes: Observable<number[]>;
  usuario: Usuario;

  public lstExercicios: string[] = [];
  public lstExerciciosMes: string[] = [];

  constructor(
    private apiPrestacaoContasService: ApiPrestacaoContasService,
    private apiIndicadorService: ApiIndicadorService,
    private fb: FormBuilder,
    private storageService: StorageService
  ) { }

  ngOnInit() {

    this.usuario = this.storageService.getUsuarioLogado();
    this.gerarListaExercicios();

    this.federacoes = this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('FEDERACAO')
    .pipe(map(x => x.filter(y => y.sigla !== 'DEX')));
    this.exercicios = this.apiPrestacaoContasService.getListaExercicios();
    this.status = this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('STATUSPRESTACAOCONTAS');
    this.versoes = range(1, 10).pipe(toArray());

    this.f = this.fb.group({
      idFederacao: '0',
      exercicio: '0',
      exercicioMes: '0',
      idStatusAtualPrestacaoContas: '0',
      versao: '0'
    });

    if(this.ehPresidente()) {
      this.f.controls.idFederacao.setValue(this.usuario.idFiliacao);
      this.f.updateValueAndValidity();
      this.getPrestacoesContas({ idUsuario: this.usuario.idUsuario, idFederacao: this.usuario.idFiliacao });
    } else {
      this.getPrestacoesContas({ idUsuario: this.usuario.idUsuario });
    }
  }

  getPrestacoesContas(query: any) {

    this.apiPrestacaoContasService
      .getListaPrestacoesContas(query)
      .subscribe(prestacoesContas => this.prestacoesContas = prestacoesContas);

  }

  pesquisar() {

    this.prestacoesContasSelecionadas = [];

    const o = this.getMesAnoExercicio();

    this.getPrestacoesContas(o);

  }

  gerarListaExercicios(){
    const anos = [2020, 2021, 2022,2023,2024,2025];
    
    for(let i in anos){
      this.lstExercicios.push(anos[i].toString());
      //console.log(anos[i])
    }
    for(let mes = 0; mes < 12; mes++){
      //let exercicio = (mes+1) + '/' + anos[i];
      this.lstExerciciosMes.push((mes+1).toString())
    }
  }

  private getMesAnoExercicio() {

    const o = Object.assign({}, this.f.value);

    if (o.exercicio !== '0') {
      o.anoExercicio = o.exercicio;//.split('/')[0];
      o.mesExercicio = o.exercicioMes;//.split('/')[1];
    } else {
      o.mesExercicio = '0';
      o.anoExercicio = '0';
    }

    delete o.exercicio;

    return o;

  }

  ehPresidente(){
    return this.usuario.tipoUsuario == "Presidente";
  }

}
