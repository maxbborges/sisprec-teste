import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ItemSubitem, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiEstimativaDeCustoService } from 'src/app/shared/services/api-estimativa-de-custo.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-listar-item-e-subitem',
  templateUrl: './listar-item-e-subitem.component.html',
  styles: [],
  standalone: false
})
export class ListarItemESubitemComponent implements OnInit {

  itensSubitens$: Observable<ItemSubitem[]>;
  anoExercicio: number;
  usuario: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private apiEstimativaDeCusto: ApiEstimativaDeCustoService,
    private route: ActivatedRoute,
    private storage: StorageService,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit() {

    this.anoExercicio = this.route.snapshot.params.anoExercicio;

    this.carregarListarItemSubitem();

    this.usuario = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);

  }

  inativar(itemSubitem: ItemSubitem) {

    this.apiEstimativaDeCusto
      .listarSubitem(itemSubitem.anoExercicio, itemSubitem.codigoItem)
      .subscribe(
        x => {
          if (x.length > 0 && itemSubitem.codigoSubitem === 0) {
            alert('Não pode inativar este item porque ele está pentece com os subitens.');
            return;
          }
          if (
            confirm(`Deseja mesmo inativar este ${itemSubitem.codigoSubitem === 0 ? 'item' : 'subitem'} ${itemSubitem.nome.toUpperCase()}?`)
          ) {
            this.apiEstimativaDeCusto.verificarValores(itemSubitem.idItemSubitem)
              .subscribe(y => {
                if (!y) {
                  this.apiEstimativaDeCusto
                    .inativarItemSubitem(this.usuario.idUsuario.toString(),{ idItemSubitem: itemSubitem.idItemSubitem })
                    .subscribe(
                      z => {
                        if (z) {
                          this.carregarListarItemSubitem();
                          setTimeout(() => {
                            alert('Inativado com sucesso!');
                          }, 1000);
                        } else {
                          alert('Ocorreu um erro. Tente novamente mais tarde.');
                        }
                      },
                      () => alert('Ocorreu um erro. Tente novamente mais tarde.')
                    );
                } else {
                  alert('O sistema não pode inativar este registro, pois já existem valores cadastrados para ele por uma federação.');
                }
              }, () => alert('Ocorreu um erro. Tente novamente mais tarde.'));

          }
        }
      );
  }

  carregarListarItemSubitem() {

    this.itensSubitens$ = this.apiEstimativaDeCusto.listarItemSubitem(this.anoExercicio);

  }

}
