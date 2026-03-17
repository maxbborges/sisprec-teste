import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemSubitem, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiEstimativaDeCustoService } from 'src/app/shared/services/api-estimativa-de-custo.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-editar-item-e-subitem',
  templateUrl: './editar-item-e-subitem.component.html',
  styles: [],
  standalone: false
})
export class EditarItemESubitemComponent implements OnInit {

  anoExercicio: number;
  form: FormGroup;
  enviando = false;
  itens: ItemSubitem[];
  subitens: ItemSubitem[];
  idItemSubitem: string;
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
    this.idItemSubitem = this.route.snapshot.params.idItemSubitem;

    this.usuario = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);

    this.form = this.fb.group({
      idItemSubitem: '',
      anoExercicio: '',
      codigoItem: ['', [Validators.required, Validators.min(1)]],
      codigoSubitem: '',
      nome: ['', Validators.required]
    });

    this.apiEstimativaDeCusto
      .detalharItem(this.idItemSubitem)
      .subscribe(x => {

        this.form.patchValue(x);

        this.apiEstimativaDeCusto.listarItem(x.anoExercicio)
          .subscribe(itens => this.itens = itens);

        if (x.codigoSubitem !== 0) {
          this.c.codigoSubitem.setValidators([Validators.required, Validators.min(1)]);
          this.apiEstimativaDeCusto.listarSubitem(x.anoExercicio, x.codigoItem)
            .subscribe(subitens => this.subitens = subitens);
        }

      });

  }

  get c() {

    return this.form.controls;

  }

  selecionarItem() {

    if (parseInt(this.c.codigoItem.value, 10)) {
      this.apiEstimativaDeCusto.listarSubitem(this.anoExercicio, parseInt(this.c.codigoItem.value, 10))
        .subscribe(x => this.subitens = x);
    } else {
      this.subitens = [];
    }

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
          this.apiEstimativaDeCusto.detalharItem(this.idItemSubitem)
            .subscribe(y => {
              if (
                x
                && !(y.codigoItem === parseInt(this.c.codigoItem.value, 10)
                  && y.codigoSubitem === parseInt(this.c.codigoSubitem.value, 10))
              ) {
                const itemOuSubitem = parseInt(this.c.codigoSubitem.value, 10) === 0 ? 'item' : 'subitem';
                alert(`Esta numeração já está sendo usada por outro ${itemOuSubitem}.`);
                return;
              }
              this.apiEstimativaDeCusto
                .listarSubitem(y.anoExercicio, y.codigoItem)
                .subscribe(
                  z => {
                    if (
                      z.length > 0
                      && parseInt(this.c.codigoSubitem.value, 10) === 0
                      && !(y.codigoItem === parseInt(this.c.codigoItem.value, 10)
                        && y.codigoSubitem === parseInt(this.c.codigoSubitem.value, 10))
                    ) {
                      alert('Não pode editar este item porque ele está Vinculando com os subitens cadastrados.');
                      this.c.codigoItem.setValue(y.codigoItem);
                      return;
                    }
                    this.editar();
                  });
            },
              () => {
                alert('Ocorreu um erro. Tente novamente mais tarde.');
                return;
              }
            );
        });

  }

  editar() {

    this.apiEstimativaDeCusto
      .editarItemSubitem(this.form.value)
      .subscribe(
        x => {
          if (x) {
            alert('Editado com sucesso.');
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
