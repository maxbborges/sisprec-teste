import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemSubitem, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiEstimativaDeCustoService } from 'src/app/shared/services/api-estimativa-de-custo.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-cadastrar-item-e-subitem',
  templateUrl: './cadastrar-item-e-subitem.component.html',
  styles: [],
  standalone: false
})
export class CadastrarItemESubitemComponent implements OnInit {

  anoExercicio: number;
  form: FormGroup;
  enviando = false;
  itens: ItemSubitem[];
  subitens: ItemSubitem[];
  usuario: Usuario;
  acaoBloqueada: boolean = false;

  constructor(
    private apiEstimativaDeCusto: ApiEstimativaDeCustoService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit() {

    this.anoExercicio = parseInt(this.route.snapshot.params.anoExercicio, 10);

    this.usuario = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);

    this.form = this.fb.group({
      radioItemSubitem: 'item',
      anoExercicio: this.anoExercicio,
      codigoItem: ['', [Validators.required, Validators.min(1)]],
      codigoSubitem: 0,
      nome: ['', Validators.required]
    });

    this.apiEstimativaDeCusto.listarItem(this.anoExercicio)
      .subscribe(
        x => {
          this.itens = x;
          x.length === 0 ? this.c.radioItemSubitem.disable() : this.c.radioItemSubitem.enable();
        }
      );

  }

  get c() {

    return this.form.controls;

  }

  salvar() {

    this.enviando = true;

    if (this.form.invalid) {
      alert('Campo obrigatório não preenchido ou campo inválido.');
      return;
    }

    if (!confirm('Tem certeza que deseja salvar?')) {
      return;
    }

    this.apiEstimativaDeCusto
      .existirItemSubitem(this.form.value)
      .subscribe(
        x => {
          if (x) {
            alert(`Esta numeração já está sendo usada por outro ${this.c.radioItemSubitem.value === 'item' ? 'item' : 'subitem'}.`);
            return;
          }
          this.cadastrar();
        },
        () => {
          alert('Ocorreu um erro. Tente novamente mais tarde.');
          return;
        }
      );

  }

  resetForm(itemOuSubitem: string) {

    this.enviando = false;

    this.subitens = [];

    this.form = this.fb.group({
      radioItemSubitem: itemOuSubitem,
      anoExercicio: this.anoExercicio,
      codigoItem: ['', Validators.required],
      codigoSubitem: itemOuSubitem === 'item' ? 0 : ['', [Validators.required, Validators.min(1)]],
      nome: ['', Validators.required]
    });

  }

  selecionarItem() {

    if (this.c.codigoItem.value) {
      this.apiEstimativaDeCusto.listarSubitem(this.anoExercicio, this.c.codigoItem.value)
      .subscribe(x => this.subitens = x);
    } else {
      this.subitens = [];
    }

  }

  cadastrar() {

    this.apiEstimativaDeCusto
      .inserirItemSubitem(this.form.value)
      .subscribe(
        x => {
          if (x) {
            alert('Cadastrado com sucesso.');
            this.router.navigate(['/estimativaDeCusto/manter', this.anoExercicio, 'listar']);
          } else {
            this.enviando = false;
            alert('Ocorreu um erro. Tente novamente mais tarde.');
          }
        },
        () => {
          this.enviando = false;
          alert('Ocorreu um erro. Tente novamente mais tarde.');
        }
      );

  }

}
