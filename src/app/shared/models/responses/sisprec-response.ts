export interface Documento {
  idDocumento: string;
  ano: number;
  mes: number;
  nomeMes: string;
  idNomeDocumento: number;
  nomeDocumento: string;
  idArquivo: string;
  idTextoHtml: string;
  idFederacao: number;
  ativo: boolean;
  idFederacaoDono: number;
  federacaoDono: string;
  federacao: string;
  siglaFederacao: string;
  idQuemSubiu: number;
  quemSubiu: string;
  idUsuarioCadastro: number;
  dataCadastro: Date;
  idUsuarioDesativacao: number;
  dataDesativacao: Date;
  tipo: string;
  idPrestacaoContas: string;
  nomeStatusPrestacaoContas: string;
  idAnalise: number;
  nomeAnalise: string;
  idMotivo: number;
  nomeMotivo: string;
  analise: string;
  motivo: string;
  observacao: string;
  versaoPrestacaoDeContas: number;
  siglaStatusPrestacaoContas: string;
}

export interface ExtratoContaInvestimentoImpostos {
  iof: number;
  irrf: number;
  aplicacao: number;
  resgate: number;
  rendimentoBrutoMes: number;
}
export interface Banco {
  idBanco: string;
  codigo: string;
  titulo: string;
}
export interface Colaborador {
  idColaborador: number;
  idTipoColaborador: number;
  tipoColaborador: string;
  numeroDocumento: string;
  numeroDocumentoComMascara: string;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  idUsuarioCadastro: number;
  dataCadastro: Date;
  idUsuarioAlteracao: number;
  dataAlteracao: Date;
  idUsuarioDesativacao: number;
  dataDesativacao: Date;
  salario: string;
  dataNascimento: Date;
  rg: string;
  dataAdmissao: Date;
  dataDesligamento: Date;
  placaVeiculo: string;
  enderecoLocacao: string;
  idBanco: string;
  agencia: string;
  agenciaDigito: string;
  conta: string;
  contaDigito: string;
  tipoConta: string;
  variacaoConta: string;
  isExclusividade: boolean;
}

export interface FiltroColaboradores {
  idTipoColaborador: number;
  numeroDocumento: string;
  cpf: string;
  nome: string;
  email: string;
}

export interface Fornecedor {
  idFornecedor: number;
  idTipoFornecedor: number;
  tipoFornecedor: string;
  numeroDocumento: string;
  numeroDocumentoComMascara: string;
  nome: string;
  ativo: boolean;
  idUsuarioCadastro: number;
  dataCadastro: Date;
  idUsuarioAlteracao: number;
  dataAlteracao: Date;
  idUsuarioDesativacao: number;
  dataDesativacao: Date;
}

export interface Indicador {
  idIndicador: number;
  nome: string;
  sigla: string;
  valor: string;
  idIndicadorTipo: number;
  indicadorTipo: string;
  ativo: boolean;
}

export interface IndicadorTipo {
  idIndicadorTipo: number;
  nome: string;
  sigla: string;
  descricao: string;
}

export interface ItemLancamento {
  idItemLancamento: number;
  item: string;
  idTipoLancamento: number;
  tipoLancamento: string;
  anoExercicio: number;
  ativo: boolean;
  ordem: number;
}

export interface Lancamento {
  idLancamento: string;
  idTipoConta: number;
  idArquivo: string;
  nomeArquivo: string;
  tipoConta: string;
  siglaTipoConta: string;
  idTipoLancamento: number;
  tipoLancamento: string;
  siglaTipoLancamento: string;
  anoExercicio: number;
  mesExercicio: number;
  dataEvento: string;
  dataHora: string;
  valor: number;
  saldo: number;
  idItemLancamento?: number;
  itemLancamento: string;
  idFederacao: number;
  federacao: string;
  siglaFederacao: string;
  ativo: boolean;
  idUsuarioCadastro: number;
  usuarioCadastro: string;
  dataCadastro: string;
  idUsuarioAlteracao?: number;
  usuarioAlteracao: string;
  dataAlteracao?: string;
  idUsuarioDesativacao?: number;
  usuarioDesativacao: string;
  dataDesativacao?: string;
  idAnalise?: number;
  analise: string;
  siglaAnalise: string;
  idMotivo?: number;
  motivo: string;
  siglaMotivo: string;
  idPrestacaoContas?: string;
  idStatusAtualPrestacaoContas?: number;
  statusAtualPrestacaoContas: string;
  siglaStatusAtualPrestacaoContas: string;
  haverAjustesParaDespesas: boolean;
  quantidadeArquivo: number;
  observacao: string;
  dataAtualizacaoItem?: string;
  nomeAnalise?: string;
}

