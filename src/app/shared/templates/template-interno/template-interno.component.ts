import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-template-interno",
  templateUrl: "./template-interno.component.html",
  styleUrls: ["./template-interno.component.scss"],
  standalone: false
})
export class TemplateInternoComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  permitirContainerFluid(): boolean {
    const url = this.router.url;

    if (
      (url.indexOf("/estimativaDeCusto/analisar/") === 0 &&
        url.indexOf("/visualizar") === 64) ||
      (url.indexOf("/estimativaDeCusto/cadastrarValores/") === 0 &&
        url.indexOf("/visualizar") === 72) ||
      (url.indexOf("/estimativaDeCusto/cadastrarValores/") === 0 &&
        url.indexOf("/cadastrarEditar") === 72) ||
      url.indexOf("/relatorios/analise-prestacao-contas") === 0 ||
      url.indexOf("/relatorios/historico-prestacao-contas") === 0 ||
      url.indexOf("/relatorios/despesas") === 0 ||
      url.indexOf("/prestacaoDeContas/") === 0
    ) {
      return true;
    }
    return false;
  }
}
