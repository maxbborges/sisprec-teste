export interface ListarItensLancamentoFiltrado {
    idTipoLancamento: number;
    anoExercicio: number;
}

export interface ListarLancamentoSaidaItem {
    idFederacao: number;
    ano: string;
    mes: string;
}
 export interface AlterarMotivoLancamento{
    idPrestacaoContaSaidaItem: number;
    idLancamento: string;
    idMotivos?: number[];
    idUsuario: number;
 }