export interface Visita {
  idVisita: string;
  anoExercicio: number;
  mesExercicio: number;
  idFederacao: number;
  federacao: string;
  idUsuarioCadastro: number;
  usuarioCadastro: string;
  dataCadastro: string;
  idUsuarioAlteracao?: number;
  usuarioAlteracao: string;
  dataAlteracao?: string;
  idArquivo: string;
  nomeArquivo: string;
}

export interface LancamentoExportacao {
  tipoLancamento: string;
  anoExercicio: number;
  mesExercicio: number;
  dataEvento: Date;
  valor: number;
  saldo: number;
  itemLancamento: string;
  federacao: string;
}

export interface ListaNomeDocumentoCategorizado {
  idTipo: number;
  nome: string;
  tipo: string;
  listaNomeDocumento: NomeDocumento[];
}

export interface NomeDocumento {
  idNomeDocumento: number;
  exercicio: number;
  nome: string;
  idTipo: number;
  tipo: string;
  ativo: boolean;
  dataCadastro: Date;
  idUsuarioCadastro: number;
  dataAlteracao: Date;
  idUsuarioAlteracao: number;
  dataDesativacao: Date;
  idUsuarioDesativacao: number;
  qtddDocumentosVinculados: number;
  federacoes: FederacaoNomeDocumento[];
}

export interface FederacaoNomeDocumento {
  idFederacao: number;
  nomeFederacao: string;
  siglaFederacao: string;
  idNomeDocumento?: number;
  ativo: boolean;
}

export interface Banco {
  idBanco: string;
  codigo: string;
  titulo: string;
}

export interface Usuario {
  idUsuario: number;
  nome: string;
  email: string;
  idTipoUsuario: number;
  permitirTrocaTipoUsuario: boolean;
  tipoUsuario: string;
  tipoUsuarioSigla: string;
  idFiliacao: number;
  filiacao: string;
  filiacaoSigla: string;
  ativo: boolean;
  dataCadastro: Date;
  idFederacao: number;
  idUsuarioCadastro: number;
  dataAlteracao: Date;
  idUsuarioAlteracao: number;
  dataDesativacao: Date;
  idUsuarioDesativacao: number;
  alterarSenhaProximoAcesso: boolean;
  logouComSenhaMestre: boolean;
  ehDesenvolvedor: boolean;
  ehDex: boolean;
}

export interface PrestacaoContas {
  idPrestacaoContas?: string;
  idFederacao: number;
  siglaFederacao: string;
  anoExercicio: number;
  mesExercicio: number;
  idStatusPrestacaoContas: number;
  nomeStatusPrestacaoContas: string;
  siglaStatusPrestacaoContas: string;
  ordemStatusPrestacaoContas?: number;
  versao?: number;
  aprovacaoDiretoriaAdjunta?: Date;
  aprovacaoDiretoria?: Date;
  existirDocumento: boolean;
  disponivelBotaoAprovar: boolean;
  disponivelBotaoRetornarParaAjustes: boolean;
  todosItensNaoAnalisados: boolean;
  contaCorrenteContaInvestimentoPositiva: boolean;
}

export interface BuscarPrestacaoContas {
  exercicio?: number;
  anoExercicio?: number;
  mesExercicio?: number;
  idStatusAtualPrestacaoContas?: number[];
  versao?: number;
  IdFederacao?: number;
}

export interface FiltroBuscarPrestacao {
  anoExercicio?: string;
  mesExercicio?: string;
  idStatusAtualPrestacaoContas?: number[];
  versao?: number;
  IdFederacao?: number;
}

export interface AlterarPrestacaoContas {
  idPrestacaoContas: string;
  idFederacao?: number;
  versao?: number;
  idStatusAtualPrestacaoContas?: number;
  aprovacaoDiretoria?: Date;
  aprovacaoDiretoriaAdjunta?: Date;
  anoExercicio?: number;
  mesExercicio?: number;
  idUsuarioCadastro?: number;
  dataCadastro?: Date;
  dataAlteracao?: Date;
}

export interface AlterarStatusPrestacaoContas {
  idPrestacaoContas: string;
  idStatusAtualPrestacaoContas?: number;
  idUsuarioCadastro?: number;
}

export interface AlterarDocumentoAnaliseMotivo {
  idDocumento: string;
  idAnalise: number;
  idMotivo: number;
  idPrestacaoContas: string;
}

export interface FiltroDetalhePrestacaoContas {
  idFederacao: number;
  mesExercicio: number;
  anoExercicio: number;
  sigla?: string;
}

export interface RelatorioSaida {
  Data: string;
  Descricao: string;
  Entradas: string;
  Saidas: string;
}

export interface VerificaVersao {
  idPrestacaoContas: string;
  siglaIndicador: string;
}

