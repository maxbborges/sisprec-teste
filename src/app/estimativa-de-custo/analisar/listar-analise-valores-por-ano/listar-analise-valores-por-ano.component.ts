import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cadastro } from 'src/app/shared/models/responses/sisprec-response';
import { ApiEstimativaDeCustoService } from 'src/app/shared/services/api-estimativa-de-custo.service';

@Component({
  selector: 'app-listar-analise-valores-por-ano',
  templateUrl: './listar-analise-valores-por-ano.component.html',
  styles: [],
  standalone: false
})
export class ListarAnaliseValoresPorAnoComponent implements OnInit {

  cadastros$: Observable<Cadastro[]>;
  idCadastro: string;

  constructor(
    private api: ApiEstimativaDeCustoService,
    private route: ActivatedRoute
    ) { }

  ngOnInit() {

    this.idCadastro = this.route.snapshot.params.idCadastro;

    this.cadastros$ = this.api
      .listarValoresPorAno()
      .pipe(map(x => x.filter(y => y.idCadastroStatus === 2148 || y.idCadastroStatus === 2146)));

  }

  enviarParaAnalise(i: any) {
    if (confirm('Tem certeza que deseja enviar para análise?')) {
      alert('Enviado para análise com sucesso!');
    }
  }

}
