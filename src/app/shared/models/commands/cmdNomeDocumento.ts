export interface ListarNomeDocumentoFiltrado {
  exercicio: number;
  idTipo: number;
  ativo: number;
}

export interface InserirNomeDocumento {
  exercicio: number;
  nome: string;
  idTipo: number;
  federacoes: InserirFederacaoNomeDocumento[];
  idUsuarioCadastro: number;
}

export interface AlterarNomeDocumento {
  idNomeDocumento: number;
  exercicio: number;
  nome: string;
  idTipo: number;
  federacoes: AlterarFederacaoNomeDocumento[];
  idUsuarioAlteracao: number;
}

export interface InserirFederacaoNomeDocumento {
  idFederacao: number;
  idNomeDocumento?: number;
  ativo: boolean;
}

export interface AlterarFederacaoNomeDocumento {
  idFederacao: number;
  idNomeDocumento: number;
  ativo: boolean;
}

export interface DesativarNomeDocumento {
  idNomeArquivo: number;
  idUsuarioDesativacao: number;
}
