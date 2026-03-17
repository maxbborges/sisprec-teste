import { CategoriasParaRelatorio } from "./../responses/sisprec-response";
export interface ListarExtratoFiltrado {
  idFederacao: number;
  idTipoConta: number;
  ano: number;
  mes: number;
  idPrestacaoContas: string;
  comAjuste?: boolean;
}

export interface ListarExtratoDespesa {
  idFederacao: number;
  ano: number;
}

export interface ListarLancamentoFiltrado {
  ano: number;
}

export interface InserirLancamento {
  idTipoLancamento: number;
  anoExercicio: number;
  mesExercicio: number;
  dataEvento: Date;
  valor: number;
  idItemLancamento: number;
  idFederacao: number;
  idUsuarioCadastro: number;
  idArquivo?: string;
}

export interface InserirLancamentoSaidaItem {
  idLancamento: string;
  idTipo: number;
  idCategoria: number;
  idCategoriaItem: number;
  idFornecedor: number;
  idRelatorioViagens: string;
  idTipoFornecedor: number;
  numeroDocumento: string;
  dataEvento: Date;
  valor: number;
  descricao: string;
  idArquivo: string;
  verificarSaldoLancamento: boolean;
  colaboradores: ColaboradorIem[];
  idTipoComprovante: string;
  numeroComprovante: string,
  dataComprovante: Date;
}

export interface ColaboradorIem {
  idLancamento: string;
  IdPrestacaoContaItemSaida: number;
  idUsuarioCadastro: number;
  idColaborador: number;
  salario: number;
}

export interface DesativarLancamento {
  idLancamento: string;
  idUsuarioDesativacao: number;
}

export interface AlterarLancamento {
  idLancamento: string;
  idArquivo: string;
  anoExercicio: number;
  mesExercicio: number;
  dataEvento: Date;
  valor: number;
  idItemLancamento: number;
  idUsuarioAlteracao: number;
}

export interface AlterarLancamentoDespesa {
  idDespesa: number;
  idLancamento: string;
  idTipo: number;
  idCategoria: number;
  idCategoriaItem: number;
  idTipoFornecedor: number;
  idUsuario: number;
  numeroDocumento: string;
  dataEvento: Date;
  valor: number;
  descricao: string;
  idArquivo: string;
  verificarSaldoLancamento: boolean;
  colaboradores: ColaboradorIem[];
  dataComprovante: string;
  numeroComprovante: string;
  idTipoComprovante: string;
}

export interface LancamentoDespesa extends AlterarLancamentoDespesa {
  idLancamento: string;
  categoria: string;
  codigoItem: string;
  tipo: string;
  tipoFornecedor: string;
  item: string;
  mes: number;
  ano: number;
  analise: string;
  idMotivo: number;
  idMotivos: number[];
  motivo: string;
  statusAtualPrestacaoContas: string;
  siglaStatusAtualPrestacaoContas: string;
  dataHora: Date;
  saldo: number;
}

export interface RelatorioDespesaFiltros {
  idFederacao: number;
  ano: number;
  idStatus?: number;
  categoria: CategoriasParaRelatorio;
  mes?: number;
}

export interface RelatorioHistoricoDocumentacao {
  anoExercicio: number;
  mesExercicio: number;
  idFederacao: number;
  idNomeDocumento?: number;
}

export interface RelatorioHistoricoDespesa {
  idFederacao: number;
  anoExercicio: number;
  categoria?: CategoriasParaRelatorio;
  mesExercicio: number;
}

export interface TarifaBancariaLancamentoCommand {
  idTarifaBancariaLancamento: string;
  idLancamento: string;
  anoExercicio: number;
  mesExercicio: number;
  idFederacao: number;
  idUsuario: number;
  idCategoria: string;
  idCategoriaItem: string;
}

export interface FiltrosListaTarifasBancariasLancamentoCommand {
  anoExercicio: number;
  mesExercicio: number;
  idFederacao: number;
}
