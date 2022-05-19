import { Component, OnInit } from '@angular/core';
import { NgxEditorModel } from 'ngx-monaco-editor';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection } from 'monaco-languageclient';
import { languages } from './monaco-config';
const ReconnectingWebSocket = require('reconnecting-websocket');
@Component({
  selector: 'app-monaco-editor',
  templateUrl: './monaco-editor.component.html',
  styleUrls: ['./monaco-editor.component.scss']
})
export class MonacoEditorComponent implements OnInit {

  language;
  editorOptions = { theme: 'vs-dark' };
  code = `
  #Initialize array     
  arr = [5, 2, 8, 7, 1];     
  temp = 0;    
       
  #Displaying elements of original array    
  print("Elements of original array: ");    
  for i in range(0, len(arr)):    
      print(arr[i], end=" ");    
       
  #Sort the array in ascending order    
  for i in range(0, len(arr)):    
      for j in range(i+1, len(arr)):    
          if(arr[i] > arr[j]):    
              temp = arr[i];    
              arr[i] = arr[j];    
              arr[j] = temp;    
       
  print();    
       
  #Displaying elements of the array after sorting    
      
  print("Elements of array sorted in ascending order: ");    
  for i in range(0, len(arr)):    
      print(arr[i], end=" ");    
  `
  constructor() { }

  ngOnInit() {
  }

  monacoOnInit(editor: monaco.editor.IStandaloneCodeEditor) {
    // install Monaco language client services
    MonacoServices.install(editor);
    // register Monaco languages
    this.language = languages.python;
    monaco.editor.setModelLanguage(editor.getModel(), this.language.id)
    monaco.languages.register(this.language);
    // create the web socket
    const url = this.createUrl();
    console.log('socket uri -> ', url)
    const webSocket = this.createWebSocket(url);
    // const webSocket = new WebSocket(url);
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
    return `${protocol}://3000-tyagirajat2-languageser-y6fuvz9nvpz.ws-us45.gitpod.io/${this.language.id}`;
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
