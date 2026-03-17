import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiDocumentoService } from 'src/app/shared/services/api-documento.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiLancamentoService } from 'src/app/shared/services/api-lancamento.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-analisar-historico',
  templateUrl: './analisar-historico.component.html',
  styleUrls: ['./analisar-historico.component.scss'],
  standalone: false
})
export class AnalisarHistoricoComponent implements OnInit {

  public idFederacao: number;
  public mesExerciocio: number;
  public anoExercicio: number;
  public idPrestacaoContas: string;
  public usuario: any;
  public itensRetornadosCC = 0;
  public itensRetornadosCI = 0;
  public historico: any[] = [];
  public federacao: any;

  constructor(
    private route: ActivatedRoute,
    private lancamentoService: ApiLancamentoService,
    private prestacaoService: ApiPrestacaoContasService,
    private documentoService: ApiDocumentoService,
    private indicadorService: ApiIndicadorService,
    private storageService: StorageService,
    private location: Location

  ) { }

  ngOnInit() {
    this.usuario = this.storageService.getUsuarioLogado();
    this.mesExerciocio = this.route.snapshot.params.mesExercicio;
    this.anoExercicio = this.route.snapshot.params.anoExercicio;
    this.idFederacao = this.route.snapshot.params.idFederacao;
    this.idPrestacaoContas = this.route.snapshot.params.idPrestacaoContas;
    this.buscarPrestacaoContas();
    this.buscarFederacaoPoId();

  }

  buscarPrestacaoContas() {
    this.prestacaoService.buscarHistoricoPrestacaoContasPorId(this.idPrestacaoContas).subscribe(
      data => {
        this.historico = data;
      });
  }

  voltar() {
    this.location.back();
  }


  buscarFederacaoPoId() {
    this.indicadorService.buscarIndicadorPorId(this.idFederacao).subscribe(
      data => {
        this.federacao = data;
        console.log(this.federacao);
      }
    );
  }

}
