import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Indicador, RelatorioDespesa, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiRelatorioService } from 'src/app/shared/services/api-relatorio.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({ templateUrl: './relatorio-despesas-old.component.html',
  standalone: false
})
export class RelatorioDespesasOldComponent implements OnInit {

  f: FormGroup;
  federacoes$: Observable<Indicador[]>;
  anos: string[];
  usuario: Usuario;
  relatorioDespesa$: Observable<RelatorioDespesa[]>;

  constructor(
    private apiIndicadorService: ApiIndicadorService,
    private apiRelatorioService: ApiRelatorioService,
    private fb: FormBuilder,
    private storageService: StorageService
  ) { }

  ngOnInit() {

    this.f = this.fb.group({
      idFederacao: '',
      ano: ['', Validators.required],
    });

    this.usuario = this.storageService.getUsuarioLogado();

    if (this.verificarPerfil) {
      this.f.controls.idFederacao.setValidators([Validators.required]);
      this.federacoes$ = this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('federacao')
        .pipe(map(x => x.filter(y => y.sigla !== 'DEX')));
    } else {
      this.f.controls.idFederacao.setValue(this.usuario.idFiliacao);
    }

    this.apiRelatorioService.listarAnosDespesa().subscribe(data => {
      this.anos = data;
      console.log(this.anos)
    })

  }

  clicarPesquisar() {

    if (this.f.invalid) {
      return;
    }

    this.relatorioDespesa$ = this.apiRelatorioService.buscarRelatorioDespesa(this.f.value);

  }

  get verificarPerfil(): boolean {

    return this.usuario.tipoUsuarioSigla === 'UsuarioConferenciaDoc'
      || this.usuario.tipoUsuarioSigla === 'UsuarioGestorFiscal'
      || this.usuario.tipoUsuarioSigla === 'UsuarioDesenvolvedor';

  }

}
