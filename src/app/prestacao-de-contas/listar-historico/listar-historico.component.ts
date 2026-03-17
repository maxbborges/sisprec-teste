import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FiltroDetalhePrestacaoContas } from 'src/app/shared/models/responses/sisprec-response';
import { ApiDocumentoService } from 'src/app/shared/services/api-documento.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-listar-historico',
  templateUrl: './listar-historico.component.html',
  styleUrls: ['./listar-historico.component.scss'],
  standalone: false
})
export class ListarHistoricoComponent implements OnInit {

  public status: string;
  public usuario: any;
  public mes = 0;
  public ano = 0;

  public lstHistorico: any[] = [];


  constructor(
    private route: ActivatedRoute,
    private prestacaoService: ApiPrestacaoContasService,
    private documentoService: ApiDocumentoService,
    private storageService: StorageService,
    private location: Location
  ) { }

  ngOnInit() {
    this.usuario = this.storageService.getUsuarioLogado();
    this.mes = this.route.snapshot.params.mes;
    this.ano = this.route.snapshot.params.ano;

    this.obterHistorico();
  }

  voltar() {
    this.location.back();
  }

  obterHistorico() {

    const obj: FiltroDetalhePrestacaoContas = {
      anoExercicio: this.ano,
      mesExercicio: this.mes,
      idFederacao: this.usuario.idFiliacao,
      sigla: null
    };

    this.prestacaoService.buscarHistoricoPrestacaoContas(obj).subscribe(
      data => {
        this.lstHistorico = data;
        console.clear();
        console.log(this.lstHistorico);
      }
    );
  }

}
