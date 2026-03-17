export interface InserirTextoHtml {
    textoHtml: string;
    idUsuario: number;
    email: string;
    assinadoTermo: boolean;
}

export interface EditarTextoHtml {
    idTextoHtml: string;
    textoHtml: string;
    idUsuario: number;
    email: string;
    assinadoTermo: boolean;
}