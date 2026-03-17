import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListarDocumentoFiltrado } from 'src/app/shared/models/commands/cmdDocumento';
import { ApiDocumentoService } from 'src/app/shared/services/api-documento.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-listar-documentacao',
  templateUrl: './listar-documentacao.component.html',
  styleUrls: ['./listar-documentacao.component.scss'],
  standalone: false
})
export class ListarDocumentacaoComponent implements OnInit {

  public urlDownload = environment.urlApiSisprec + 'arquivo/porId/';
  public urlDownloadRelatorio = environment.urlApiSisprec + 'textoHtml/pdf/';
  public tituloDoc = "/relatorio-coordenador";
  public idPrestacaoConta: string;
  public mes = 0;
  public ano = 0;
  public status: string;
  public idFederacao: number;
  public versaoStatus: number;
  public usuario: any;
  public msg: 'Nenhum registro encontrado';

  public lstDocumentos: any[] = [];


  constructor(
    private route: ActivatedRoute,
    private prestacaoService: ApiPrestacaoContasService,
    private documentoService: ApiDocumentoService,
    private storageService: StorageService,
    private location: Location
  ) { }

  ngOnInit() {
    this.usuario = this.storageService.getUsuarioLogado();
    this.idPrestacaoConta = this.route.snapshot.params.id;
    this.mes = this.route.snapshot.params.mes;
    this.ano = this.route.snapshot.params.ano;
    this.idFederacao = this.route.snapshot.params.idFederacao;

    this.obterDocumentos();

  }

  voltar() {
    this.location.back();
  }

  obterDocumentos() {
    const obj: ListarDocumentoFiltrado = { mes: this.mes, ano: this.ano, idNomeDocumento: 0, idFederacaoDono: this.idFederacao, idTipo: 0 };

    this.documentoService.listarDocumentoFiltrado(obj, true).subscribe(
      data => {
        if (data.length > 0) {
          this.status = data[0].nomeAnalise;
          this.versaoStatus = data[0].versaoPrestacaoDeContas;
        }
        this.lstDocumentos = data;
        console.clear();
        console.log(this.lstDocumentos);
      }
    );
  }
}
