import { Component, OnInit } from '@angular/core';
import { DesativarNomeDocumento, ListarNomeDocumentoFiltrado } from 'src/app/shared/models/commands/cmdNomeDocumento';
import { Indicador, NomeDocumento, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiNomeDocumentoService } from 'src/app/shared/services/api-nome-documento.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-listar-nome-documento',
  templateUrl: './listar-nome-documento.component.html',
  styleUrls: ['./listar-nome-documento.component.scss'],
  standalone: false
})
export class ListarNomeDocumentoComponent implements OnInit {
  public lstNomeDocumento: NomeDocumento[] = [];
  public lstTipoDeDocumento: Indicador[] = [];
  public msg = 'Selecione os filtros';
  public usuarioLogado: Usuario;

  // Filtros
  public filtroExercicio = 0;
  public filtroTipo = 0;
  public filtroAtivo = 1;

  public acaoBloqueada: boolean = false;

  constructor(
    private storage: StorageService,
    private nomeDocumentoService: ApiNomeDocumentoService,
    private indicadorService: ApiIndicadorService,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.carregarListaTipo();
    this.carregarListaNomeDocumento();
  }

  carregarListaNomeDocumento() {
    const cmdFiltrarListaNomeDocumento: ListarNomeDocumentoFiltrado = { exercicio: this.filtroExercicio, idTipo: this.filtroTipo, ativo: this.filtroAtivo };
    this.nomeDocumentoService.listarNomeDocumentoFiltrado(cmdFiltrarListaNomeDocumento).subscribe((lstNomeDocumento) => {
      if (lstNomeDocumento.length > 0) {
        this.lstNomeDocumento = lstNomeDocumento;
      } else {
        this.lstNomeDocumento = [];
        this.msg = 'Não foi encontrado nenhum resultado para a pesquisa realizada.';
      }
    }, (error) => {
      console.log('Erro ao retornar lista de documentos:');
      console.log(error);
    });
  }

  carregarListaTipo() {
    this.indicadorService.listarTodosIndicadoresPorTipoSigla('TipoDocumento').subscribe((lstTipoDeDocumento) => {
      this.lstTipoDeDocumento = lstTipoDeDocumento;
    }, (error) => {
      console.log('Erro ao carregar lista de tipo de documento:');
      console.log(error);
    });
  }


  alterarStatusAtivo(nomeDocumento: any){
    if(nomeDocumento.ativo){
      this.desativarNomeDocumento(nomeDocumento.idNomeDocumento);
    }
    else{
      this.ativarNomeDocumento(nomeDocumento.idNomeDocumento);
    }
  }

  ativarNomeDocumento(idNomeDocuemnto: number) {

    if (confirm('Deseja realmente ativar?')) {
      const documento: DesativarNomeDocumento = {
        idNomeArquivo: idNomeDocuemnto,
        idUsuarioDesativacao: this.usuarioLogado.idUsuario
      };

      this.nomeDocumentoService.ativarNomeDocumento(documento).subscribe((data) => {
        this.carregarListaNomeDocumento();
      });
    }
  }

  desativarNomeDocumento(idNomeDocuemnto: number) {

    if (confirm('Deseja realmente desativar?')) {
      const documento: DesativarNomeDocumento = {
        idNomeArquivo: idNomeDocuemnto,
        idUsuarioDesativacao: this.usuarioLogado.idUsuario
      };

      this.nomeDocumentoService.desativarNomeDocumento(documento).subscribe((data) => {
        this.carregarListaNomeDocumento();
      });
    }
  }

  alterarStatus(){
    if(this.filtroAtivo === 0){
      this.filtroAtivo = 1;
    }
    else{
      this.filtroAtivo = 0;
    }
  }
}
