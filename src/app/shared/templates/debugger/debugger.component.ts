import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-debugger',
  templateUrl: './debugger.component.html',
  styleUrls: ['./debugger.component.scss'],
  standalone: false
})
export class DebuggerComponent {
  exibirDebugger = environment.exibirDebugger;
}
