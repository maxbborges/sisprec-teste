import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalTrocarPerfilComponent } from "./modal-trocar-perfil.component";

import { environment } from "src/environments/environment";
import { TipoUsuario, Usuario } from "../../models/responses/sisprec-response";
import { StorageService } from "../../services/storage.service";

@Component({
  selector: "app-menu-superior",
  templateUrl: "./menu-superior.component.html",
  styleUrls: ["./menu-superior.component.scss"],
  standalone: false
})
export class MenuSuperiorComponent implements OnInit {
  // Collapse
  isMenuCollapsed = true;

  // Nome do sistema
  nomeSistema = environment.nomeSistema;

  // Versão
  versao = environment.VERSAO;

  // Usuário logado
  usuarioLogado: Usuario;

  // Estimativa de Custo
  menuEstimativaCusto = false;
  menuEstimativaCustoAnalisar = false;
  menuEstimativaCustoCadastrarValores = false;
  menuEstimativaCustoManter = false;

  // Arquivo
  menuArquivo = false;
  menuArquivoBaixarComprovantes = false;
  menuArquivoInsercaoDocumento = false;
  menuArquivoNomeDocumento = false;

  // Gestão Financeira
  menuGestaoFinanceira = false;
  menuGestaoFinanceiraContaCorrente = false;
  menuGestaoFinanceiraContaInvestimento = false;
  menuGestaoFinanceiraColaboradores = false;
  menuGestaoFinanceiraFornecedores = false;
  menuGestaoFinanceiraTarifasBancarias = false;

  // Prestação de Contas
  menuPrestacaoContas = false;
  menuPrestacaoContasAnalisar = false;
  menuPrestacaoContasPesquisar = false;
  menuPrestacaoContasVisualizarAnalise = false;
  menuPrestacaoContasDefinirPrazo = false;

  // Relatórios
  menuRelatorios = false;
  menuRelatoriosAnalisePrestacaoContas = false;
  menuRelatoriosDespesas = false;
  menuRelatoriosPrestacaoContas = false;
  menuRelatoriosHistoricoPrestacaoContas = false;

  menuVisita = false;
  menuRelatoriosVisitasTecnicas = false;

  // Pagamento/Protheus
  menuPagamentoProtheus = false;
  menuPagamentoProtheusRepasseFinan = false;

  // Viagens
  menuViagens = false;
  menuViagensCadastrar = false;
  menuViagensAnalisar = false;
  menuViagensMinhasViagens = false;

  // Admin
  menuAdmin = false;
  menuAdminIndicadores = false;
  menuAdminIndicadoresSomenteDesenvolvedor = false;
  menuAdminUsuarios = false;

  // Alterar Senha
  menuAlterarSenha = false;

  private conferenciaDocumentacao = TipoUsuario.ConferenciaDocumentacao;
  private desenvolvedor = TipoUsuario.Desenvolvedor;
  private diretoria = TipoUsuario.Diretoria;
  private diretoriaAdjunta = TipoUsuario.DiretoriaAdjunta;
  private federacao = TipoUsuario.Federacao;
  private gestorFiscal = TipoUsuario.GestorFiscal;
  private auditoria = TipoUsuario.Auditoria;
  private tecnico = TipoUsuario.Tecnico;
  public presidente = TipoUsuario.Presidente;

