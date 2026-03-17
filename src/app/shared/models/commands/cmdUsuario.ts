export interface InserirUsuario {
  nome: string;
  email: string;
  senha: string;
  idTipoUsuario: number;
  idFiliacao?: number;
  idUsuarioCadastro: number;
}

export interface AlterarUsuario {
  idUsuario: number;
  nome: string;
  email: string;
  senha?: string;
  idFiliacao?: number;
  idTipoUsuario: number;
  idUsuarioAlteracao: number;
}

export interface AlterarSenhaUsuario {
  idUsuario: number;
  senhaAtual: string;
  novaSenha: string;
  novaSenhaConfirmacao: string;
}

export interface LoginUsuario {
  usuario: string;
  senha: string;
}

export interface ResetarSenhaUsuario {
  idUsuario: number;
  novaSenha: string;
}

export interface RecuperarSenhaUsuario {
  email: string;
}

export interface DesativarUsuario {
  idUsuario: number;
  idUsuarioDesativacao: number;
}

export interface Token {
  chave: string;
  nomeSistema: string;
}
