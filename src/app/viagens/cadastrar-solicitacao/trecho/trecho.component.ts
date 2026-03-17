import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { firstValueFrom, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Util } from "src/app/shared/helpers/util";
import { ApiSestSenatService } from "src/app/shared/services/api-sestsenat.service";

@Component({
  selector: "app-trecho",
  templateUrl: "./trecho.component.html",
  styleUrls: ["./trecho.component.scss"],
  standalone: false
})
export class TrechoViagemComponent implements OnInit {
    @Output() excluir: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
    @Input() trecho: FormGroup;
    @Input() posicao: number;
    @Input() podeExcluir: boolean;
    @Input() submited: boolean;

    public cidadesOrigem : Array<any> = [];
    public cidadesDestino : Array<any> = [];
    public ufs: Array<{uf: string, nome: string}> = Util.EstadosBrasil();

    private unsubscribe = new Subject<void>();

    constructor(private _apiSest: ApiSestSenatService){}

    async ngOnInit(){
        this.formListeners();

        //recuperar cidades para edição
        await this.recuperarCidades();
    }

    async recuperarCidades(){
        const origemUf = this.trecho.controls.origemUf.value;
        const destinoUf = this.trecho.controls.destinoUf.value;
        if(origemUf !== ''){
            const cidades = await firstValueFrom(this._apiSest.recuperarCidades(origemUf));
            this.cidadesOrigem = cidades.map(c => ({ value: c.nome, name: c.nome }));
        }

        if(destinoUf !== ''){
            const cidades = await firstValueFrom(this._apiSest.recuperarCidades(destinoUf));
            this.cidadesDestino = cidades.map(c => ({ value: c.nome, name: c.nome }));
        }
    }

    async formListeners(){
        this.trecho.controls.origemUf.valueChanges
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(async (v) => {
            if (v !== '') {
                const cidades = await firstValueFrom(this._apiSest.recuperarCidades(v));
                this.cidadesOrigem = cidades.map(c => ({ value: c.nome, name: c.nome }));
            } else {
                this.cidadesOrigem = [];
            }
        });

        this.trecho.controls.destinoUf.valueChanges
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(async (v) => {
            if (v !== '') {
                const cidades = await firstValueFrom(this._apiSest.recuperarCidades(v));
                this.cidadesDestino = cidades.map(c => ({ value: c.nome, name: c.nome }));
            } else {
                this.cidadesDestino = [];
            }
        });
    }

    excluirItem() {
        this.excluir.emit(this.trecho);
    }

    ngOnDestroy():void{
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }
}