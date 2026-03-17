import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { InserirPrestacaoDeContas } from 'src/app/shared/models/commands/cmdPrestacaoDeContas';
import { AlterarPrestacaoContas, FiltroBuscarPrestacao, Usuario, VerificaVersao } from 'src/app/shared/models/responses/sisprec-response';
import { ApiIndicadorService } from 'src/app/shared/services/api-indicador.service';
import { ApiPrestacaoContasService } from 'src/app/shared/services/api-prestacao-contas.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-listar-prestacao-de-contas',
  templateUrl: './listar-prestacao-de-contas.component.html',
  styleUrls: ['./listar-prestacao-de-contas.component.scss'],
  providers: [
    NgbDropdown
  ],
  standalone: false
})
export class ListarPrestacaoDeContasComponent implements OnInit {

  public lstStatusPrestacao: any[] = [];
  public lstPrestacao: any[] = [];
  public formPesquisa: FormGroup;
  public usuario: Usuario;
  public msg = 'Sem registro cadastrado';
  public lstExercicios: string[] = [];
  public lstExerciciosMes: string[] = [];
  public statusPrestacao: any;
  public ultimaVersao: number;
  public inserirPrestacaoDeContas: InserirPrestacaoDeContas;
  desativarBotoes = false;

  constructor(
    private indicadorService: ApiIndicadorService,
    private prestacaoService: ApiPrestacaoContasService,
    private formBuilder: FormBuilder,
    private storage: StorageService,
    private m: ModalService,
    private location: Location,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.carregarStatus();
    this.usuario = this.storage.getUsuarioLogado();
    this.obterExercicios();
    this.obterFiltro();
  }

  obterExercicios(){
    // this.prestacaoService.getListaExercicios().subscribe(data => {
    //   console.log(data)
    //   this.lstExercicios = data;
    // })

    const anos = []; 
    const dataAtual = new Date();
    // primeiro ano eh 2020
    for (let ano = 2020; ano <= dataAtual.getFullYear(); ano++){
      anos.push(ano);
      this.lstExercicios = anos;
    }

    //anos.forEach(ano => {
      //let qtdMeses = ano === dataAtual.getFullYear() ? dataAtual.getMonth() + 1 : 12;
      for (let i = 0; i < 12; i++) {
        //var exercicio = i+1 + '/' + ano
        //this.lstExercicios.push(exercicio)
        this.lstExerciciosMes.push((i+1).toString());
      }
    //})

    console.log(this.lstExercicios)
    console.log(this.lstExerciciosMes)
  }

  enviarParaAnalise(id: any) {

    this.m.confirm('Tem certeza que deseja enviar esta prestação de contas para análise?')
      .subscribe(resposta => {
        if (!resposta) {
          console.log('Não');
          return;
        }
        console.log('Sim');

        this.prestacaoService.verificarDocumentoObrigatorioCompleto({
          idFederacao: this.usuario.idFiliacao,
          mesExercicio: id.mesExercicio,
          anoExercicio: id.anoExercicio
        }).subscribe(x => {
          if (x.length > 0) {
            if (x.filter(y => y.documentoObrigatorio === false).length > 0) {
              this.m.alert('Favor inserir todos os documentos obrigatórios.');
              return;
            }
          }

          this.desativarBotoes = true;
          console.log(id);
          this.inserirPrestacaoDeContas = null;

          if (id.siglaStatusPrestacaoContas === 'RetornadaAjustes') {
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
                  idPrestacaoContas: id.idPrestacaoContas,
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
                      idPrestacaoContas: id.idPrestacaoContas,
                      idStatusAtualPrestacaoContas: this.statusPrestacao.idIndicador,
                      versao: this.ultimaVersao,
                      idFederacao: id.idFederacao,
                      mesExercicio: id.mesExercicio,
                      anoExercicio: id.anoExercicio,
                      idUsuarioCadastro: this.usuario.idUsuario
                    };
                    console.log(alterarPrestacaoContas);
                    this.prestacaoService.alterarPrestacaoContas(alterarPrestacaoContas).subscribe(
                      data => {
                        if (data) {
                          this.m.alert('Prestação de Contas enviada com sucesso', 'Sucesso', 's')
                            .subscribe(() => {
                              this.pesquisar();
                            });
                        } else {
                          this.m.alert('Ocorreu um erro ao enviar a Prestação de Contas', 'Erro', 'e')
                            .subscribe(() => {
                              this.desativarBotoes = false;
                            });
                        }
                      }, () => {
                        this.m.alert('Ocorreu um erro ao enviar prestação de contas', 'Erro', 'e')
                          .subscribe(() => {
                            this.desativarBotoes = false;
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
                  anoExercicio: id.anoExercicio,
                  mesExercicio: id.mesExercicio,
                  idFederacao: id.idFederacao,
                  idStatusAtualPrestacaoContas: this.statusPrestacao.idIndicador,
                  versao: null,
                  idUsuarioCadastro: this.usuario.idUsuario
                };
                this.prestacaoService.inserirPrestacaoDeContas(this.inserirPrestacaoDeContas).subscribe(
                  data => {
                    if (data) {
                      this.m.alert('Prestação de Contas enviada com sucesso', 'Sucesso', 's')
                        .subscribe(() => {
                          this.pesquisar();
                        });
                    } else {
                      this.m.alert('Ocorreu um erro ao enviar a Prestação de Contas', 'Erro', 'e')
                        .subscribe(() => {
                          this.pesquisar();
                        });
                    }
                  }, () => {
                    this.m.alert('Ocorreu um erro ao enviar a Prestação de Contas', 'Erro', 'e')
                      .subscribe(() => {
                        this.pesquisar();
                      });
                  }
                );

              });
          }
        });
      });
  }

