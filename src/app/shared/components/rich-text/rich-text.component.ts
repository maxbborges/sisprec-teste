import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import Quill from 'quill';

const tamanhosDisponiveis = ['8px', '10px', '12px', '14px', '16px', '18px', '24px', '32px', '48px', '72px'];
const Size = Quill.import('attributors/style/size');
Size.whitelist = tamanhosDisponiveis;
Quill.register(Size, true);

@Component({
    selector: 'app-rich-text',
    templateUrl: './rich-text.component.html',
    styleUrls: ['./rich-text.component.scss'],
  standalone: false
})
  
  export class RichTextComponent {
    @ViewChild('toolbar', { static: true }) toolbarRef!: ElementRef<HTMLDivElement>;
    @ViewChild('editor',  { static: true }) editorRef!: ElementRef<HTMLDivElement>;
    @Input() control: FormControl;
    @Input() placeholder: string = "Digite alguma coisa...";
  
    private quill: any;

    public tamanhosTexto = tamanhosDisponiveis;
  
    private onTextChange = () => {
      let editor = this.editorRef.nativeElement.querySelector('.ql-editor')
      let html = editor.innerHTML || '';

      if (!editor.textContent.trim() && !editor.querySelector('img, video, iframe')) {
          html = '';
      }
      if (this.control.value !== html) {
        this.control.setValue(html, { emitEvent: false });
      }
    };
  
    ngAfterViewInit(): void {
      this.quill = new Quill(this.editorRef.nativeElement, {
        theme: 'snow',
        placeholder: this.placeholder,
        modules: {
          toolbar: this.toolbarRef.nativeElement
        }
      });
  
      // Para o conteúdo inicial
      const initial = this.control.value || '';
      if (initial) {
        this.quill.clipboard.dangerouslyPasteHTML(initial);
      }
  
      // ao alterara o texto no quill, adiciona no formcontrol
      this.quill.on('text-change', this.onTextChange);
  
      // quando alterar o formulário externamente, irá refletir no quill
      this.control.valueChanges.subscribe(val => {
        const current = this.editorRef.nativeElement.querySelector('.ql-editor').innerHTML || '';
        if ((val || '') !== current) this.quill.clipboard.dangerouslyPasteHTML(val || '');
      });

      this.control.registerOnDisabledChange(v => {
        this.quill.enable(!v);
      });

      if(this.control.disabled){
        this.quill.enable(false);
        this.toolbarRef.nativeElement.classList.add('disabled-toolbar')
      }
    }
  
    ngOnDestroy(): void {
      if (this.quill) {
        this.quill.off('text-change', this.onTextChange);
        this.quill = null;
      }
    }
}