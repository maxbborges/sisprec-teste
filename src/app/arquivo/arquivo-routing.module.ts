import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TemplateInternoComponent } from '../shared/templates/template-interno/template-interno.component';
import { DownloadArquivosDespesasComponent } from './documento/download-arquivos-despesas/download-arquivos-despesas.component';
import { InserirDocumentoComponent } from './documento/inserir-documento/inserir-documento.component';
import { ListarDocumentosComponent } from './documento/listar-documentos/listar-documentos.component';
import { RelatorioCoordenadorComponent } from './documento/relatorio-coordenador/relatorio-coordenador.component';
import { CadastrarNomeDocumentoComponent } from './nomeDocumento/cadastrar-nome-documento/cadastrar-nome-documento.component';
import { EditarNomeDocumentoComponent } from './nomeDocumento/editar-nome-documento/editar-nome-documento.component';
import { ListarNomeDocumentoComponent } from './nomeDocumento/listar-nome-documento/listar-nome-documento.component';

const routes: Routes = [
  {
    path: '',
    component: TemplateInternoComponent,
    children: [
      { path: 'documentos', component: ListarDocumentosComponent },
      { path: 'documentos/rfc/:idDocumento', component: ListarDocumentosComponent },
      { path: 'documentos/inserir', component: InserirDocumentoComponent },
      { path: 'documentos/relatorio-coordenador/visualizar/:idDocumento', component: RelatorioCoordenadorComponent },
      { path: 'documentos/relatorio-coordenador/editar/:idDocumento', component: RelatorioCoordenadorComponent },
      { path: 'documentos/relatorio-coordenador/:ano/:mes/:idNomeDocumento', component: RelatorioCoordenadorComponent },
      { path: 'baixar-comprovantes', component: DownloadArquivosDespesasComponent },
      { path: 'nomeDocumento', component: ListarNomeDocumentoComponent },
      { path: 'nomeDocumento/cadastrar', component: CadastrarNomeDocumentoComponent },
      { path: 'nomeDocumento/editar/:idNomeDocumento', component: EditarNomeDocumentoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArquivoRoutingModule { }
