import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiEstimativaDeCustoService } from 'src/app/shared/services/api-estimativa-de-custo.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-listar-item-e-subitem-por-ano',
  templateUrl: './listar-item-e-subitem-por-ano.component.html',
  styles: [],
  standalone: false
})
export class ListarItemESubitemPorAnoComponent implements OnInit {

  anos$: Observable<number[]>;
  usuario: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private apiEstimativaDeCusto: ApiEstimativaDeCustoService,
    private storage: StorageService,
    private _segurancaService: SegurancaCheckService
    ) { }

  ngOnInit() {

    this.carregarListarItemSubitemPorAno();
    this.usuario = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);

  }

  copiar(proximoAno: number) {

    if (confirm('Tem certeza que deseja copiar os dados para o próximo ano?')) {
      this.apiEstimativaDeCusto
        .copiarItemSubitemParaProximoAno({ anoExercicio: proximoAno })
        .subscribe(
          x => {
            if (x) {
              this.carregarListarItemSubitemPorAno();
              setTimeout(() => {
                alert('Copiado com sucesso!');
              }, 1000);
            } else {
              alert('Ocorreu um erro. Tente novamente mais tarde.');
            }
          },
          () => alert('Ocorreu um erro. Tente novamente mais tarde.')
        );
    }

  }

  carregarListarItemSubitemPorAno() {

    this.anos$ = this.apiEstimativaDeCusto.listarItemSubitemPorAno();

  }

}
