import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { ListagemRelatorioViagens, PesquisarRelatorioViagensCoordenador } from '../models/commands/cmdRelatorioViagens';
import { ApiIndicadorService } from '../services/api-indicador.service';
import { ApiRelatorioViagensService } from '../services/api-relatorio-viagens.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-modal-pesquisa-relatorio-viagens',
  templateUrl: './modal-pesquisa-relatorio-viagens.component.html',
  styleUrls: ['./modal-pesquisa-relatorio-viagens.component.scss'],
  standalone: false
})
export class ModalPesquisaRelatorioViagensComponent implements OnInit {

  @Output() retorno: EventEmitter<ListagemRelatorioViagens> = new EventEmitter<ListagemRelatorioViagens>();

  public lstRelatorioViagens: ListagemRelatorioViagens[];
  public formPesquisa: FormGroup;
  private usuario: Usuario;
  private aprovado: Indicador;

  constructor(
    private formBuilder: FormBuilder,
    private ngbActiveModal: NgbActiveModal,
    private relatorioViagensService: ApiRelatorioViagensService,
    private storage: StorageService,
    private apiIndicadorService: ApiIndicadorService
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.usuario = this.storage.getUsuarioLogado();
    this.recuperarStatus();
  }

  inicializarFormulario() {
    this.formPesquisa = this.formBuilder.group({
      nome: [''],
      email: [''],
      dataInicio: [''],
      dataFim: [''],
    });
  }

  recuperarStatus(){
    this.apiIndicadorService
          .listarTodosIndicadoresPorTipoSigla("StatusRelatorioViagens")
          .subscribe((x) => {
            this.aprovado = x.filter((v) => {
               return v.sigla === "AprovadoRelatorio";
            })[0];

            this.pesquisarRelatorio()
          });
  }

  pesquisarRelatorio() {

    const filtros:  PesquisarRelatorioViagensCoordenador = this.formPesquisa.value;
    filtros.idFederacao = this.usuario.idFiliacao;
    filtros.idStatus = [this.aprovado.idIndicador];

    this.relatorioViagensService.pesquisarRelatorioViagensCoordenador(filtros).subscribe(
      result => {
        if (result == null) {
          alert('Nenhum relatório encontrado com o(s) filtro(s) utilizado(s).');
          return;
        }
        console.log(result);
        this.lstRelatorioViagens = result;
      }
    );

  }

  cancelar() {
    this.ngbActiveModal.dismiss();
  }

  selecionarRelatorio(relatorioViagens: ListagemRelatorioViagens) {
    this.retorno.emit(relatorioViagens);
    this.ngbActiveModal.dismiss();
  }

}
