import packageJson from '../../package.json';

export const environment = {
  production: true,
  VERSAO: `${packageJson.version}.hom`,
  nomeSistema: 'SISPREC',
  exibirDebugger: false,
  urlApiSisprec: 'https://sisprechom.sestsenat.org.br/api/',
  urlApiSestsenat: "https://api.sestsenat.org.br/",
  nomeStorageUsuario: 'userSisprec',
  idPerfilDesenvolvedor: 35,
  idsPerfisDex: [5, 6, 35],
  idPerfilGestorFiscal: 5,
  idPerfilConferenciaDoc: 6,
  idPerfilTipoAuditoria: 4123
};
