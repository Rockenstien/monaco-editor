import { BrowserModule } from '@angular/platform-browser';
import { Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { MonacoEditorComponent } from './monaco-editor/monaco-editor.component';
import { MonacoLoaderService } from './monaco-loader.service';



@NgModule({
  declarations: [
    AppComponent,
    MonacoEditorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    // MonacoEditorModule.forRoot(MonacoConfig) // use forRoot() in main app module only.
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {

  }
}
