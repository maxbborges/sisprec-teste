import packageJson from '../../package.json';

// PORTA
const porta = '34609';

// DEV
//const urlApiSisprec = `http://localhost:${porta}/`;


// HOM
const urlApiSisprec = `https://sisprechom.sestsenat.org.br/api/`;

// PROD
// const urlApiSisprec = `https://sisprec.sestsenat.org.br/api/`;

export const environment = {
  production: false,
  VERSAO: `${packageJson.version}.des`,
  nomeSistema: 'SISPREC',
  exibirDebugger: false,
  urlApiSisprec,
  urlApiSestsenat: "https://api.sestsenat.org.br/",
  nomeStorageUsuario: 'userSisprec',
  idPerfilDesenvolvedor: 35,
  idsPerfisDex: [5, 6, 35],
  idPerfilGestorFiscal: 5,
  idPerfilConferenciaDoc: 6,
  idPerfilTipoAuditoria: 4123
};
