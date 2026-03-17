import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-div',
  templateUrl: './loading-div.component.html',
  styleUrls: ['./loading-div.component.scss'],
  standalone: false
})
export class LoadingDivComponent {
  @Input() mensagem = '';
}
