import { ListagemRelatorioViagens } from "./cmdRelatorioViagens";

export interface InserirSolicitacaoDiaria {
    nomeViajante: string;
    emailViajante: string;
    distanciaKm: number;
    numeroDiarias: number;
    valorUnitarioDiaria: number;
    valorTotal: number;
    finalidadeViagem: string;
    idUsuarioSolicitante: number;
    idFederacaoSolicitante: number;
    solicitacoesDiariaTrecho: Array<SolicitacaoDiariaTrecho>;
    assinado: boolean;
}

export interface SolicitacaoDiariaTrecho {
    idSolicitacaoDiariaTrecho?: string;
    origemUf: string;
    origemCidade: string;
    destinoUf: string;
    destinoCidade: string;
    dataInicio: Date | string;
    dataFim: Date | string;
}

export interface SolicitacaoLocalidade {
    uf: string;
    cidade: string;
    localizacao: string;
}

export interface PesquisarSolicitacaoDiariaCoordenador {
    nomeViajante?: string;
    emailViajante?: string;
    idFederacao: number;
    idStatus?: Array<number>;
    idSolicitacaoNum?: number;
    dataInicial?: string;
    dataFinal?: string;
    origemUf?: string;
    origemCidade?: string;
    destinoUf?: string;
    destinoCidade?: string;
}

export interface PesquisarSolicitacaoDiariaUsuario {
    idStatus?: Array<number>;
    idSolicitacaoNum?: number;
    dataInicial?: string;
    dataFinal?: string;
    origemUf?: string;
    origemCidade?: string;
    destinoUf?: string;
    destinoCidade?: string;
}

export interface AlterarSolicitacaoDiaria {
    nomeViajante: string;
    emailViajante: string;
    distanciaKm: number;
    numeroDiarias: number;
    valorUnitarioDiaria: number;
    valorTotal: number;
    finalidadeViagem: string;
    idUsuarioSolicitante: number;
    idFederacaoSolicitante: number;
    solicitacoesDiariaTrecho: Array<SolicitacaoDiariaTrecho>;
    solicitacoesDiariaTrechoExcluido: Array<SolicitacaoDiariaTrecho>;
    assinado: boolean;
}

export interface SolicitacaoDiariaCompletoPesquisa {
    solicitacaoDiariaCompleto: SolicitacaoDiariaCompleto;
    relatorioCompleto?: ListagemRelatorioViagens;
    solicitacaoDiariaTrecho: Array<SolicitacaoDiariaTrecho>;
    analiseSolicitacao: AnaliseSolicitacaoDiaria;
}

export interface SolicitacaoDiariaCompleto {
    idSolicitacaoDiaria: string;
    nomeViajante: string;
    emailViajante: string;
    distanciaKm: number;
    numeroDiarias: number;
    valorUnitarioDiaria: number;
    valorTotal: number;
    finalidadeViagem: string;
    idRelatorioViagens?: string;
    idUsuarioSolicitante: number;
    nomeSolicitante: string;
    idNumericoSolicitacao: number;
    idFederacaoSolicitante: number;
    assinado: boolean;
    dataCriacao: Date;
    dataAlteracao?: Date;
    dataExclusao?: Date;
    excluido?: boolean;
    idUsuarioViajante: number;
}

export interface AnaliseSolicitacaoDiaria {
    idSolicitacaoDiariaAnalise: string;
    idStatus: number;
    status: string;
    idSolicitacaoDiaria: string;
    idUsuarioAnalise: number;
    nomeUsuarioAnalise: string;
    justificativa: string;
    dataAnalise: Date | string;
}

export interface AnaliseSolicitacaoDiariaRequest {
    idStatus: number;
    idSolicitacaoDiaria: string;
    idUsuarioAnalise: number;
    nomeUsuarioAnalise: string;
    justificativa: string;
}

export interface ResultadoSolicitacaoLocalidadeCoordenador {
    idSolicitacaoDiaria: string;
    nomeViajante: string;
    emailViajante: string;
    distanciaKm: number;
    numeroDiarias: number;
    valorUnitarioDiaria: number;
    valorTotal: number;
    finalidadeViagem: string;
    idUsuarioSolicitante: number;
    idNumericoSolicitacao: number;
    idFederacaoSolicitante: number;
    assinado: boolean;
    dataCriacao: Date;
    dataAlteracao?: Date;
    dataExclusao?: Date;
    excluido?: boolean;
    idUsuarioViajante: number;
    origemUf?: string;
    origemCidade?: string;
    destinoUf?: string;
    destinoCidade?: string;
    dataInicio: Date;
    dataFim: Date;
    //analise solicitação
    idSolicitacaoDiariaAnalise: string;
    idStatusSolicitacaoAnalise: number;
    statusSolicitacaoAnalise: string;
    justificativa: string;
    //analise solicitação relatório
    idRelatorioViagens?: string;
    idAvaliacaoRelatorio?: string;
    AvaliacaoRelatorio?: string;
    //texto
    idTextoHtml?: string;
    observacoesRelatorio?: string;
}