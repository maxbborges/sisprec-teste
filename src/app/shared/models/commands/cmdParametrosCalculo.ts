export interface CommandCadastrarParametrosCalculo {
  ano: number;
  idFederacao: number;
  valorRepasse: number;
  valorLicenciamento: number;
  quantidadeVeiculos: number;
  mesAbatimento: number;
  idUsuario: number;
}

export interface CommandAlterarParametrosCalculo {
  idParametroCalculo: number;
  ano: number;
  idFederacao: number;
  valorRepasse: number;
  valorLicenciamento: number;
  quantidadeVeiculos: number;
  mesAbatimento: number;
  idUsuario: number;
}

export interface CommandPesquisarParametrosCalculo {
  ano?: number;
  idFederacao?: number;
}

export interface ParametrosCalculoResponse {
  idParametroCalculo: number;
  ano: number;
  idFederacao: number;
  federacao: string;
  valorRepasse: number;
  valorLicenciamento: number;
  quantidadeVeiculos: number;
  mesAbatimento: number;
}
