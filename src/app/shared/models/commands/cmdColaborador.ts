export interface InserirColaborador {
  idTipoColaborador: string;
  numeroDocumento: string;
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  idUsuarioCadastro: number;
  idColaborador: number;
  idFederacao: number;
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

export interface AlterarColaborador {
  idColaborador: number;
  idTipoColaborador: number;
  numeroDocumento: string;
  nome: string;
  email: string;
  telefone: string;
  idUsuarioAlteracao: number;
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
  isExclusividade: string;
}

export interface DesativarColaborador {
  idColaborador: number;
  idUsuarioDesativacao: number;
}
