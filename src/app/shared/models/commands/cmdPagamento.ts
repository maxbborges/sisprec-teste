export interface CommandPagamentoRepasseFinanceiro {
  idPagamento: string;
  idFederacao: number;
  numeroTitulo: string;
  dataEmissao: Date;
  dataVencimento: Date;
  valorTitulo: number;
  observacao: string;
  idUsuario: number;
  ano: number;
  mes: number;
}

export interface CommandEnviarPagamento {
  idPagamento: string;
  idUsuario: number;
}

export interface CommandPesquisarPagamento {
  idFederacao: number;
  dataInicial: Date;
  dataFinal: Date;
}

export interface ListaPagamentos {
  idPagamento: string;
  federacao: string;
  valorTitulo: number;
  status: string;
  siglaStatus: string;
  dataEmissao: Date;
  usuario: string;
  erro: string;
  dataMovimento: Date;
}

export interface PagamentoData {
  idPagamento: string;
  idFederacao: number;
  numeroTitulo: string;
  dataEmissao: string;
  dataVencimento: string;
  valorTitulo: number;
  observacao: string;
  enviadoProtheus: boolean;
  mes: number;
  ano: number;
}
