import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.org.sestsenat.sisprec',
  appName: 'sisprec-despoluir',
  webDir: 'dist',

  // Configurações do Servidor
  server: {
    // ⚠️ DESATIVAR PARA PRODUÇÃO (Comente ou remova a linha abaixo)
    // 'url' é usado para o Live Reload apontando para o servidor de desenvolvimento.
    // Se deixado na versão final, o app ficará em tela branca ao não encontrar o servidor local dev!
    // url: 'http://192.168.0.9:4200',

    // ⚠️ DESATIVAR PARA PRODUÇÃO (Mude para false ou remova)
    // Permite conexões HTTP (sem SSL). Requerido apenas se seu servidor dev local usar HTTP.
    // Lojas como a App Store e Google Play podem rejeitar apps que permitem cleartext sem justificativa.
    // cleartext: true,
  },

  // Configuração de Logs Nativo
  // ⚠️ DESATIVAR PARA PRODUÇÃO (Altere para 'none' ou remova)
  // Evita poluição de informações sensíveis no Logcat do Android Studio ou Console do Xcode em produção.
  loggingBehavior: 'debug', // Valores possíveis: 'none' | 'debug' | 'production'

  // Exemplo de configurações de Plugins (Mantenha o que usar no projeto)
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
    },
    Keyboard: {
      resizeOnFullScreen: true,
    }
  }
};

export default config;