export interface ItemSubitem {
  idItemSubitem: string;
  anoExercicio: number;
  codigoItem: number;
  codigoSubitem: number;
  nome: string;
}

export interface Cadastro {
  idCadastro: string;
  idFederacao: number;
  nomeFederacao: string;
  siglaFederacao: string;
  anoExercicio: number;
  idCadastroStatus: number;
  nomeCadastroStatus: string;
}

export interface Valor {
  idCadastroStatus: number;
  itensSubitensValores: ItemSubitemValor[];
  totaisMesesValores: TotalMesValor[];
  total: number;
}

export interface ItemSubitemValor {
  idItemSubitem: string;
  ehPai: boolean;
  codigoItem: string;
  nomeItem: string;
  codigo: string;
  nome: string;
  total: number;
  mesesValores: MesValor[];
  mesesDespesas: MesValor[];
  mesesTotais: MesValor[];
  totalDespesas: number;
}

export interface MesValor {
  idValor: string;
  mes: number;
  valor: number;
}

export interface TotalMesValor {
  mes: number;
  totalMes: number;
}

export interface Historico {
  idHistorico: string;
  data: Date;
  nomeUsuario: string;
  nomeCadastroStatus: string;
  motivo: string;
}

export interface RelatorioPrestacaoContasResponse {
  relatorioPrestacaoContasLancamentosResponse: RelatorioPrestacaoContasLancamentoResponse[];
  totalEntradasExtratoCC: number;
  totalSaidasExtratoCC: number;
  saldoAnteriorCC: number;
  totalEntradasCC: number;
  totalSaidasCC: number;
  saldoAtualCC: number;
  saldoAnteriorCI: number;
  totalEntradasCI: number;
  totalSaidasCI: number;
  totalRendimentosCI: number;
  totalIRCI: number;
  totalIOFCI: number;
  saldoAtualCI: number;
  saldoAtualCCCI: number;
}

export interface RelatorioPrestacaoContasLancamentoResponse {
  dataCC: Date;
  descricaoCC: string;
  entradaCC: number;
  saidaCC: number;
}

export interface RelatorioDespesa {
  federacao: string;
  ano: number;
  mes: number;
  situacao: string;
  idPrestacaoContas: string;
  item: string;
  valorTotal: number;
  [key: string]: any;
}

export interface RelatorioHistoricoPrestacaoContasDocumentacao {
  n: number;
  data: Date;
  email: string;
  status: string;
  nomeDocumento: string;
  idArquivo: string;
  idPrestacaoContas: string;
  motivo: string;
}

export interface RelatorioHistoricoPrestacaoContasDespesa {
  n: number;
  data: Date;
  email: string;
  status: string;
  item: string;
  valorTotal: number;
  idArquivo: string;
  idPrestacaoContas: string;
  motivo: string;
}

export interface FederacaoNomeDocumentoObrigatorio {
  idNomeDocumento: number;
  nomeDocumento: string;
  documentoObrigatorio: boolean;
}

export interface CategoriasParaRelatorio {
  codigoItem: number;
  codigoSubitem: number;
  item: string;
}

export class TipoUsuario {
  static ConferenciaDocumentacao = "UsuarioConferenciaDoc";
  static Desenvolvedor = "UsuarioDesenvolvedor";
  static Diretoria = "UsuarioDiretoria";
  static DiretoriaAdjunta = "UsuarioDiretoriaAdjunta";
  static Federacao = "UsuarioFederacao";
  static GestorFiscal = "UsuarioGestorFiscal";
  static Auditoria = "UsuarioAuditoria";
  static Tecnico = "UsuarioTecnico";
  static Presidente = "UsuarioPresidente";
}

export interface FiltroFornecedores {
  idTipoFornecedor: number;
  numeroDocumento: string;
  nome: string;
}

export interface LancamentoSaidaPorMesAnoData {
  idLancamento: string;
  valor: number;
  dataEvento: Date;
  item: string;
}

export interface TarifasBancariasVinculadasData {
  IdTarifaBancariaLancamento: string;
  AnoExercicio: number;
  MesExercicio: number;
  Categoria: string;
  CategoriaItem: string;
  Lancamento: string;
  Valor: number;
  Federacao: string;
}

export interface TarifaBancariaVinculadaData {
  idTarifaBancariaLancamento: string;
  anoExercicio: number;
  mesExercicio: number;
  idCategoria: string;
  idCategoriaItem: string;
  idLancamento: string;
}

export interface LogData {
  idLogProtocolo: string;
  data : Date;
  idUsuario : number;
  acaoRealizada : string;
  idLancamento : string;
  idPrestacaoContaItemSaida : number;
  objeto : string;
}
