export class Util {

  static mes(mes: number) {


    switch (mes) {
      case 1: return 'Janeiro';
      case 2: return 'Fevereiro';
      case 3: return 'Março';
      case 4: return 'Abril';
      case 5: return 'Maio';
      case 6: return 'Junho';
      case 7: return 'Julho';
      case 8: return 'Agosto';
      case 9: return 'Setembro';
      case 10: return 'Outubro';
      case 11: return 'Novembro';
      case 12: return 'Dezembro';
    }

    return '--';
  }
  static isNullOrEmptyOrUndefined(objeto): boolean {
    return (
      objeto === null ||
      objeto === 'null' ||
      objeto === undefined ||
      objeto === ''
    );
  }

  static calculaDiferencaMilissegundos(
    dataPosterior: Date,
    dataAnterior: Date
  ): number {
    return Math.abs(dataPosterior.getTime() - dataAnterior.getTime());
  }

  static calculaDiferencaSegundos(
    dataPosterior: Date,
    dataAnterior: Date
  ): number {
    const timeDiffMilissegundos = Util.calculaDiferencaMilissegundos(
      dataPosterior,
      dataAnterior
    );
    return Math.ceil(timeDiffMilissegundos / 1000);
  }

  static calculaDiferencaMinutos(
    dataPosterior: Date,
    dataAnterior: Date
  ): number {
    const timeDiffSegundos = Util.calculaDiferencaSegundos(
      dataPosterior,
      dataAnterior
    );
    return Math.ceil(timeDiffSegundos / 60);
  }

  static calculaDiferencaHoras(
    dataPosterior: Date,
    dataAnterior: Date
  ): number {
    const timeDiffMinutos = Util.calculaDiferencaMinutos(
      dataPosterior,
      dataAnterior
    );
    return Math.ceil(timeDiffMinutos / 60);
  }

  static calculaDiferencaDias(dataPosterior: Date, dataAnterior: Date): number {
    const timeDiffHoras = Util.calculaDiferencaHoras(
      dataPosterior,
      dataAnterior
    );
    return Math.ceil(timeDiffHoras / 24);
  }

  static retiraCaracteresEspeciais(texto) {
    if (Util.isNullOrEmptyOrUndefined(texto)) {
      return '';
    }
    return texto.replace(/[^0-9]/g, '');
  }

  static limpaCpf(cpf: string): string {
    if (Util.isNullOrEmptyOrUndefined(cpf)) {
      return '';
    }
    return cpf.replace(/[^0-9]/g, '');
  }

