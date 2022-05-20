import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgxEditorModel } from 'ngx-monaco-editor';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection } from 'monaco-languageclient';
import { languages } from './monaco-config';
import { MonacoLoaderService } from '../monaco-loader.service';
const ReconnectingWebSocket = require('reconnecting-websocket');



import { filter, take } from 'rxjs/operators';
@Component({
  selector: 'app-monaco-editor',
  templateUrl: './monaco-editor.component.html',
  styleUrls: ['./monaco-editor.component.scss']
})
export class MonacoEditorComponent implements OnInit {

  workspace = '/workspace/language-server/project'
  // workspace = '/workspace/jsonrpc-ws-proxy/project'

  language;

  @ViewChild('editor', { static: true }) editorContent: ElementRef;


  editorOptions = { theme: 'vs-dark' };
  code;

  container: HTMLDivElement;
  editor : monaco.editor.IStandaloneCodeEditor;
  value: string;

  private propagateChange: (_: any) => any = (_: any) => { };

  constructor(private monacoLoader: MonacoLoaderService) { }

  ngOnInit() {
    this.container = this.editorContent.nativeElement;
    this.monacoLoader.isMonacoLoaded$.pipe(
      filter(isLoaded => isLoaded),
      take(1)
    ).subscribe(() => {
      this.initMonaco();
    });
  }

  monacoOnInit(editor: monaco.editor.IStandaloneCodeEditor) {
    // install Monaco language client services
    MonacoServices.install(editor, { rootUri: this.workspace });
    // register Monaco languages
    this.language = languages.java;
    monaco.languages.register(this.language);
    const s = monaco.Uri.file(`${this.workspace}/tmp` + this.language.extensions[0])
    console.log(s)
    // editor.setModel(monaco.editor.createModel(this.code, this.language.id, s))
    monaco.editor.createModel(this.code, this.language.id, s)
    // monaco.editor.setModelLanguage(editor.getModel(), this.language.id)
    // create the web socket
    const url = this.createUrl();
    console.log('socket uri -> ', url)
    // const webSocket = this.createWebSocket(url);
    const webSocket = new WebSocket(url);
    // listen when the web socket is opened
    listen({
      webSocket,
      onConnection: (connection: MessageConnection) => {
        // create and start the language client
        const languageClient = this.createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());
        console.log(`Connected to "${url}" and started the language client.`);
      }
    });
  }

  private initMonaco(): void {
    this.language = languages.php
    monaco.languages.register(this.language);
    this.editor = monaco.editor.create(this.container, {
      model: monaco.editor.createModel(
        this.code,
        this.language.id,
        // monaco.Uri.file(`${this.workspace}/tmp` + this.language.extensions[0])
      ),
      glyphMargin: true,
      theme: 'vs-dark',
      lightbulb: {
        enabled: true,
      },
    });
    // install Monaco language client services
    // MonacoServices.install(this.editor, { rootUri: this.workspace });
    MonacoServices.install(this.editor);
    this.editor.layout();


    const url = this.createUrl();
    console.log('socket uri -> ', url)
    // const webSocket = this.createWebSocket(url);
    const webSocket = new WebSocket(url);
    // listen when the web socket is opened
    listen({
      webSocket,
      onConnection: (connection: MessageConnection) => {
        // create and start the language client
        const languageClient = this.createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());
        console.log(`Connected to "${url}" and started the language client.`);
      }
    });
  }

  public createUrl(): string {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://3000-tyagirajat2-languageser-s58qdzami3l.ws-us45.gitpod.io/${this.language.id}`;
  }

  public createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
    return new MonacoLanguageClient({
      name: `${this.language.id.toUpperCase()} Client`,
      clientOptions: {
        // use a language id as a document selector
        documentSelector: [this.language.id],
        // disable the default error handler
        errorHandler: {
          error: () => ErrorAction.Continue,
          closed: () => CloseAction.DoNotRestart
        }
      },
      // create a language client connection from the JSON RPC connection on demand
      connectionProvider: {
        get: (errorHandler, closeHandler) => {
          return Promise.resolve(createConnection(connection, errorHandler, closeHandler));
        }
      }
    });
  }

  public createWebSocket(socketUrl: string): WebSocket {
    const socketOptions = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 10000,
      maxRetries: Infinity,
      debug: false
    };
    return new ReconnectingWebSocket.default(socketUrl, [], socketOptions);
  }

}