  carregarStatus() {
    this.indicadorService.listarTodosIndicadoresPorTipoSigla('StatusPrestacaoContas').subscribe(
      data => {
        this.lstStatusPrestacao = data;
      });
  }

  obterFiltro(){

    this.route.queryParams
      .subscribe(params => {
        if(JSON.stringify(params) !== '{}'){
          console.log(params)
          this.formPesquisa.controls['IdFederacao'].setValue(params.IdFederacao);
          this.formPesquisa.controls['exercicio'].setValue(params.exercicio);
          this.formPesquisa.controls['idStatusAtualPrestacaoContas'].setValue(params.idStatusAtualPrestacaoContas);
          this.formPesquisa.controls['versao'].setValue(params.versao);

          this.pesquisar();
        }
    });
  }

  pesquisar() {

    this.formPesquisa.patchValue({ IdFederacao: this.usuario.idFiliacao });
    const form = this.formPesquisa.value;
    var pesquisa = {
      anoExercicio:'',
      mesExercicio:'',
      idStatusAtualPrestacaoContas: form.idStatusAtualPrestacaoContas,
      versao: form.versao,
      idFederacao: this.usuario.idFiliacao
    } as FiltroBuscarPrestacao;

    console.log(form)

    const filtro: string = 'IdFederacao=' + form.IdFederacao + '&' + 'exercicio=' + form.exercicio + '&' +
    'idStatusAtualPrestacaoContas=' + form.idStatusAtualPrestacaoContas + '&' + 'versao=' + form.versao;
    this.location.go('/prestacaoDeContas/listar/', filtro);

    if (form.exercicio) {
      pesquisa.mesExercicio = form.exercicioMes.toString();//.split('/')[0];
      pesquisa.anoExercicio = form.exercicio.toString();//.split('/')[1];
    }

    this.prestacaoService.buscarPrestacoesContas(pesquisa).subscribe(
      data => {
        this.lstPrestacao = data;
        console.log(this.lstPrestacao);
        this.desativarBotoes = false;
      }
    );
  }

  inicializarFormulario() {
    this.formPesquisa = this.formBuilder.group({
      exercicio: ['', Validators.required],
      exercicioMes: ['', Validators.required],
      idStatusAtualPrestacaoContas: ['', Validators.required],
      versao: [''],
      IdFederacao: ['']
    });
  }

  buscarUltimaVersao(obj: VerificaVersao) {
    this.prestacaoService.buscarUltimaVersao(obj).subscribe(
      ret => {
        if (ret === 0 || ret === null) {
          this.ultimaVersao = 1;
        } else {
          this.ultimaVersao = ret;
        }
      });
  }

}

