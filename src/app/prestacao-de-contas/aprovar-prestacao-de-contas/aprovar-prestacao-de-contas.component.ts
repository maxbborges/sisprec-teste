import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationService } from 'primeng/api';
import { Observable } from 'rxjs';
import { AprovarPrestacaoContas } from 'src/app/shared/models/commands/cmdPrestacaoDeContas';
import { BuscarPrestacaoContas, Indicador, PrestacaoContas, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';

// Message foi removido do primeng/api no PrimeNG 19 - interface local equivalente
export interface Message {
  severity?: string;
  summary?: string;
  detail?: string;
  id?: string;
  key?: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
  data?: any;
}

@Component({
  selector: 'app-aprovar-prestacao-de-contas',
  templateUrl: './aprovar-prestacao-de-contas.component.html',
  styleUrls: ['./aprovar-prestacao-de-contas.component.scss'],
  providers: [ConfirmationService],
  standalone: false
})
export class AprovarPrestacaoDeContasComponent implements OnInit {

  public listPrestacoesContas: PrestacaoContas[] = [];
  form: FormGroup;

  idsPrestacaoContas: string[] = [];
  usuario: Usuario;
  public prestacaoContasSelecionadas: string[] = [];
  statusPrestacaoContas: Observable<Indicador[]>;
  federacoes: Observable<Indicador[]>;
  aprovarPrestacoesContas: AprovarPrestacaoContas;
  msgs: Message[] = [];
  mensagemLista: string;

  desativarBotoes = true;

  public load = false;

  constructor(
    private apiIndicadorService: ApiIndicadorService,
    private fb: FormBuilder,
    private prestacaoContas: ApiPrestacaoContasService,
    private ngbModal: NgbModal,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {

    this.statusPrestacaoContas = this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('StatusPrestacaoContas');
    this.federacoes = this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('Federacao');

    if (localStorage.userSisprec) {
      this.usuario = JSON.parse(localStorage.userSisprec);
    }

    this.buscarPendentesAprovacao();

    this.form = this.fb.group({
      exercicio: '',
      idStatusAtualPrestacaoContas: '',
      versao: '',
      idFederacao: '',
    });

  }

  buscarPendentesAprovacao() {
    this.prestacaoContas
    .buscarTodosPrestacoesDeContaParaAprovacaoDiretoria(this.usuario.idTipoUsuario)
    .subscribe(data => {

      this.listPrestacoesContas = data;

      this.listPrestacoesContas = data.filter((item) => {
        return item.idPrestacaoContas != null;
      });
      this.mensagemLista = 'Não há nenhuma prestação de contas aguardando aprovação';

      this.load = false;
    });
  }

  podeAprovar(prestacao: any) {
    if (this.usuario.idTipoUsuario === 8) {
      return prestacao.disponivelParaAprovacaoDiretoriaAdjunta;
    } else if (this.usuario.idTipoUsuario === 7) {
      return prestacao.disponivelParaAprovacaoDiretoriaExecutiva;
    }
  }

  pesquisar() {
    this.load = true;
    const buscarPrestacaoContas: BuscarPrestacaoContas = this.form.value;
    this.prestacaoContas.buscarTodosPrestacoesContasPor(buscarPrestacaoContas).subscribe((data) => {

      this.listPrestacoesContas = data;

      this.listPrestacoesContas = data.filter((item) => {
        return item.idPrestacaoContas != null;
      });


      this.mensagemLista = 'Nenhum registro encontrado';

      this.load = false;
    });
  }

  aprovar() {

    this.confirmationService.confirm({
      message: 'Deseja aprovar as prestações de contas selecionadas?',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.aprovarPrestacoesContas = new AprovarPrestacaoContas();
        this.aprovarPrestacoesContas.idTipoPerfil = this.usuario.idTipoUsuario;
        this.aprovarPrestacoesContas.idUsuario = this.usuario.idUsuario;
        this.aprovarPrestacoesContas.prestacoesAprovadas = this.prestacaoContasSelecionadas;

        this.prestacaoContas.diretoriaAprovar(this.aprovarPrestacoesContas).subscribe((data) => {
          this.msgs = [{ severity: 'success', summary: 'Atenção', detail: 'As prestações de contas foram aprovadas' }];

          this.pesquisar();
        });
      }
    });



  }

  retornarParaAjustes() {

  }

  selecionarTodos(selecionado) {
    if (selecionado) {
      this.desativarBotoes = false;
      this.listPrestacoesContas.forEach(element => {
        if (this.podeAprovar(element)) {
          this.prestacaoContasSelecionadas.push(element.idPrestacaoContas);
        }
      });
    } else {
      this.prestacaoContasSelecionadas = [];
      this.desativarBotoes = true;
    }

    console.log(this.prestacaoContasSelecionadas);
  }

  selecionarPrestacao() {
    if (this.prestacaoContasSelecionadas.length > 0) {
      this.desativarBotoes = false;
    } else {
      this.desativarBotoes = true;
    }
  }

}
