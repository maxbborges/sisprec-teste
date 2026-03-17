import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Util } from 'src/app/shared/helpers/util';
import { Banco, Colaborador, Indicador, Usuario } from 'src/app/shared/models/responses/sisprec-response';
import { SegurancaCheckService } from 'src/app/shared/seguranca/seguranca-check-service';
import { AlertService, tipo } from 'src/app/shared/services/alert.service';
import { ApiColaboradorService } from 'src/app/shared/services/api-colaborador.service';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({ templateUrl: './relatorio-colaboradores.component.html',
  standalone: false
})
export class RelatorioColaboradoresComponent implements OnInit {
  public lstFederacoes: Indicador[] = [];
  public filtroFederacao: number = 0;
  public filtroFederacaoNome: string = "";
  public disableFederacoes = true;

  public lstColaboradores: Colaborador[] = [];
  public usuarioLogado: Usuario;
  acaoBloqueada: boolean = false;

  public formCadastro: FormGroup;
  public lstBancos: Banco[] = [];
  
  constructor(
    private formBuilder: FormBuilder,
    private excelService: ExcelService,
    private apiIndicadorService: ApiIndicadorService,
    private apiColaborador: ApiColaboradorService,
    private storageService: StorageService,
    private alertService: AlertService,
    private _segurancaService: SegurancaCheckService,
    private _modal: ModalService,
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.storageService.getUsuarioLogado();
    this.acaoBloqueada = this._segurancaService.verificaAcaoParaBloqueio(this.usuarioLogado);
    this.inicializarFormulario();
    this.carregarListaFederacoes();
    this.filtroFederacao = this.usuarioLogado.idFiliacao;
    this.listarColaboradores(this.filtroFederacao);
    if(['UsuarioFederacao', 'UsuarioPresidente'].includes(this.usuarioLogado.tipoUsuarioSigla)){
        this.formCadastro.controls.idFederacao.disable();
        this.formCadastro.get('idFederacao').updateValueAndValidity();
    }
    this.carregarListaBancos();
  }
  
