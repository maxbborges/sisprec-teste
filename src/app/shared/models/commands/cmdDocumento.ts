export interface InserirDocumento {
  ano: number;
  mes?: number;
  idNomeDocumento: number;
  idArquivo?: string;
  idTextoHtml?:string;
  idFederacaoDono: number;
  idQuemSubiu: number;
  idUsuarioCadastro: number;
}

export interface DesativarDocumento {
  idDocumento: string;
  idUsuarioDesativacao: number;
}

export interface ListarDocumentoFiltrado {
  ano: number;
  idFederacaoDono: number;
  idNomeDocumento?: number;
  idTipo: number;
  mes: number;
  idPrestacaoContas?: string;
}

export interface AlterarDocumento {
  idDocumento: string;
  idUsuarioAlteracao: number;
  idArquivo?: string;
  idTextoHtml?: string;
  analisePresidente?: string;
  observacaoPresidente?: string; //Motivo da rejeição
  anoExercicio?: number;
  mesExercicio?: number;
  idFederacao?: number;
}
