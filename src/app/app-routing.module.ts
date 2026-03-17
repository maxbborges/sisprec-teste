import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EhDesenvolvedorGuard } from './shared/guards/eh-desenvolvedor.guard';
import { EstaLogadoGuard } from './shared/guards/esta-logado.guard';

const routes: Routes = [
  {
    path: 'inicio',
    loadChildren: () => import('./inicio/inicio.module').then(m => m.InicioModule),
    canActivate: [EstaLogadoGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
    canActivate: [EstaLogadoGuard]
  },
  {
    path: 'administrativo',
    loadChildren: () => import('./administrativo/administrativo.module').then(m => m.AdministrativoModule),
    canActivate: [EstaLogadoGuard, EhDesenvolvedorGuard]
  },
  {
    path: 'arquivo',
    loadChildren: () => import('./arquivo/arquivo.module').then(m => m.ArquivoModule),
    canActivate: [EstaLogadoGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'gestaoFinanceira',
    loadChildren: () => import('./gestao-financeira/gestao-financeira.module').then(m => m.GestaoFinanceiraModule),
    canActivate: [EstaLogadoGuard]
  },
  {
    path: 'visitaTecnica',
    loadChildren: () => import('./visita-tecnica/visita-tecnica.module').then(m => m.VisitaTecnicaModule),
    canActivate: [EstaLogadoGuard,EhDesenvolvedorGuard]
  },
  {
    path: 'prestacaoDeContas',
    loadChildren: () => import('./prestacao-de-contas/prestacao-de-contas.module').then(m => m.PrestacaoDeContasModule),
    canActivate: [EstaLogadoGuard]
  },
  {
    path: 'estimativaDeCusto',
    loadChildren: () => import('./estimativa-de-custo/estimativa-de-custo.module').then(m => m.EstimativaDeCustoModule),
    canActivate: [EstaLogadoGuard]
  },
  {
    path: 'relatorios',
    loadChildren: () => import('./relatorios/relatorios.module').then(m => m.RelatoriosModule),
    canActivate: [EstaLogadoGuard]
  },
  {
    path: 'pagamento-protheus',
    loadChildren: () => import('./pagamento-protheus/pagamento-protheus.module').then(m => m.PagamentoProtheusModule),
    canActivate: [EstaLogadoGuard]
  },
  {
    path: 'viagens',
    loadChildren: () => import('./viagens/viagens.module').then(m => m.ViagensModule),
    canActivate: [EstaLogadoGuard]
  },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: '**', redirectTo: 'inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
