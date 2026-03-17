export interface InserirPrestacaoDeContas {
  anoExercicio: number;
  mesExercicio: number;
  idFederacao: number;
  versao: number;
  idStatusAtualPrestacaoContas: number;
  idUsuarioCadastro: number;
}

export class AprovarPrestacaoContas {
  idUsuario: number;
  idTipoPerfil: number;
  prestacoesAprovadas: string[];
}
