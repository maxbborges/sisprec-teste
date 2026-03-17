import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/shared/services/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
  standalone: false
})
export class LogoutComponent {
  public nomeSistema = environment.nomeSistema;

  constructor(
    private router: Router,
    private storage: StorageService,
    private location: Location
  ) {}

  sair() {
    this.storage.limparLocalStorage();
    this.router.navigate(['auth/login']);
  }

  cancelar() {
    this.location.back();
  }
}
