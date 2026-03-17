import { Component, Input, OnInit } from '@angular/core';
import JSZip from 'jszip';
import { ApiArquivoService } from 'src/app/shared/services/api-arquivo.service';

@Component({
  selector: 'app-download-arquivo',
  templateUrl: './download-arquivo.component.html',
  styleUrls: ['./download-arquivo.component.scss'],
  standalone: false
})
export class DownloadArquivoComponent implements OnInit {

  @Input()
  despesaArquivo: any;

  constructor(private arquivoService: ApiArquivoService) { }

  ngOnInit() {
    console.log(this.despesaArquivo)
  }

  downloadZip(): void{
    const zip = new JSZip();
    var arrayArquivo = []
    arrayArquivo.push(this.despesaArquivo.idArquivo)

    var listaUnica = {
      idDespesa: 0,
      idArquivos: arrayArquivo,
    }

    var lista = {
      idDespesa: this.despesaArquivo.idPrestacaoContaItemSaida,
      idArquivos: []
    }

    this.arquivoService.listarArquivos(listaUnica).subscribe(data => {
      this.downloadMultiplosArquivos(zip, lista, data)
    })
  }


  downloadMultiplosArquivos(zip: JSZip, lista, listaUnica){

    this.arquivoService.listarArquivos(lista).subscribe(data => {

      var listaArquivos = [...listaUnica, ...data];

      for(var i in listaArquivos){
        zip.file(listaArquivos[i].nomeArquivo, listaArquivos[i].binario, {base64: true});
      }

      zip.generateAsync({type: 'blob'}).then((content) => {
        const objectUrl: string = URL.createObjectURL(content);
        const link: any = document.createElement('a');

        link.download = 'extrato-sisprec.zip';
        link.href = objectUrl;
        link.click();
      });
    })
  }

}
