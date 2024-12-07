
import {EditorView} from 'codemirror'
import {Extension} from '@codemirror/state'
import {syntaxHighlighting, HighlightStyle} from '@codemirror/language'
import {tags as defaultTags, Tag} from '@lezer/highlight'

interface Theme {
    'name': string;
    'dark': boolean;
    'fold-text'?: string;
    'token-colors'?: {[key: string]: string | object};
    'bracket-colors'?: string[];
    'css'?: {[key: string]: {[key: string]: string}};
};

const tags = {...defaultTags, function_: defaultTags.function, null_: defaultTags['null']};

const tagDeconstructor = 'const {' + Object.keys(tags).filter(tag => tag != 'function' && tag != 'null').join(',') + '} = this;';

const themes: {[key: string]: Theme | string} = require('./themes.json');

function resolveTheme(theme: Theme | string): Theme {
    while (typeof theme == 'string') {
        theme = themes[theme];
    }
    return theme;
}

function createThemeExtension(theme: Theme, doSyntaxHighlighting: boolean = true): Extension {
    let tokenSettings: {tag: Tag | Tag[], [key: string]: any}[] = [];
    if (theme['token-colors']) {
        for (const [key, value] of Object.entries(theme['token-colors'])) {
            try {
                let tag: Tag | Tag[] = Function(`'use strict';${tagDeconstructor};return ${key};`).bind(tags)();
                if (tag == null) tag = tags.null;
                if (typeof value == 'string') {
                    tokenSettings.push({ tag: tag, color: value });
                } else {
                    tokenSettings.push({ tag: tag, ...value });
                }
            } catch (error) {
                console.warn(`Invalid key in !token-colors:\nkey: \`${key}\`\ncode: \`'use strict';${tagDeconstructor}return ${key};\`\nerror: ${error}`);
            }
        }
    }
    let out = [EditorView.theme({}, {dark: theme.dark})];
    if (doSyntaxHighlighting) out.push(syntaxHighlighting(HighlightStyle.define(tokenSettings)));
    return out;
}

function generateThemeCSS(theme: Theme): string {
    let out: string[] = [];
    if (theme.css) {
        for (let [selector, css] of Object.entries(theme.css)) {
            selector = selector.replace('$button$', 'button, .editor .cm-button');
            selector = selector.replace('$input$', 'input, .editor .cm-textfield');
            selector = selector.replace('$editor$', '.editor > div > div');
            selector = selector.replace('$line-number$', '.editor :is(.cm-gutters, .cm-gutter)');
            selector = selector.replace('$current-line-number$', '.editor .cm-activeLineGutter');
            selector = selector.replace('$selection$', '.editor .cm-focused .cm-selectionBackground, ::selection');
            selector = selector.replace('$selection-match$', '.editor .cm-selectionMatch');
            selector = selector.replace('$fold$', '.editor .cm-foldPlaceholder');
            selector = selector.replace('$search$', '.editor .cm-panels:has(> .cm-search)');
            if (selector.startsWith('&')) {
                selector = selector.slice(1);
            } else if (selector == '') {
                selector = '.editor-wrapper, .editor-wrapper :is(.editor > div > div)';
            } else {
                selector = '.editor-wrapper :is(' + selector + ')';
            }
            out.push(selector + '{' + Object.entries(css).map(([x, y]) => x + ':' + y).join(';') + '}');
        }
    }
    console.log(out);
    return out.join('');
}

export {
    Theme,
    resolveTheme,
    createThemeExtension,
    generateThemeCSS,
}
