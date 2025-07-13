import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export enum ProgrammingLanguage {
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  PYTHON = 'python',
  JAVA = 'java',
  C = 'c',
  CPP = 'cpp',
  CSHARP = 'csharp',
  RUBY = 'ruby',
  PHP = 'php',
}

@Component({
  selector: 'app-neo-code-editor',
  template: `
    <div class="neo-code-editor-container" [ngClass]="{ 'read-only': readOnly }">
      <div #editorContainer class="neo-code-editor" [ngStyle]="{'height': height}"></div>
      <div class="neo-code-editor-toolbar" *ngIf="showToolbar">
        <div class="toolbar-section">
          <select [value]="language" (change)="onLanguageChange($event)" class="language-selector">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
          </select>
        </div>
        <div class="toolbar-section">
          <button class="btn-reset" (click)="resetCode()" 
                  [disabled]="readOnly" 
                  title="Reset to initial code">
            Reset
          </button>
          <button class="btn-run" (click)="runCode()" 
                  [disabled]="isRunning || readOnly" 
                  title="Run code">
            {{ isRunning ? 'Running...' : 'Run Code' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .neo-code-editor-container {
      display: flex;
      flex-direction: column;
      border: 2px solid #000;
      box-shadow: 3px 3px 0 0 rgba(0, 0, 0, 0.5);
      background-color: #1e1e1e;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .neo-code-editor-container.read-only {
      opacity: 0.9;
    }
    
    .neo-code-editor {
      width: 100%;
      min-height: 300px;
      overflow: hidden;
    }
    
    .neo-code-editor-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: #2d2d2d;
      border-top: 1px solid #444;
    }
    
    .toolbar-section {
      display: flex;
      gap: 8px;
    }
    
    .language-selector {
      padding: 6px 10px;
      border: 1px solid #444;
      background-color: #333;
      color: #ddd;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-reset {
      background-color: #555;
      color: white;
    }
    
    .btn-reset:hover:not(:disabled) {
      background-color: #666;
    }
    
    .btn-run {
      background-color: #0a84ff;
      color: white;
    }
    
    .btn-run:hover:not(:disabled) {
      background-color: #0060df;
    }
  `],
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NeoCodeEditorComponent),
      multi: true
    }
  ]
})
export class NeoCodeEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  
  @Input() initialCode: string = '';
  @Input() language: ProgrammingLanguage = ProgrammingLanguage.JAVASCRIPT;
  @Input() readOnly: boolean = false;
  @Input() height: string = '400px';
  @Input() showToolbar: boolean = true;
  
  @Output() codeChange = new EventEmitter<string>();
  @Output() run = new EventEmitter<string>();

  private editor: any = null;
  private originalModel: any = null;
  private value: string = '';
  isRunning: boolean = false;
  private monacoLoaded = false;
  
  private onChange: any = () => {};
  private onTouched: any = () => {};

  ngOnInit(): void {
    this.loadMonacoEditor();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.dispose();
    }
    if (this.originalModel) {
      this.originalModel.dispose();
    }
  }

  private async loadMonacoEditor(): Promise<void> {
    if (this.monacoLoaded) return;
    
    try {
      // Lazy load Monaco Editor
      const monaco = await import('monaco-editor');
      this.monacoLoaded = true;
      this.initMonaco(monaco.editor);
    } catch (error) {
      console.error('Failed to load Monaco Editor:', error);
    }
  }

  private initMonaco(editor: any): void {
    const container = this.editorContainer.nativeElement;
    
    // Create model with initial code
    this.originalModel = editor.createModel(
      this.initialCode || '', 
      this.mapLanguage(this.language)
    );
    
    // Create editor instance with optimized settings
    this.editor = editor.create(container, {
      model: this.originalModel,
      theme: 'vs-dark',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      minimap: { enabled: false }, // Disable minimap to reduce bundle size
      fontSize: 14,
      lineNumbers: 'on',
      readOnly: this.readOnly,
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      },
      // Optimize performance
      renderWhitespace: 'none',
      wordWrap: 'on',
      folding: false,
      // Disable features that increase bundle size
      suggestOnTriggerCharacters: false,
      quickSuggestions: false,
      parameterHints: {
        enabled: false
      }
    });
    
    // Add event listener for content changes
    this.editor.onDidChangeModelContent(() => {
      if (this.editor) {
        const newValue = this.editor.getValue();
        this.value = newValue;
        this.onChange(newValue);
        this.codeChange.emit(newValue);
      }
    });
    
    // Mark as touched on focus out
    this.editor.onDidBlurEditorWidget(() => {
      this.onTouched();
    });

    // Set initial value
    if (this.value) {
      this.editor.setValue(this.value);
    } else {
      this.value = this.initialCode;
    }
  }

  private mapLanguage(lang: ProgrammingLanguage): string {
    const mapping: Record<ProgrammingLanguage, string> = {
      [ProgrammingLanguage.JAVASCRIPT]: 'javascript',
      [ProgrammingLanguage.TYPESCRIPT]: 'typescript',
      [ProgrammingLanguage.PYTHON]: 'python',
      [ProgrammingLanguage.JAVA]: 'java',
      [ProgrammingLanguage.CPP]: 'cpp',
      [ProgrammingLanguage.CSHARP]: 'csharp',
      [ProgrammingLanguage.RUBY]: 'ruby',
      [ProgrammingLanguage.PHP]: 'php',
      [ProgrammingLanguage.C]: 'c'
    };
    return mapping[lang] || 'plaintext';
  }

  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newLang = select.value as ProgrammingLanguage;
    this.language = newLang;
    
    if (this.editor && this.originalModel) {
      // Dynamically import Monaco to get the setModelLanguage function
      import('monaco-editor').then(monaco => {
        monaco.editor.setModelLanguage(this.originalModel, this.mapLanguage(newLang));
      });
    }
  }

  resetCode(): void {
    if (this.editor && !this.readOnly) {
      this.editor.setValue(this.initialCode);
    }
  }

  runCode(): void {
    if (this.editor && !this.readOnly && !this.isRunning) {
      this.isRunning = true;
      const code = this.editor.getValue();
      this.run.emit(code);
      this.isRunning = false;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value || '';
    if (this.editor) {
      this.editor.setValue(this.value);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.editor) {
      this.editor.updateOptions({ readOnly: isDisabled });
    }
  }
} 