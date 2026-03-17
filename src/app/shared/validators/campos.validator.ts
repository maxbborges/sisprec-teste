import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CamposValidator {

  static iguais(primeiroCampo: string, segundoCampo: string): ValidatorFn {

    return (ac: AbstractControl): ValidationErrors | null => {

      return ac.get(primeiroCampo).value === ac.get(segundoCampo).value ? null : { camposIguais: `${primeiroCampo}===${segundoCampo}` };

    };

  }

  static diferentes(primeiroCampo: string, segundoCampo: string): ValidatorFn {

    return (ac: AbstractControl): ValidationErrors | null => {

      return ac.get(primeiroCampo).value !== ac.get(segundoCampo).value ? null : { camposDiferentes: `${primeiroCampo}!==${segundoCampo}` };

    };

  }

}
