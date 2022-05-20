import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import loader from '@monaco-editor/loader';

@Injectable({
    providedIn: 'root'
})
export class MonacoLoaderService {

    monacos: any;
    isMonacoLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    constructor() {
        if (!(<any>window).monacoEditorAlreadyInitialized) {
            loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.18.1/min/vs' } });
            loader.init().then(monacos => {
                (<any>window).monacoEditorAlreadyInitialized = true;
                this.isMonacoLoaded$.next(true);
            });
        } else {
            this.isMonacoLoaded$.next(true);
        }
    }
}
