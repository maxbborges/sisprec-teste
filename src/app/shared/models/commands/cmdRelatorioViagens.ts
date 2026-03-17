export interface InserirRelatorioViagens {
    idTextoHtml: string;
    idUsuarioCriacao: number;
    dataInicio: string;
    dataFim: string;
    idFederacao: number;
    participacaoColaboradores?: boolean;
    colaboradores?: string;
    informacoesAdicionais?: string;
    idSolicitacaoDiaria: string;
}

export interface EditarRelatorioViagens {
    idRelatorioViagens: string;
    idTextoHtml: string;
    idUsuarioAlteracao: number;
    dataInicio: string;
    dataFim: string;
    idFederacao: number;
    participacaoColaboradores?: boolean;
    colaboradores?: string;
    informacoesAdicionais?: string;
    idSolicitacaoDiaria: string;
}

export interface AnalisarRelatorioViagens {
    idRelatorioViagens: string;
    idAvaliacao: string;
    observacoes: string;
    idUsuarioAnalise: number;
}

export interface PesquisarRelatorioViagensTecnico {
    idUsuario: number;
    idFederacao: number;
    idStatus?: Array<number>;
    idNumerico?: number;
    dataInicio?: string;
    dataFim?: string;
}

export interface PesquisarRelatorioViagensCoordenador {
    nome?: string;
    email?: string;
    idFederacao: number;
    idStatus?: Array<number>;
    idNumerico?: number;
    dataInicio?: string;
    dataFim?: string;
}

export interface ListagemRelatorioViagens {
    idRelatorioViagens: string;
    idTextoHtml: string;
    idUsuarioCriacao: number;
    dataInicio: Date;        
    dataFim: Date;         
    idFederacao: number;
    federacao: string;
    dataCriacao: Date;     
    dataAlteracao?: Date;
    excluido: number;
    dataExclusao?: Date; 
    idNumerico: number;
    idRelatorioViagensAnalise?: string;
    idAvaliacao?: number;
    avaliacao: string;
    observacoes: string;
    idUsuarioAnalise?: number;
    dataAvaliacao?: Date; 
    nome: string;
    email: string;
    participacaoColaboradores: boolean;
    colaboradores?: string;
    informacoesAdicionais?: string;
    idSolicitacaoDiaria: string;
}

export interface HistoricoRelatorioViagens {
    idRelatorioViagensAnalise?: string;
    idRelatorioViagens: string;
    idAvaliacao?: number;
    avaliacao?: string;
    siglaAvaliacao?: string;
    observacoes: string;
    idUsuarioAnalise?: number;
    nome: string;
    email: string;      
    dataAvaliacao?: Date; 
}