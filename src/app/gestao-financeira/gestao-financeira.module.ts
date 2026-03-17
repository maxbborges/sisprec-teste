// tslint:disable: max-line-length
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
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
import { GestaoFinanceiraRoutingModule } from './gestao-financeira-routing.module';
import { CadastrarTarifaBancariaComponent } from './tarifa-bancaria/cadastrar/cadastrar-tarifa-bancaria.component';
import { ListarTarifaBancariaComponent } from './tarifa-bancaria/listar/listar-tarifa-bancaria.component';

@NgModule({
  declarations: [
    VisualizarExtratoContaCorrenteComponent,
    CadastrarLancamentoContaCorrenteComponent,
    CopiarDespesaContaCorrenteComponent,
    VisualizarDespesasLancamentoContaCorrenteComponent,
    CadastrarDespesaContaCorrenteComponent,
    VisualizarDespesaContaCorrenteComponent,
    VisualizarExtratoContaInvestimentoComponent,
    CadastrarLancamentoContaInvestimentoComponent,
    ListarFornecedoresComponent,
    CadastrarFornecedorComponent,
    EditarLancamentoContaCorrenteComponent,
    EditarDespesaContaCorrenteComponent,
    EditarLancamentoContaInvestimentoComponent,
    EditarFornecedorComponent,
    CadastrarTarifaBancariaComponent,
    ListarTarifaBancariaComponent,
    CadastrarColaboradorComponent,
    EditarColaboradorComponent,
    ListarColaboradoresComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    GestaoFinanceiraRoutingModule
  ]
})
export class GestaoFinanceiraModule {}
