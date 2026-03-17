export interface CopiarItemSubitemParaProximoAno {
  anoExercicio: number;
}

export interface InativarItemSubitem {
  idItemSubitem: string;
}

export interface InserirItemSubitem {
  anoExercicio: number;
  codigoItem: number;
  codigoSubitem: number;
  nome: string;
}

export interface EditarItemSubitem {
  idItemSubitem: string;
  anoExercicio: number;
  codigoItem: number;
  codigoSubitem: number;
  nome: string;
}

export interface ExistirItemSubitem {
  anoExercicio: number;
  codigoItem: number;
  codigoSubitem: number;
}

export interface CadastrarEditarValorCommand {
  idCadastro: string;
  idUsuario: number;
  itensSubitensValores: ItemSubitemValorCommand[];
}

export interface ItemSubitemValorCommand {
  idItemSubitem: string;
  mesesValores: MesValorCommand[];
  nome: string;
  total: number;
}

export interface MesValorCommand {
  idValor: string;
  mes: number;
  valor: number;
}

export interface AlterarCadastroStatusCommand {
  idCadastro: string;
  idUsuario: number;
  idCadastroStatus: number;
  motivo: string;
}

export interface DefinirPrazoCommand {
  idPrazoEnvioPrestacaoContas: string;
  anoExercicio: number;
  mesExercicio: number;
  dataLimitePagamento: Date;
  dataEnvioEmail: Date;
  idUsuariCadastro: number;
}

export interface DefinirPrazoData {
  idPrazoEnvioPrestacaoContas: string;
  anoExercicio: number;
  mesExercicio: number;
  dataLimitePagamento: Date;
  dataEnvioEmail: Date;
}
