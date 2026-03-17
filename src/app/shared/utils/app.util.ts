export class AppUtil {

  static focalizarCampo(valor: string) {

    document.getElementById(valor).focus();

  }

  static severidade(nivel: string) {

    switch (nivel) {
      case 'a':
        return {
          cor: 'amarelo',
          icone: 'fas fa-exclamation'
        };
      case 'e':
        return {
          cor: 'vermelho',
          icone: 'fas fa-times'
        };
      case 'i':
        return {
          cor: 'ciano',
          icone: 'fas fa-info'
        };
      case 's':
        return {
          cor: 'verde',
          icone: 'fas fa-check'
        };
      default:
        return {
          cor: null,
          icone: null
        };
    }

  }

}
