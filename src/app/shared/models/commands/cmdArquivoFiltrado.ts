export interface ListarArquivosFiltrado {
  ano: number;
  mes: number;
  idFederacaoDono: number;
  idCategoria: string;
  idCategoriaItem: string;
}

export interface ListarArquivos{
  idDespesa: number;
  idArquivos: string[];
}