import { Injectable } from "@angular/core";
import { TipoUsuario, Usuario } from "../models/responses/sisprec-response";

@Injectable()
export class SegurancaCheckService {
  constructor(
  ) {}

  verificaAcaoParaBloqueio = (usuario: Usuario) => TipoUsuario.Auditoria.toLocaleUpperCase() == usuario.tipoUsuarioSigla.toLocaleUpperCase();

}