  inicializarFormulario() {
    this.formCadastro = this.formBuilder.group({      
      idFederacao: ['', [Validators.required]]      
    });    
  }
  carregarListaBancos() {
    this.apiColaborador.pesquisarBancos().subscribe((data) => {
      this.lstBancos = data;
    });
  }
  carregarListaFederacoes() {
    if (['UsuarioFederacao', 'UsuarioPresidente'].includes(this.usuarioLogado.tipoUsuarioSigla)) {
      this.apiIndicadorService
        .buscarIndicadorPorId(this.usuarioLogado.idFiliacao)
        .subscribe((federacao) => {
          this.lstFederacoes.push(federacao);

          console.log(this.lstFederacoes);

      }, (error) => {
        console.log('Erro ao carregar lista de federações:');
        console.log(error);
      });
    } else {
      this.apiIndicadorService.listarTodosIndicadoresPorTipoSigla('Federacao').subscribe((lstFederacoes) => {
        this.lstFederacoes.push(
          {
              idIndicador: 0,
              nome: null,
              sigla: 'Todas',
              valor: null,
              idIndicadorTipo: null,
              indicadorTipo: null,
              ativo: null
        });
        let siglas = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < lstFederacoes.length; i++) { siglas.push(lstFederacoes[i].sigla); }
        siglas = siglas.sort();
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < siglas.length; i++) {
          const obj = lstFederacoes.filter(
            item => {
              return item.sigla === siglas[i];
            });
          // tslint:disable-next-line: align
          this.lstFederacoes.push(obj[0]);
        }

        const userSisprec = JSON.parse(localStorage.getItem('userSisprec'));
        // seta a federação do usuário
        this.filtroFederacao = userSisprec.idFiliacao;
        this.disableFederacoes = false;

      }, (error) => {
        console.log('Erro ao carregar lista de federações:');
        console.log(error);
      });
    }
  }

  listarColaboradores(idFiliacao) {
    this.apiColaborador.listarTodosColaboradores(idFiliacao).subscribe(
      lstColaboradores => {
        this.lstColaboradores = lstColaboradores;
      },
      error => {
        console.log('Erro ao carregar lista de colaboradores:');
        console.log(error);
      }
    );
  }



  excluir(id) {
    console.log("Excluindo lançamento:");

    let resultado$ = this.alertService.exibirConfirmacaoAlerta(
      "Tem certeza de que deseja deletar este colaborador?",
      tipo.atencao
    );
    resultado$.subscribe((resultado) => {
      if (resultado) {
        const obj = {
          idColaborador: id,
          idUsuarioDesativacao: this.usuarioLogado.idUsuario,
        };

        this.apiColaborador.desativarColaborador(obj).subscribe(
          (retorno) => {
            if (retorno) {
              this._modal.alert(
                "Colaborador deletado com sucesso.","Sucesso","s"
              );
              this.listarColaboradores(this.filtroFederacao);
            } else {
              this._modal.alert(
                "Ocorreu um erro ao deletar este Colaborador.","Erro","e"
              );
            }
          },
          (error) => {
            console.log("Erro ao deletar Colaborador:", error);
            var msg = (typeof error.error === 'string' ? error.error : '').toLowerCase();
            if (msg.indexOf('despesa') !== -1) {
              this._modal.alert(
                "Não é possível excluir este colaborador pois existem despesas vinculadas a ele.","Erro","e"
              );
            } else {
              this._modal.alert(
                "Ocorreu um erro ao deletar este Colaborador.","Erro","e"
              );
            }
          }
        );
      }
    });
  }
  onChangeFederacao(event){
    const idFiliacao = event.target.value;
    this.filtroFederacao = idFiliacao
    this.listarColaboradores(this.filtroFederacao);
  }
  exportarClick() {    
      var lista: any[] = [];
      try{
        if(this.lstColaboradores.length == 0 ) return; //abortar lista vazia
        this.lstFederacoes.forEach((element) => {
            if(element.idIndicador.toString().toUpperCase() == this.filtroFederacao.toString().toUpperCase()){
                lista.push(element);
            }
        });
        this.filtroFederacaoNome = lista[0].sigla;   
    
    var listaExcel: any[] = [];
    this.lstColaboradores.forEach(element => {     

      let dataN = '';
      let dataA = '';
      let dataD = '';
      let banco = '';
      this.lstBancos.forEach((x) => {
        if(x.idBanco == element.idBanco) banco = x.titulo;
      })
        if(element.dataNascimento != null) {          
          dataN = Util.formatStringDate(element.dataNascimento+'');
        }
        if(element.dataAdmissao != null) {
          dataA = Util.formatStringDate(element.dataAdmissao+'');
        }
        if(element.dataDesligamento != null) {
          dataD = Util.formatStringDate(element.dataDesligamento+'');
        }

        listaExcel.push({
            Federacao: this.filtroFederacaoNome,
            CNPJ_CPF: element.numeroDocumento,
            Pessoa: element.tipoColaborador,
            Colaborador: element.nome,
            Telefone: element.telefone,
            Email: element.email,
            Nascimento: dataN,
            Rg: element.rg,
            PlacaVeiculo: element.placaVeiculo,
            Endereço: element.enderecoLocacao,
            DataAdmissao: dataA,
            DataDesligamento: dataD,
            'Colaborador Exclusivo': element.isExclusividade ? 'Sim' : 'Não',
            Banco: banco,
            Agencia: element.agencia,
            ADigito: element.agenciaDigito,
            Conta: element.conta,
            CDigito: element.contaDigito,
            Tipo: element.tipoConta,
            Variação: element.variacaoConta
        })
    });
    this.excelService.exportAsExcelFile(listaExcel, 'Colaboradores');
    }catch (err){
      console.log(err);
    }
  }
}
