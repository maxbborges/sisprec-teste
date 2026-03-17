import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

import { environment } from "src/environments/environment";
import { Util } from "../../helpers/util";

import { RelatorioService } from "src/app/services/relatorio.service";
import { AlertService, tipo } from "../../services/alert.service";
import { ApiDocumentoService } from "../../services/api-documento.service";
import { ApiIndicadorService } from "../../services/api-indicador.service";
import { ApiPrestacaoContasService } from "../../services/api-prestacao-contas.service";
import { ApiRelatorioService } from "../../services/api-relatorio.service";
import { ModalService } from "../../services/modal.service";

import { InserirPrestacaoDeContas } from 'src/app/shared/models/commands/cmdPrestacaoDeContas';
import { AlterarDocumento, InserirDocumento } from "../../models/commands/cmdDocumento";
import { AlterarPrestacaoContas, FiltroBuscarPrestacao, TipoUsuario, Usuario, VerificaVersao } from "../../models/responses/sisprec-response";


@Component({
    templateUrl: './modal-fluxo-caixa.component.html',
    styleUrls: ['./modal-fluxo-caixa.component.scss'],
  standalone: false
})
  export class ModalFLuxoCaixaComponent implements OnInit {
    @Input() public usuarioLogado: Usuario;
    @Input() public locale: string = "pt-Br";
    @Input() public idTipoPrestacaoContas: number;
    @Input() public anoExercicio: number;
    @Input() public mesExercicio: string = "";
    @Input() public idTipo: number;
    @Input() public tipo: string;
    @Input() public idNomeDocumento: number;
    @Input() public motivo: string = "";
    @Input() public observacao: string = "";
    @Input() public idArquivo: string;
    @Input() public idDocumento: number;

    @Input() public lstTipos: any[] = [];
    @Input() public lstFederacoes: any[] = [];
    @Input() public lstDocumentos: any[] = [];
    
    public arquivo: any;
    public urlUploadArquivo = environment.urlApiSisprec + 'arquivo/inserirArquivo';
    public isBaixou = false;
    public isLoading = false;
    public urlDownload = environment.urlApiSisprec + 'arquivo/porId/';
    form: FormGroup;
    public isTemMotivo: boolean = false;
    public ultimaVersao: number;
    public statusPrestacao: any;
    public inserirPrestacaoDeContas: InserirPrestacaoDeContas;
    public lstPrestacao: any[] = [];
    
    constructor(
        private ngbActiveModal: NgbActiveModal,
        private relatorioService: RelatorioService,
        private apiRelatorioService: ApiRelatorioService,
        private apiDocumentoService: ApiDocumentoService,
        private alertService: AlertService,
        private fb: FormBuilder,
        private prestacaoService: ApiPrestacaoContasService,
        private m: ModalService,
        private indicadorService: ApiIndicadorService,
      ) { }

    ngOnInit(): void {
      this.form = this.fb.group({
        radioAnalise: ['true'],
        motivo: ['']
      });
    }
    mudaTipoColaborador(event: any) {
      this.form.patchValue({
        radioAnalise: event.target.value,
      });
      this.isTemMotivo = !this.getIsRetornar();
    }

    close(){
        this.ngbActiveModal.dismiss();
    }

    cadastrarArquivo = async(isSalvar : boolean = false)=>{
      if(isSalvar == false) return;
      this.isLoading = true;
      // gerar PDF em memória
      const pdfBlob = this.arquivo;
      // montar FormData
      const formData = new FormData();
      formData.append("file", pdfBlob, `Fluxo-de-Caixa_${this.anoExercicio}_${this.mesExercicio}.pdf`);
      // enviar para seu endpoint
      const response = await fetch( this.urlUploadArquivo, {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        this.isLoading = false;
        console.error("Erro ao enviar arquivo");
      }
      const resultado = await response.json();
      this.arquivo.idArquivo = resultado;
      this.cadastrarDocumentoFluxo();
      console.log("ID GERADO:", resultado);
    }

    cadastrarDocumentoFluxo = async()=>{
      if(this.arquivo !== null && this.arquivo !== undefined){      
        let tipoDoc = this.lstTipos.find(x => x.idIndicador == this.idTipo);
  
        if (tipoDoc.sigla === 'DocConvenio' || tipoDoc.sigla === 'DocContratos') {
          this.mesExercicio = "0";
        }
        //this.formCadastro.patchValue({ano: this.filtroAno, idArquivo: this.arquivo.idArquivo})
        if (this.isBaixou) {
          const documento: InserirDocumento = {
            idArquivo: this.arquivo.idArquivo,
            idNomeDocumento: this.idNomeDocumento,
            idFederacaoDono: !this.usuarioLogado.ehDex ? this.usuarioLogado.idFiliacao : 1003,
            idUsuarioCadastro: this.usuarioLogado.idUsuario,
            idQuemSubiu: this.usuarioLogado.idUsuario,
            mes: +this.mesExercicio,
            ano: this.anoExercicio,
          };  
          console.log(documento)
          var pesquisa = {
            anoExercicio:documento.ano.toString(),
            mesExercicio:documento.mes.toString(),
            IdFederacao: documento.idFederacaoDono,
          } as FiltroBuscarPrestacao;
          this.prestacaoService.buscarPrestacoesContas(pesquisa).subscribe(
            data => {
              if(data.length > 0){
                this.apiDocumentoService.inserirDocumento(documento).subscribe((data) => {
                  if (data) {
                    this.alertService.exibirAlerta('Documento cadastrado com sucesso', tipo.sucesso);
                    this.isLoading = false;
                    this.close();
                    //this.carregarListaDocumentos();
                    //this.router.navigate(['arquivo/documentos']);
                  } else {
                    this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o documento', tipo.erro);
                    this.isLoading = false;
                    this.close();
                  }
                }, (error) => {
                  console.log('Erro ao inserir Documento:');
                  console.log(error);
                  this.alertService.exibirAlerta('Ocorreu um erro ao cadastrar o documento', tipo.erro);
                  this.isLoading = false;
                  this.close();
                });
              }else{
                this.alertService.exibirAlerta('Prestação de Contas para o periodo é inexistente!', tipo.atencao);
                this.isLoading = false;
                this.close();
              }
            }
          );
          console.log('Formulário:');
          console.log(documento);
        } else {
          this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios', tipo.atencao);
          this.isLoading = false;
        }
  
        //this.limparArquivo();
      }

    }

    //Obtem Arquivo
    gerarFluxoCaixa = async(isVerArquivo)=>{
      // if (this.formPesquisa.invalid) {
      //   return;
      // }

      this.apiRelatorioService
        .visualizarRelatorioPrestacaoContas(
          +this.mesExercicio,
          this.anoExercicio,
          this.usuarioLogado.idFiliacao
        )
        .subscribe(
          (x) => {
            this.arquivo = this.relatorioService.criarPdf(x,this.locale,this.usuarioLogado,this.mesExercicio,this.anoExercicio,isVerArquivo);
            if (isVerArquivo == false) {
              this.isBaixou = true;
              const pdfBlob = this.arquivo;
              const url = URL.createObjectURL(pdfBlob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `Fluxo-de-Caixa_${this.anoExercicio}_${this.mesExercicio}.pdf`;
              a.click();

              URL.revokeObjectURL(url);
            }
          },
          e => console.log(e)
        );
    }

    escreveMes(mes: string) {
      return Util.mes(+mes);
    }

    getNomeTipo(value){
      console.log(this.lstTipos);
        if(this.getIsPresidente()){
          return this.tipo;
        }else{
          try{
            return this.lstTipos.filter((d) =>{
              if(d.idIndicador == value) return d;
            })[0].nome;
          }catch{ return ""}
        }
    }
    getNomeFederacao(value){
      console.log(this.lstFederacoes);
      return this.lstFederacoes.filter((d) =>{
        if(d.idIndicador == value) return d;
      })[0].nome;
    }
    getNomeDocumento(value){
      if(value){
        console.log(this.lstDocumentos);
        try{
          return this.lstDocumentos.filter((d) =>{
            if(d.idNomeDocumento == value) return d;
          })[0].nome;
        }catch{return "";}
      }
    }

    getIsPresidente(){
      return this.usuarioLogado.tipoUsuarioSigla == TipoUsuario.Presidente;
    }
    getIsRetornar(){
      return this.form.controls.radioAnalise.value == 'true' ? true : false;
    }

  pesquisar(documento) {
    this.isLoading = true;
    var pesquisa = {
      anoExercicio:documento.anoExercicio.toString(),
      mesExercicio:documento.mesExercicio.toString(),
      IdFederacao: documento.idFederacao,
    } as FiltroBuscarPrestacao;

    console.log(pesquisa);

    // const filtro: string = 'IdFederacao=' + form.IdFederacao + '&' + 'exercicio=' + form.exercicio + '&' +
    // 'idStatusAtualPrestacaoContas=' + form.idStatusAtualPrestacaoContas + '&' + 'versao=' + form.versao;
    // this.location.go('/prestacaoDeContas/listar/', filtro);

    // if (form.exercicio) {
    //   pesquisa.mesExercicio = form.exercicioMes.toString();//.split('/')[0];
    //   pesquisa.anoExercicio = form.exercicio.toString();//.split('/')[1];
    // }

    this.prestacaoService.buscarPrestacoesContas(pesquisa).subscribe(
      data => {
        this.lstPrestacao = data;
        if(documento.analisePresidente.toString() == 'AprovadoPresidente'){
          this.enviarParaAnalise(this.lstPrestacao[0]);
        }
        this.alertService.exibirAlerta('Documento analisado com sucesso', tipo.sucesso);
        this.isLoading = false;
        this.close();
        //this.carregarListaDocumentos();
        //this.router.navigate(['arquivo/documentos']);
        console.log(this.lstPrestacao);
      }
    );
  }

  salvarAnalise(){
    if (this.isBaixou) {
      this.isLoading = true;
      var analisePresidente = this.form.controls.radioAnalise.value == 'true' ? 'AprovadoPresidente' : 'ReprovadoPresidente' ;
      const documento: AlterarDocumento = {
        idArquivo: this.idArquivo,
        idDocumento: this.idDocumento.toString(),
        idUsuarioAlteracao: +this.usuarioLogado.idUsuario,
        analisePresidente: analisePresidente,
        observacaoPresidente: this.form.controls.motivo.value,
        anoExercicio: +this.anoExercicio,
        mesExercicio: +this.mesExercicio,
        idFederacao: this.usuarioLogado.idFiliacao,
      };
      console.log(documento)

      this.apiDocumentoService.alterarDocumento(documento).subscribe((data) => {
        if (data) {
          this.pesquisar(documento);
        } else {
          this.alertService.exibirAlerta('Ocorreu um erro ao concluir analise do documento', tipo.erro);
        }
      }, (error) => {
        console.log('Erro ao registrar analise Documento:');
        console.log(error);
        this.alertService.exibirAlerta('Ocorreu um erro ao registrar analise do documento', tipo.erro);
      });
      console.log('Formulário:');
      console.log(documento);
    } else {
      this.isLoading = false;
      this.alertService.exibirAlerta('Por favor, preencha todos os campos obrigatórios', tipo.atencao);
    }  
    // this.alertService.exibirAlerta("Análise Realizada",tipo.sucesso)
    // this.close();
  }

  enviarParaAnalise(prestacao: any) {    
    // this.m.confirm('Tem certeza que deseja enviar esta prestação de contas para análise?')
    //   .subscribe(resposta => {
    //     if (!resposta) {
    //       console.log('Não');
    //       return;
    //     }
    //     console.log('Sim');

        this.prestacaoService.verificarDocumentoObrigatorioCompleto({
          idFederacao: this.usuarioLogado.idFiliacao,
          mesExercicio: prestacao.mesExercicio,
          anoExercicio: prestacao.anoExercicio
        }).subscribe(x => {
          if (x.length > 0) {
            if (x.filter(y => y.documentoObrigatorio === false).length > 0) {
              this.m.alert('Favor inserir todos os documentos obrigatórios.');
              return;
            }
          }

          //this.desativarBotoes = true;
          console.log(prestacao);
          this.inserirPrestacaoDeContas = null;

          if (prestacao.siglaStatusPrestacaoContas === 'RetornadaAjustes') {
            this.ultimaVersao = 0;
            console.clear();
            console.log('1');
            this.indicadorService.visualizarIndicadorPorSigla('Reanalise').subscribe(
              rr => {
                this.statusPrestacao = rr;
              },
              () => { },
              () => {
                const vVersao: VerificaVersao = {
                  idPrestacaoContas: prestacao.idPrestacaoContas,
                  siglaIndicador: 'Reanalise'
                };

                this.prestacaoService.buscarUltimaVersao(vVersao).subscribe(
                  ret => {
                    if (ret === 0 || ret === null) {
                      console.log(this.ultimaVersao);
                      this.ultimaVersao = this.ultimaVersao + 1;
                    } else {
                      console.log('Else');
                      console.log(this.ultimaVersao);
                      this.ultimaVersao = ret + 1;
                    }
                  },
                  () => { },
                  () => {
                    const alterarPrestacaoContas: AlterarPrestacaoContas = {
                      idPrestacaoContas: prestacao.idPrestacaoContas,
                      idStatusAtualPrestacaoContas: this.statusPrestacao.idIndicador,
                      versao: this.ultimaVersao,
                      idFederacao: prestacao.idFederacao,
                      mesExercicio: prestacao.mesExercicio,
                      anoExercicio: prestacao.anoExercicio,
                      idUsuarioCadastro: this.usuarioLogado.idUsuario
                    };
                    console.log(alterarPrestacaoContas);
                    this.prestacaoService.alterarPrestacaoContas(alterarPrestacaoContas).subscribe(
                      data => {
                        if (data) {
                          this.m.alert('Prestação de Contas enviada com sucesso', 'Sucesso', 's')
                            .subscribe(() => {
                              //this.pesquisar();
                            });
                        } else {
                          this.m.alert('Ocorreu um erro ao enviar a Prestação de Contas', 'Erro', 'e')
                            .subscribe(() => {
                              //this.desativarBotoes = false;
                            });
                        }
                      }, () => {
                        this.m.alert('Ocorreu um erro ao enviar prestação de contas', 'Erro', 'e')
                          .subscribe(() => {
                            //this.desativarBotoes = false;
                          });
                      });
                  });
              });
          } else {
            this.indicadorService.visualizarIndicadorPorSigla('EnviadaAnalise').subscribe(
              data => {
                this.statusPrestacao = data;
              },
              () => { },
              () => {
                this.inserirPrestacaoDeContas = {
                  anoExercicio: prestacao.anoExercicio,
                  mesExercicio: prestacao.mesExercicio,
                  idFederacao: prestacao.idFederacao,
                  idStatusAtualPrestacaoContas: this.statusPrestacao.idIndicador,
                  versao: null,
                  idUsuarioCadastro: this.usuarioLogado.idUsuario
                };
                this.prestacaoService.inserirPrestacaoDeContas(this.inserirPrestacaoDeContas).subscribe(
                  data => {
                    if (data) {
                      this.m.alert('Prestação de Contas enviada com sucesso', 'Sucesso', 's')
                        .subscribe(() => {
                          //this.pesquisar();
                        });
                    } else {
                      this.m.alert('Ocorreu um erro ao enviar a Prestação de Contas', 'Erro', 'e')
                        .subscribe(() => {
                          //this.pesquisar();
                        });
                    }
                  }, () => {
                    this.m.alert('Ocorreu um erro ao enviar a Prestação de Contas', 'Erro', 'e')
                      .subscribe(() => {
                        //this.pesquisar();
                      });
                  }
                );

              });
          }
        });
      //});
  }
}