  static formatAsCpf(cnpjLimpo) {
    if (Util.isNullOrEmptyOrUndefined(cnpjLimpo)) {
      return '';
    }
    return cnpjLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  static isCpf(cpf: string): boolean {
    if (Util.isNullOrEmptyOrUndefined(cpf)) {
      return false;
    }

    cpf = cpf.replace(/[^\d]+/g, '');

    if (cpf.length !== 11) {
      return false;
    }

    let soma;
    let resto;
    soma = 0;
    if (cpf === '00000000000') {
      return false;
    }

    for (let i = 1; i <= 9; i++) {
      soma = soma + parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
    }
    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
      resto = 0;
    }
    if (resto !== parseInt(cpf.substring(9, 10), 10)) {
      return false;
    }

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma = soma + parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
    }
    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
      resto = 0;
    }

    if (resto !== parseInt(cpf.substring(10, 11), 10)) {
      return false;
    }

    return true;
  }

  static limpaCnpj(cnpj: string): string {
    if (Util.isNullOrEmptyOrUndefined(cnpj)) {
      return '';
    }
    return cnpj.replace(/[^0-9]/g, '');
  }

  static formatAsCnpj(cpfLimpo) {
    if (Util.isNullOrEmptyOrUndefined(cpfLimpo)) {
      return '';
    }
    return cpfLimpo.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  }

  static isCnpj(cnpj: string): boolean {
    if (Util.isNullOrEmptyOrUndefined(cnpj)) {
      return false;
    }

    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj.length !== 14) {
      return false;
    }

    // Elimina CNPJs invalidos conhecidos
    if (
      cnpj === '00000000000000' ||
      cnpj === '11111111111111' ||
      cnpj === '22222222222222' ||
      cnpj === '33333333333333' ||
      cnpj === '44444444444444' ||
      cnpj === '55555555555555' ||
      cnpj === '66666666666666' ||
      cnpj === '77777777777777' ||
      cnpj === '88888888888888' ||
      cnpj === '99999999999999'
    ) {
      return false;
    }

    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += +numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== +digitos.charAt(0)) {
      return false;
    }

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += +numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== +digitos.charAt(1)) {
      return false;
    }

    return true;
  }

  static limpaCep(cep: string): string {
    if (Util.isNullOrEmptyOrUndefined(cep)) {
      return '';
    }
    return cep.replace(/[^0-9]/g, '');
  }

  static formatAsCep(cepLimpo) {
    if (Util.isNullOrEmptyOrUndefined(cepLimpo)) {
      return '';
    }
    return cepLimpo.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2-$3');
  }

  static isCep(cep: string) {
    if (Util.isNullOrEmptyOrUndefined(cep)) {
      return false;
    }

    cep = cep.replace(/[^\d]+/g, '');
    if (cep.length !== 8) {
      return false;
    }

    const exp = /^[0-9]{8}$/;
    if (!exp.test(cep)) {
      return false;
    }

    return true;
  }

  static isTelefone(telefone: string) {
    if (Util.isNullOrEmptyOrUndefined(telefone)) {
      return false;
    }

    const exp1 = /\(\d{2}\)\ \d{4}\-\d{4}/;
    const exp2 = /\(\d{2}\)\ \d{5}\-\d{4}/;
    const exp5 = /\(\d{2}\)\d{4}\-\d{4}/;
    const exp6 = /\(\d{2}\)\d{5}\-\d{4}/;
    const exp7 = /\(\d{2}\)\ \d{8}/;
    const exp8 = /\(\d{2}\)\ \d{9}/;
    const exp9 = /\(\d{2}\)\d{8}/;
    const exp10 = /\(\d{2}\)\d{9}/;
    const exp3 = /^[0-9]{10}$/;
    const exp4 = /^[0-9]{11}$/;
    if (
      !exp1.test(telefone) &&
      !exp2.test(telefone) &&
      !exp3.test(telefone) &&
      !exp4.test(telefone) &&
      !exp5.test(telefone) &&
      !exp6.test(telefone) &&
      !exp7.test(telefone) &&
      !exp8.test(telefone) &&
      !exp9.test(telefone) &&
      !exp10.test(telefone)
    ) {
      return false;
    }

    const telefoneLimpo = telefone.replace(/[^\d]+/g, '');
    if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
      return false;
    }

    return true;
  }

  static formatStringDate(date: string) {
    // '2018-06-17T00:00:00-03:00'
    const ano = date.split('-')[0];
    const mes = date.split('-')[1];
    const dia = date.split('-')[2].substring(0, 2);
    return dia  + '/' + mes + '/' + ano;
  }
  static formatStringDate10Digitos(date: string) {
    if(date == null) return null;
      console.log(date);
      // '2018-06-17T00:00:00-03:00'
      try{
        const ano = date.split('-')[0];
        const mes = date.split('-')[1];
        const dia = date.split('-')[2].substring(0, 2);
        return ano  + '-' + mes + '-' + dia;
      }catch{
        return null;
      }
  }
  static digitosBancarios(): string[]{
    return [
      "Sem Dígito",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "X"
    ]
  }
  static tipoContaBancaria(): string[]{
    return [
      "Poupança",
      "Corrente"
    ]
  }

  static EstadosBrasil(): Array<{uf: string, nome: string}> {
    return [
      { uf: 'AC', nome: 'Acre' },
      { uf: 'AL', nome: 'Alagoas' },
      { uf: 'AP', nome: 'Amapá' },
      { uf: 'AM', nome: 'Amazonas' },
      { uf: 'BA', nome: 'Bahia' },
      { uf: 'CE', nome: 'Ceará' },
      { uf: 'DF', nome: 'Distrito Federal' },
      { uf: 'ES', nome: 'Espirito Santo' },
      { uf: 'GO', nome: 'Goiás' },
      { uf: 'MA', nome: 'Maranhão' },
      { uf: 'MS', nome: 'Mato Grosso do Sul' },
      { uf: 'MT', nome: 'Mato Grosso' },
      { uf: 'MG', nome: 'Minas Gerais' },
      { uf: 'PA', nome: 'Pará' },
      { uf: 'PB', nome: 'Paraíba' },
      { uf: 'PR', nome: 'Paraná' },
      { uf: 'PE', nome: 'Pernambuco' },
      { uf: 'PI', nome: 'Piauí' },
      { uf: 'RJ', nome: 'Rio de Janeiro' },
      { uf: 'RN', nome: 'Rio Grande do Norte' },
      { uf: 'RS', nome: 'Rio Grande do Sul' },
      { uf: 'RO', nome: 'Rondônia' },
      { uf: 'RR', nome: 'Roraima' },
      { uf: 'SC', nome: 'Santa Catarina' },
      { uf: 'SP', nome: 'São Paulo' },
      { uf: 'SE', nome: 'Sergipe' },
      { uf: 'TO', nome: 'Tocantins' }
    ]
  }
}
