export class DateUtils {
  static getDays(d1: Date, d2: Date) {
    let days = 0;

    if (d1 && d2) {
      const beginDate = new Date(d1.setHours(0, 0, 0, 0));
      const endDate = new Date(d2.setHours(0, 0, 0, 0));
      days = (endDate.valueOf() -
        beginDate.valueOf()) / (1000 * 60 * 60 * 24);
    }

    return Math.ceil(days);
  }

  static getAge(date) {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  static convertUTCDateToLocalDate(d) {
    const date = new Date(d);

    const newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

    const offset = date.getTimezoneOffset() / 60;
    const hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
  }

  // Compare two dates:
  //  -1 : if a < b
  //   0 : if a = b
  //   1 : if a > b
  static compare(a: Date, b: Date) {
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);

    return (Number(a > b) - Number(a < b));
  }

  static getMinutesBetweenDates(startDate, endDate) {
    const diff = endDate.getTime() - startDate.getTime();
    return (diff / 60000);
  }

  static format(date, format) {
    const data = new Date(date);

    function p(s) {
      return (s.toString().length < 2) ? '0' + s : s;
    }

    function get12HourHour(d: Date) {
      return (d.getHours() > 12) ? d.getHours() - 12 : (d.getHours() === 0) ? 12 : d.getHours();
    }

    function dayOfWeek(d: Date): any {
      const day = d.getDay();
      return isNaN(day) ? '' :
        ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][day];
    }

    function funcaoMes(d: Date): any {
      const month = d.getMonth();
      return isNaN(month) ? '' :
        ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
          'Agosto', 'Setembro', 'Outrubro', 'Novembro', 'Dezembro'][month];
    }

    return format ? format.replace(/dd?|HH?|hh?|mm?|MM?|ss?|yyyy?|DD?/g,
      f => {
        switch (f) {
          case 'd':
            return data.getDate();
          case 'dd':
            return p(data.getDate());
          case 'DD':
            return dayOfWeek(data);
          case 'H':
            return data.getHours();
          case 'HH':
            return p(data.getHours());
          case 'MM':
            return p(data.getMonth() + 1);
          case 'M':
            return funcaoMes(data);
          case 'h':
            return get12HourHour(data);
          case 'hh':
            return p(get12HourHour(data));
          case 'm':
            return data.getMinutes();
          case 'mm':
            return p(data.getMinutes());
          case 's':
            return data.getSeconds();
          case 'ss':
            return p(data.getSeconds());
          case 'yy':
            return data.getFullYear().toString().substr(-2);
          case 'yyyy':
            return data.getFullYear();
        }
      }
    ) : data.toString();
  }
}
