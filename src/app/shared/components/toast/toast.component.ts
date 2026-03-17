import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  standalone: false
})
export class ToastComponent implements OnInit {
  toasts$ = this.toastService.toasts$;

  constructor(public toastService: ToastService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
  }
}