  constructor(
    private ngbModal: NgbModal,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();

    // Estimativa de Custo - Analisar
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.gestorFiscal,
        this.auditoria,
        //this.presidente,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuEstimativaCusto = true;
      this.menuEstimativaCustoAnalisar = true;
    }
    // Estimativa de Custo - Cadastrar Valores
    if (
      [this.desenvolvedor, this.federacao, this.presidente].includes(
        this.usuarioLogado.tipoUsuarioSigla
      )
    ) {
      this.menuEstimativaCusto = true;
      this.menuEstimativaCustoCadastrarValores = true;
    }
    // Estimativa de Custo - Manter
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.gestorFiscal,
        this.auditoria,
        //this.presidente,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuEstimativaCusto = true;
      this.menuEstimativaCustoManter = true;
    }

    // Arquivo - Baixar Comprovantes
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.federacao,
        this.gestorFiscal,
        this.auditoria,
        this.presidente,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuArquivo = true;
      this.menuArquivoBaixarComprovantes = true;
    }
    // Arquivo - Inserção Documento
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.federacao,
        this.gestorFiscal,
        this.auditoria,
        this.presidente,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuArquivo = true;
      this.menuArquivoInsercaoDocumento = true;
    }
    // Arquivo - Nome Documento
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.gestorFiscal,
        this.auditoria,
        //this.presidente,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuArquivo = true;
      this.menuArquivoNomeDocumento = true;
    }

    // Gestão Financeira - Conta Corrente
    if (
      [this.desenvolvedor,
        this.federacao,
        this.presidente,
      ].includes(
        this.usuarioLogado.tipoUsuarioSigla
      )
    ) {
      this.menuGestaoFinanceira = true;
      this.menuGestaoFinanceiraContaCorrente = true;
    }
    // Gestão Financeira - Conta Investimento
    if (
      [this.desenvolvedor,
        this.federacao,
        this.presidente,
      ].includes(
        this.usuarioLogado.tipoUsuarioSigla
      )
    ) {
      this.menuGestaoFinanceira = true;
      this.menuGestaoFinanceiraContaInvestimento = true;
    }
    // Gestão Financeira - Fornecedores
    if (
      [this.desenvolvedor,
        this.federacao,      
        this.presidente,
      ].includes(
        this.usuarioLogado.tipoUsuarioSigla
      )
    ) {
      this.menuGestaoFinanceira = true;
      this.menuGestaoFinanceiraFornecedores = true;
      this.menuGestaoFinanceiraColaboradores = true;
    }
    // Gestão Financeira - Tarifas Bancarias
    if (
      [this.desenvolvedor,
        this.federacao,      
        this.presidente,
      ].includes(
        this.usuarioLogado.tipoUsuarioSigla
      )
    ) {
      this.menuGestaoFinanceira = true;
      this.menuGestaoFinanceiraTarifasBancarias = true;
    }

    // Prestação de Contas - Analisar
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.gestorFiscal,
        this.auditoria,
        //this.presidente,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuPrestacaoContas = true;
      this.menuPrestacaoContasAnalisar = true;
    }
    // Prestação de Contas - Pesquisar
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.diretoria,
        this.diretoriaAdjunta,
        this.gestorFiscal,
        this.auditoria,
        this.presidente,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuPrestacaoContas = true;
      this.menuPrestacaoContasPesquisar = true;
    }
    // Prestação de Contas - Visualizar Análise
    if (
      [this.desenvolvedor, this.federacao].includes(
        this.usuarioLogado.tipoUsuarioSigla
      )
    ) {
      this.menuPrestacaoContas = true;
      this.menuPrestacaoContasVisualizarAnalise = true;
    }
    // Prestação de Contas - Definir Prazo
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.gestorFiscal,
        this.auditoria,
        //this.presidente,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuPrestacaoContas = true;
      this.menuPrestacaoContasDefinirPrazo = true;
    }

    // Relatórios - Análise Prestação de Contas
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.diretoria,
        this.diretoriaAdjunta,
        this.federacao,
        this.gestorFiscal,
        this.auditoria,
        this.presidente,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuRelatorios = true;
      this.menuRelatoriosAnalisePrestacaoContas = true;
    }
    // Relatórios - Despesas
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.diretoria,
        this.diretoriaAdjunta,
        this.federacao,
        this.gestorFiscal,
        this.auditoria,
        this.presidente,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuRelatorios = true;
      this.menuRelatoriosDespesas = true;
    }
    // Relatórios - Prestação de Contas
    if (
      [this.desenvolvedor, this.federacao, this.auditoria].includes(
        this.usuarioLogado.tipoUsuarioSigla
      )
    ) {
      this.menuRelatorios = true;
      this.menuRelatoriosPrestacaoContas = true;
    }

    // Relatórios - Histórico de Prestação de Contas
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.gestorFiscal,
        this.presidente,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuRelatorios = true;
      this.menuRelatoriosHistoricoPrestacaoContas = true;
    }

    // Vistas - Relatórios de
    if (
      [this.desenvolvedor, this.gestorFiscal, this.auditoria].includes(
        this.usuarioLogado.tipoUsuarioSigla
      )
    ) {
      this.menuVisita = true;
      this.menuRelatoriosVisitasTecnicas = true;
    }
    // Pagamento/Protheus - Repasse Financeiro
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.gestorFiscal,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuPagamentoProtheus = true;
      this.menuPagamentoProtheusRepasseFinan = true;
    }

    // Viagens
    if ( //verificar quais perfis terão permissão
      [
        this.desenvolvedor,
        this.federacao,
        this.tecnico,
        this.presidente
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuViagens = true;
      if(this.tecnico == this.usuarioLogado.tipoUsuarioSigla)
        this.menuViagensCadastrar = true;
      if(this.federacao == this.usuarioLogado.tipoUsuarioSigla){
        this.menuViagensAnalisar = true;
        this.menuViagensMinhasViagens = true;
      }
      if(this.presidente == this.usuarioLogado.tipoUsuarioSigla){
        this.menuViagensAnalisar = true;
      }
      if(this.desenvolvedor == this.usuarioLogado.tipoUsuarioSigla){
        this.menuViagensAnalisar = true;
        this.menuViagensMinhasViagens = true;
      }
    }
    // Admin - Indicadores
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.gestorFiscal,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuAdmin = true;
      this.menuAdminIndicadores = true;
    }
    // Admin - Indicadores somente Desenvolvedor
    if ([this.desenvolvedor].includes(this.usuarioLogado.tipoUsuarioSigla)) {
      this.menuAdmin = true;
      this.menuAdminIndicadoresSomenteDesenvolvedor = true;
    }
    // Admin - Usuários
    if (
      [
        this.conferenciaDocumentacao,
        this.desenvolvedor,
        this.gestorFiscal,
        this.auditoria,
      ].includes(this.usuarioLogado.tipoUsuarioSigla)
    ) {
      this.menuAdmin = true;
      this.menuAdminUsuarios = true;
    }

    // Alterar Senha
    if ([this.federacao].includes(this.usuarioLogado.tipoUsuarioSigla)) {
      this.menuAlterarSenha = true;
    }
  }

  get usuarioLogadoDinamico(): Usuario {
    var usuariolog = this.storageService.getUsuarioLogado();
    try{
      if(usuariolog.permitirTrocaTipoUsuario) true;
    }catch{usuariolog.permitirTrocaTipoUsuario = false;}
    return usuariolog;
  }

  trocarPerfil(): void {
    this.ngbModal.open(ModalTrocarPerfilComponent, {
      ariaLabelledBy: "modal-trocar-perfil",
    });
  }
}
