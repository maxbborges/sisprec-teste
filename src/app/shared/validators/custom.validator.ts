import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Util } from '../helpers/util';

export class CustomValidator {
  static NegativeNumberValidator(control: FormControl) {
    const value: number = control.value.toString().replace(/[^0-9]/g, '');

    if (value < 0) {
      return { 'Número inválido': true };
    }

    return null;
  }

  static CepValidator(control: FormControl) {
    if (!Util.isCep(control.value)) {
      return { 'CEP inválido': true };
    }

    return null;
  }

  static SelectValidator(control: FormControl) {
    const value: number = control.value.toString();

    if (value === 0) {
      return { 'Selecione uma opção.': true };
    }

    return null;
  }

  static EmailValidator(control: FormControl) {
    // tslint:disable-next-line:max-line-length
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(control.value)) {
      return { 'E-mail inválido': true };
    }

    return null;
  }

  static TelefoneValidator(control: FormControl) {
    if (!Util.isTelefone(control.value)) {
      return { 'Telefone inválido': true };
    }

    return null;
  }

  static CNPJValidator(control: FormControl) {
    if (!Util.isCnpj(control.value)) {
      return { 'CNPJ inválido': true };
    }

    return null;
  }

  static CpfValidator(control: FormControl) {
    if (!Util.isCpf(control.value)) {
      return { 'CPF inválido': true };
    }

    return null;
  }

  static nomeNaoPermitido(nome: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if(control.value == null)
        return null
      const naoPermitido = nome.toLowerCase() == (control.value).toLowerCase();
      return naoPermitido ? {nomeNaoPermitido: {value: control.value}} : null;
    };
  }
}
