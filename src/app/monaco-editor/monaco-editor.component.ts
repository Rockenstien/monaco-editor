import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgxEditorModel } from 'ngx-monaco-editor';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection } from 'monaco-languageclient';
import { languages } from './monaco-config';
import { language as csLanguage, conf as csConf } from 'monaco-editor/esm/vs/basic-languages/csharp/csharp.js';
import { language as rbLanguage, conf as rbConf } from 'monaco-editor/esm/vs/basic-languages/ruby/ruby.js';
import { language as shellLanguage, conf as shellConf } from 'monaco-editor/esm/vs/basic-languages/shell/shell.js';
import { language as pyLanguage, conf as pyConf } from 'monaco-editor/esm/vs/basic-languages/python/python.js';
import { language as scLanguage, conf as scConf } from 'monaco-editor/esm/vs/basic-languages/scala/scala.js';
import { MonacoLoaderService } from '../monaco-loader.service';
const ReconnectingWebSocket = require('reconnecting-websocket');



import { filter, take } from 'rxjs/operators';
@Component({
  selector: 'app-monaco-editor',
  templateUrl: './monaco-editor.component.html',
  styleUrls: ['./monaco-editor.component.scss']
})
export class MonacoEditorComponent implements OnInit {

  // workspace = '/workspace/language-server/project'
  workspace = '/workspace/jsonrpc-ws-proxy/project';

  language;
  changeLanguageId;
  autoCompleteStatus = false;

  @ViewChild('editor', { static: true }) editorContent: ElementRef;

  get languages() {
    return languages;
  }

  editorOptions = { theme: 'vs-dark' };
  code;

  container: HTMLDivElement;
  editor: monaco.editor.IStandaloneCodeEditor;
  webSocket: WebSocket;
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

  private initMonaco(): void {
    // console.log(language)
    this.editor = monaco.editor.create(this.container, {
      glyphMargin: true,
      theme: 'vs-dark',
      lightbulb: {
        enabled: true,
      },
    });
    // install Monaco language client services
    MonacoServices.install(this.editor, { rootUri: 'file://' + this.workspace });
    this.editor.layout();
    this.changeLanguageId = 'cs';
    this.changeLanguage();
  }

  public changeLanguage() {
      console.clear();
      this.language = languages[this.changeLanguageId];
      monaco.languages.register(this.language);

      if (this.webSocket) {
        this.webSocket.close();
      }
      if (this.language === languages.cs) {
      monaco.languages.setMonarchTokensProvider(this.language.id, csLanguage);
      monaco.languages.setLanguageConfiguration(this.language.id, csConf);
    } else if (this.language === languages.ruby) {
      monaco.languages.setMonarchTokensProvider(this.language.id, rbLanguage);
      monaco.languages.setLanguageConfiguration(this.language.id, rbConf);
    } else if (this.language === languages.bash) {
      monaco.languages.setMonarchTokensProvider(this.language.id, shellLanguage);
      monaco.languages.setLanguageConfiguration(this.language.id, shellConf);
    } else if (this.language === languages.python) {
      monaco.languages.setMonarchTokensProvider(this.language.id, pyLanguage);
      monaco.languages.setLanguageConfiguration(this.language.id, pyConf);
    } else if (this.language === languages.scala) {
      monaco.languages.setMonarchTokensProvider(this.language.id, scLanguage);
      monaco.languages.setLanguageConfiguration(this.language.id, scConf);
    }
      if (this.language.isServerNeeded !== false) {
        this.editor.setModel(monaco.editor.createModel(
          this.code,
          this.language.id,
            monaco.Uri.file(`${this.workspace}/tmp` + this.language.extensions[0])
          ));
        const url = this.createUrl();
        this.webSocket = this.createWebSocket(url);
        this.webSocket.addEventListener('message', () => {
          this.autoCompleteStatus = true;
        });
      // listen when the web socket is opened
        listen({
        webSocket: this.webSocket,
        onConnection: (connection: MessageConnection) => {
          // create and start the language client
          const languageClient = this.createLanguageClient(connection);
          const disposable = languageClient.start();
          connection.onClose(() => disposable.dispose());
          console.log(`Connected to "${url}" and started the language client.`);
        },
      });
      } else {
        this.editor.setModel(monaco.editor.createModel(
          this.code,
          this.language.id
        ));
      }
  }

  public createUrl(): string {
    const protocol =  'wss';
    return `${protocol}://3000-wylieconlon-jsonrpcwspr-ve6fn3oixpa.ws-us45.gitpod.io/${this.language.id}`;
    // return `${protocol}://localhost:3000/${this.language.id}`;
  }

  public createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
    return new MonacoLanguageClient({
      name: `${this.language.id.toUpperCase()} Client`,
      clientOptions: {
        // use a language id as a document selector
        documentSelector: [this.language.id],
        workspaceFolder: {
          uri: monaco.Uri.file(this.workspace),
          name: this.workspace,
          index: 0
        },
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
