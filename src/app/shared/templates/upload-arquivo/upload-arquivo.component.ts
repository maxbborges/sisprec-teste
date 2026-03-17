import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-upload-arquivo',
  templateUrl: './upload-arquivo.component.html',
  styleUrls: ['./upload-arquivo.component.scss'],
  standalone: false
})

export class UploadArquivoComponent implements OnInit {
  @Input() mode: "advanced" | "basic" = "advanced";


  @Output()
  enviouArquivo: EventEmitter<any> = new EventEmitter<any>();

  public uploadComSucesso = false;
  public uploadComFalha = false;
  public apiUrl: string = environment.urlApiSisprec;
  public urlUploadArquivo = environment.urlApiSisprec + 'arquivo/inserirArquivo';
  public idArquivo: any;

  constructor() { }

  ngOnInit() {
  }

  onUpload(event) {
    const arquivoEnviado = {
                            idArquivo: event.originalEvent.body,
                            nomeArquivo: event.files[0].name
                          };



    this.uploadComSucesso = true;
    this.uploadComFalha = false;
    this.idArquivo = arquivoEnviado;
    this.enviouArquivo.emit(arquivoEnviado);
  }

  onError(event) {
    this.uploadComFalha = true;
    this.uploadComSucesso = false;
    console.log('Erro ao fazer upload:');
    //this.idArquivo = '';
  }

}
