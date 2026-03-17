export interface InserirFornecedor {
  idTipoFornecedor: string;
  numeroDocumento: string;
  nome: string;
  idUsuarioCadastro: number;
  idFornecedor: number;
}

export interface AlterarFornecedor {
  idFornecedor: number;
  idTipoFornecedor: number;
  numeroDocumento: string;
  nome: string;
  idUsuarioAlteracao: number;
}

export interface DesativarFornecedor {
  idFornecedor: number;
  idUsuarioDesativacao: number;
}
