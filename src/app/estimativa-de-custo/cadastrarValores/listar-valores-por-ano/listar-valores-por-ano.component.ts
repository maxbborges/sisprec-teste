import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Cadastro, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiEstimativaDeCustoService } from 'src/app/shared/services/api-estimativa-de-custo.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-listar-valores-por-ano',
  templateUrl: './listar-valores-por-ano.component.html',
  styles: [],
  standalone: false
})
export class ListarValoresPorAnoComponent implements OnInit {

  cadastros$: Observable<Cadastro[]>;
  usuarioLogado: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private api: ApiEstimativaDeCustoService,
    private storage: StorageService,
    private m: ModalService,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit() {

    this.usuarioLogado = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);

    this.carregarListarValoresPorAno();

  }

  enviarParaAnalise(cadastro: Cadastro) {
    this.m
      .confirm('Tem certeza que deseja enviar para análise?')
      .subscribe(resultado => {
        if (resultado) {
          this.api.alterarCadastroStatus({
            idCadastro: cadastro.idCadastro,
            idUsuario: this.usuarioLogado.idUsuario,
            idCadastroStatus: 2148, // Enviada para Análise
            motivo: null
          }).subscribe(
            x => {
              if (x) {
                this.m.alert('Enviado para análise com sucesso!', null, 's')
                  .subscribe(() => this.carregarListarValoresPorAno());
              } else {
                this.m.alert('Ocorreu um erro. Tente novamente mais tarde.', 'Erro', 'e');
              }
            },
            () => this.m.alert('Ocorreu um erro. Tente novamente mais tarde.', 'Erro', 'e')
          );


        }
      });
  }

  carregarListarValoresPorAno() {

    this.cadastros$ = this.api.listarValoresPorAno(this.usuarioLogado.idFiliacao);

  }

}
