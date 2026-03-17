import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ArquivoRoutingModule } from './arquivo-routing.module';
import { DownloadArquivosDespesasComponent } from './documento/download-arquivos-despesas/download-arquivos-despesas.component';
import { InserirDocumentoComponent } from './documento/inserir-documento/inserir-documento.component';
import { ListarDocumentosComponent } from './documento/listar-documentos/listar-documentos.component';
import { RelatorioCoordenadorComponent } from './documento/relatorio-coordenador/relatorio-coordenador.component';
import { CadastrarNomeDocumentoComponent } from './nomeDocumento/cadastrar-nome-documento/cadastrar-nome-documento.component';
import { EditarNomeDocumentoComponent } from './nomeDocumento/editar-nome-documento/editar-nome-documento.component';
import { ListarNomeDocumentoComponent } from './nomeDocumento/listar-nome-documento/listar-nome-documento.component';

@NgModule({
  declarations: [
    DownloadArquivosDespesasComponent,
    EditarNomeDocumentoComponent,
    CadastrarNomeDocumentoComponent,
    ListarNomeDocumentoComponent,
    ListarDocumentosComponent,
    InserirDocumentoComponent,
    RelatorioCoordenadorComponent
  ],
  imports: [ArquivoRoutingModule, SharedModule]
})
export class ArquivoModule {}
