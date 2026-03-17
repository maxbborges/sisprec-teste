import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario, Valor } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { ApiEstimativaDeCustoService } from 'src/app/shared/services/api-estimativa-de-custo.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-cadastrar-editar-valores',
  templateUrl: './cadastrar-editar-valores.component.html',
  styles: [],
  standalone: false
})
export class CadastrarEditarValoresComponent implements OnInit {

  form: FormGroup;
  valor: Valor;

  usuario: Usuario;
  idCadastro: string;
  acaoBloqueada: boolean = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiEstimativaDeCustoService,
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    private m: ModalService,
    private _segurancaService: SegurancaCheckService
  ) { }

  ngOnInit() {

    this.idCadastro = this.route.snapshot.params.idCadastro;

    this.usuario = this.storage.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuario);

    const itensSubitensValores: UntypedFormArray = this.fb.array([]);

    this.form = this.fb.group({
      itensSubitensValores
    });

    this.api.visualizarValres(this.idCadastro)
      .subscribe(x => {

        this.valor = x;

        x.itensSubitensValores.forEach(y => {
          const mesValor: UntypedFormArray = this.fb.array([]);
          y.mesesValores.forEach(z => {
            mesValor.push(
              this.fb.group({ idValor: z.idValor, mes: z.mes, valor: z.valor })
            );
          });
          itensSubitensValores.push(
            this.fb.group({
              idItemSubitem: y.idItemSubitem,
              nome: y.nome,
              total: y.total,
              mesesValores: mesValor
            })
          );
        });

      });

  }

  salvar() {

    this.m.confirm('Tem certeza que deseja salvar?').subscribe(resultado => {

      if (!resultado) {
        return;
      }

      this.form.disable();

      this.api.cadastrarEditarValores('Salvou Estimativa Custo',{
        idCadastro: this.idCadastro,
        idUsuario: this.usuario.idUsuario,
        itensSubitensValores: this.form.value.itensSubitensValores
      }).subscribe(
        () => {
          this.m.alert('Cadastrar / Editar Estimativa de Custo realizada com sucesso', 'Sucesso', 's');
          this.router.navigate(['/estimativaDeCusto/cadastrarValores']);
        },
        () => {
          this.m.alert('Ocorreu um erro. Tente novamente mais tarde.', 'Erro', 'e');
          this.form.enable();
        },
      );

    });

  }

  calcularValores(evento, itemSubitemValor, mesValor) {

    const idItemSubitem = itemSubitemValor.idItemSubitem;
    const mes = mesValor.mes;
    const valor = parseFloat(evento.target.value.replace(/[\.]/g, '').replace(/[\,]/g, '.'));

    const buscarIdItemSubitemPorMes = this.valor
      .itensSubitensValores.find(x => x.idItemSubitem === idItemSubitem)
      .mesesValores.find(y => y.mes === mes);

    buscarIdItemSubitemPorMes.valor = valor;

    let totaisMesesValores = 0;
    let total = 0;
    this.valor.itensSubitensValores.forEach(a => {
      let totais = 0;
      a.mesesValores.forEach(b => {
        totais += b.valor;
      });
      const filtrarMesValor = a.mesesValores.filter(c => c.mes === mes);
      filtrarMesValor.forEach(d => {
        totaisMesesValores += d.valor;
      });
      a.total = totais;
      total += totais;
    });
    const buscarMes = this.valor.totaisMesesValores.find(x => x.mes === mes);
    buscarMes.totalMes = totaisMesesValores;

    this.valor.total = total;

  }

  voltar() {

    this.m.confirm('Tem certeza que deseja cancelar a ação?').subscribe(resultado => {
      if (resultado) {
        this.router.navigate(['/estimativaDeCusto/cadastrarValores']);
      }
    });

  }

}
