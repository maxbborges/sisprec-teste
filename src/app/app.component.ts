import { Component } from '@angular/core';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false
})
export class AppComponent {

  constructor(ngbModalConfig: NgbModalConfig) {

    ngbModalConfig.backdrop = 'static';
    ngbModalConfig.centered = true;
    ngbModalConfig.keyboard = false;

  }

}
