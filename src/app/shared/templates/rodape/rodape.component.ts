import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-rodape',
  templateUrl: './rodape.component.html',
  styleUrls: ['./rodape.component.scss'],
  standalone: false
})
export class RodapeComponent {
  public versao = environment.VERSAO;
  public ano = (new Date()).getFullYear().toString();
}
