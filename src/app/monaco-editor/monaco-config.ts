import { NgxMonacoEditorConfig } from 'ngx-monaco-editor';

export const languages = {
    json: {
        id: 'json',
        extensions: ['.json', '.bowerrc', '.jshintrc', '.jscsrc', '.eslintrc', '.babelrc'],
        aliases: ['JSON', 'json'],
        mimetypes: ['application/json'],
        isServerNeeded: false
    },
    java: {
        id: 'java',
        extensions: ['.java'],
        aliases: ['java'],
    },
    python: {
        id: 'py',
        extensions: ['.py'],
        aliases: ['Python', 'py'],
    },
    cs: {
        id: 'cs',
        extensions: ['.cs'],
        aliases: ['cs', 'CS'],
    },
    php: {
        id: 'php',
        extensions: ['.php'],
        aliases: ['php'],
    },
    go: {
        id: 'go',
        extensions: ['.go'],
        aliases: ['go'],
    },
    cpp: {
        id: 'cpp',
        extensions: ['.cpp'],
        aliases: ['cpp'],
    },
    c: {
        id: 'c',
        extensions: ['.c'],
        aliases: ['c'],
    },
    ruby: {
        id: 'rb',
        extensions: ['.rb'],
        aliases: ['Ruby']
    },
    r: {
        id: 'r',
        extensions: ['.r'],
        aliases: ['R']
    },
    swift: {
        id: 'swift',
        extensions: ['.swift'],
        aliases: ['swift']
    },
    bash: {
        id: 'bash',
        extensions: ['.sh'],
        aliases: ['bash']
    },
    kotlin: {
        id: 'kotlin',
        extensions: ['.kt', '.kts', '.ktm'],
        aliases: ['Kotlin']
    },
    perl: {
        id: 'perl',
        extensions: ['.pl'],
        aliases: ['Perl']
    },
    scala: {
        id: 'scala',
        extensions: ['.sc', '.scala'],
        aliases: ['Scala']
    },
    javascript: {
        id: 'javascript',
        extensions: ['.js'],
        aliases: ['Javascript'],
        isServerNeeded: false
    },
    typescript: {
        id: 'typescript',
        extensions: ['.ts'],
        aliases: ['Typescript'],
        isServerNeeded: false
    }
};

export const MonacoConfig: NgxMonacoEditorConfig = {
    baseUrl: 'assets', // configure base path for monaco editor
    defaultOptions: { scrollBeyondLastLine: false }, // pass default options to be used
    onMonacoLoad: monacoOnLoad
};

export function monacoOnLoad() {
    // here monaco object will be available as window.monaco use this function to extend monaco editor functionalities.
    console.log((<any>window).monaco);
    // monaco.languages.register(languages.json);
}