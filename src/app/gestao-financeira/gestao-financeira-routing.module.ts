// tslint:disable: max-line-length
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateInternoComponent } from '../shared/templates/template-interno/template-interno.component';
import { CadastrarColaboradorComponent } from './colaborador/cadastrar-colaborador/cadastrar-colaborador.component';
import { EditarColaboradorComponent } from './colaborador/editar-colaborador/editar-colaborador.component';
import { ListarColaboradoresComponent } from './colaborador/listar-colaboradores/listar-colaboradores.component';
import { CadastrarDespesaContaCorrenteComponent } from './conta-corrente/cadastrar-despesa-conta-corrente/cadastrar-despesa-conta-corrente.component';
import { CadastrarLancamentoContaCorrenteComponent } from './conta-corrente/cadastrar-lancamento-conta-corrente/cadastrar-lancamento-conta-corrente.component';
import { CopiarDespesaContaCorrenteComponent } from './conta-corrente/copiar-despesa-conta-corrente/copiar-despesa-conta-corrente.component';
import { EditarDespesaContaCorrenteComponent } from './conta-corrente/editar-despesa-conta-corrente/editar-despesa-conta-corrente.component';
import { EditarLancamentoContaCorrenteComponent } from './conta-corrente/editar-lancamento-conta-corrente/editar-lancamento-conta-corrente.component';
import { VisualizarDespesaContaCorrenteComponent } from './conta-corrente/visualizar-despesa-conta-corrente/visualizar-despesa-conta-corrente.component';
import { VisualizarDespesasLancamentoContaCorrenteComponent } from './conta-corrente/visualizar-despesas-lancamento-conta-corrente/visualizar-despesas-lancamento-conta-corrente.component';
import { VisualizarExtratoContaCorrenteComponent } from './conta-corrente/visualizar-extrato-conta-corrente/visualizar-extrato-conta-corrente.component';
import { CadastrarLancamentoContaInvestimentoComponent } from './conta-investimento/cadastrar-lancamento-conta-investimento/cadastrar-lancamento-conta-investimento.component';
import { EditarLancamentoContaInvestimentoComponent } from './conta-investimento/editar-lancamento-conta-investimento/editar-lancamento-conta-investimento.component';
import { VisualizarExtratoContaInvestimentoComponent } from './conta-investimento/visualizar-extrato-conta-investimento/visualizar-extrato-conta-investimento.component';
import { CadastrarFornecedorComponent } from './fornecedor/cadastrar-fornecedor/cadastrar-fornecedor.component';
import { EditarFornecedorComponent } from './fornecedor/editar-fornecedor/editar-fornecedor.component';
import { ListarFornecedoresComponent } from './fornecedor/listar-fornecedores/listar-fornecedores.component';
import { CadastrarTarifaBancariaComponent } from './tarifa-bancaria/cadastrar/cadastrar-tarifa-bancaria.component';
import { ListarTarifaBancariaComponent } from './tarifa-bancaria/listar/listar-tarifa-bancaria.component';

const routes: Routes = [
  {
    path: '',
    component: TemplateInternoComponent,
    children: [
      { path: 'conta-corrente', component: VisualizarExtratoContaCorrenteComponent },
      //{ path: 'conta-corrente/:filtro', component: VisualizarExtratoContaCorrenteComponent },
      { path: 'conta-corrente/cadastrarLancamento/:ano/:mes', component: CadastrarLancamentoContaCorrenteComponent },
      { path: 'conta-corrente/editarLancamento/:idLancamento', component: EditarLancamentoContaCorrenteComponent },
      { path: 'conta-corrente/despesasLancamento/:idLancamento', component: VisualizarDespesasLancamentoContaCorrenteComponent },
      { path: 'conta-corrente/cadastrarDespesa/:idLancamento', component: CadastrarDespesaContaCorrenteComponent },
      { path: 'conta-corrente/editarDespesa/:idDespesa', component: EditarDespesaContaCorrenteComponent },
      { path: 'conta-corrente/copiarDespesa/:idDespesa', component: CopiarDespesaContaCorrenteComponent },
      { path: 'conta-corrente/visualizarDespesa/:idDespesa', component: VisualizarDespesaContaCorrenteComponent },
      { path: 'conta-investimento', component: VisualizarExtratoContaInvestimentoComponent },
      { path: 'conta-investimento/cadastrarLancamento/:ano/:mes', component: CadastrarLancamentoContaInvestimentoComponent },
      { path: 'conta-investimento/editarLancamento/:idLancamento', component: EditarLancamentoContaInvestimentoComponent },
      { path: 'colaborador', component: ListarColaboradoresComponent },
      { path: 'colaborador/cadastrar', component: CadastrarColaboradorComponent },
      { path: 'colaborador/editar/:idColaborador', component: EditarColaboradorComponent },
      { path: 'fornecedor', component: ListarFornecedoresComponent },
      { path: 'fornecedor/cadastrar', component: CadastrarFornecedorComponent },
      { path: 'fornecedor/editar/:idFornecedor', component: EditarFornecedorComponent },
      { path: 'tarifa-bancaria/cadastrar', component: CadastrarTarifaBancariaComponent },
      { path: 'tarifa-bancaria/editar/:idTarifaBancariaLancamento', component: CadastrarTarifaBancariaComponent },
      { path: 'tarifa-bancaria', component: ListarTarifaBancariaComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestaoFinanceiraRoutingModule { }
