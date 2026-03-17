export interface InserirIndicador {
  nome: string;
  sigla: string;
  valor: string;
  idIndicadorTipo: number;
}

export interface AlterarIndicador {
  idIndicador: number;
  nome: string;
  sigla: string;
  valor: string;
  idIndicadorTipo: number;
}

export interface DesativarIndicador {
  idIndicador: number;
}
