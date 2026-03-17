import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
    private _toasts$ = new BehaviorSubject<{ message: string; severity: string }[]>([]);
    readonly toasts$ = this._toasts$.asObservable();

    add(message: { message: string; severity: string }) {
        const current = this._toasts$.value;
        const updated = [...current, message];
        setTimeout(() => this._toasts$.next(updated));
        this.fadeLater(updated,message);
    }

    remove(index: number) {
        const current = this._toasts$.value;
        setTimeout(() => this._toasts$.next(current.filter((_, i) => i !== index)));
    }

    private fadeLater(arrayUpdated: Array<any>, valueAdded:any) {
        setTimeout(() => {
            const elIndex = arrayUpdated.indexOf(valueAdded);
            const currentToast = document.querySelectorAll('.toast')[elIndex];
            if (currentToast) {
                currentToast.classList.add('fade-out');
                setTimeout(() => this.remove(elIndex), 500);
            } else {
            this.remove(elIndex);
            }
        }, 5000);
    }
}