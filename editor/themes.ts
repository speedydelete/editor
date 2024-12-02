
import {EditorView} from 'codemirror'
import {Extension} from '@codemirror/state'
import {syntaxHighlighting, HighlightStyle} from '@codemirror/language'
import {tags as defaultTags, Tag} from '@lezer/highlight'

const tags = {...defaultTags, function_: defaultTags.function, null_: defaultTags['null']};

interface SubTheme {
    fontFamily?: string,
    fontSize?: string,
    caretColor?: string,
    background?: string,
    color?: string,
    border?: string,
    borderTop?: string,
    borderBottom?: string,
    borderLeft?: string,
    borderRight?: string,
}

interface SubThemeActive extends SubTheme {
    active?: SubTheme
}

interface Theme extends SubTheme {
    name?: string,
    dark?: boolean,
    editor?: SubTheme,
    lineNumber?: SubThemeActive,
    selection?: SubTheme,
    selectionMatch?: SubTheme,
    foldText?: string,
    fold?: SubTheme,
    topBar?: SubTheme,
    tab?: SubThemeActive,
    tokenColors?: {[key: string]: object | string},
    bracketColors?: string[],
    settings?: SubTheme,
    button?: SubThemeActive,
    css?: string,
    numberInput?: SubThemeActive,
    textInput?: SubThemeActive,
    checkboxInput?: SubThemeActive,
}

interface CompleteSubTheme {
    fontFamily: string,
    fontSize: string,
    caretColor: string,
    background: string,
    color: string,
    borderTop: string,
    borderBottom: string,
    borderLeft: string,
    borderRight: string,
}

interface CompleteSubThemeActive extends CompleteSubTheme {
    active: CompleteSubTheme,
}

interface CompleteTheme extends CompleteSubTheme {
    name: string,
    dark: boolean,
    editor: CompleteSubTheme,
    lineNumber: CompleteSubThemeActive,
    selection: CompleteSubTheme,
    selectionMatch: CompleteSubTheme,
    foldText: string,
    fold: CompleteSubTheme,
    topBar: CompleteSubTheme,
    tab: CompleteSubThemeActive,
    tokenColors: {[key: string]: object | string},
    bracketColors: string[],
    settings: CompleteSubTheme,
    button: CompleteSubThemeActive,
    numberInput: CompleteSubThemeActive,
    textInput: CompleteSubThemeActive,
    checkboxInput: CompleteSubThemeActive,
    css: string,
}

const tagDeconstructor = 'const {' + Object.keys(tags).filter(tag => tag != 'function' && tag != 'null').join(',') + '} = this;';

function ifUndefined(value: any, defaultValue: any): any {
    return value === undefined ? defaultValue : value;
}

const baseThemes: {dark: CompleteTheme, light: CompleteTheme} = require('./base_themes.json')
const themes: {[key: string]: Theme | string} = require('./themes.json');

function resolveTheme(theme: Theme | string): Theme {
    while (typeof theme == 'string') {
        theme = themes[theme];
    }
    return theme;
}

function getBorder(border: string | undefined, base: string | undefined): string {
    border = ifUndefined(border, base);
    if (border !== undefined && border !== 'none' && !border.includes(' ')) {
        border = '1px solid ' + border;
    }
    return border;
}

function completeSubTheme(theme: SubTheme | undefined, parentTheme: SubTheme, baseTheme: CompleteSubTheme): CompleteSubTheme {
    let border = ifUndefined(theme?.border, parentTheme.border);
    return {
        fontFamily: ifUndefined(theme?.fontFamily, ifUndefined(parentTheme.fontFamily, baseTheme.fontFamily)),
        fontSize: ifUndefined(theme?.fontSize, ifUndefined(parentTheme.fontSize, baseTheme.fontSize)),
        caretColor: ifUndefined(theme?.caretColor, ifUndefined(parentTheme.caretColor, baseTheme.caretColor)),
        background: ifUndefined(theme?.background, ifUndefined(parentTheme.background, baseTheme.background)),
        color: ifUndefined(theme?.color, ifUndefined(parentTheme.color, baseTheme.color)),
        borderTop: getBorder(theme?.borderTop, border),
        borderBottom: getBorder(theme?.borderBottom, border),
        borderLeft: getBorder(theme?.borderLeft, border),
        borderRight: getBorder(theme?.borderRight, border),
    }
}

function completeSubThemeActive(theme: SubThemeActive | undefined, parentTheme: SubThemeActive, baseTheme: CompleteSubThemeActive): CompleteSubThemeActive {
    const subTheme = completeSubTheme(theme, parentTheme, baseTheme);
    return {
        ...subTheme,
        active: completeSubTheme(theme?.active, subTheme, baseTheme.active),
    }
}

function completeTheme(theme: Theme): CompleteTheme {
    theme = {name: '<no name provided>', dark: true, ...theme}
    const baseTheme: CompleteTheme = theme.dark ? baseThemes.dark : baseThemes.light;
    return {
        name: theme.name,
        dark: theme.dark,
        ...completeSubTheme(theme, theme, baseTheme),
        editor: completeSubTheme(theme.editor, theme, baseTheme.editor),
        lineNumber: completeSubThemeActive(theme.lineNumber, theme, baseTheme.lineNumber),
        selection: {...completeSubTheme(theme.selection, theme, baseTheme.selection), ...{color: 'unset'}},
        selectionMatch: completeSubTheme(theme.selectionMatch, theme, baseTheme.selectionMatch),
        foldText: ifUndefined(theme.foldText, baseTheme.foldText),
        fold: completeSubTheme(theme.fold, theme, baseTheme.fold),
        topBar: completeSubTheme(theme.topBar, theme, baseTheme.topBar),
        tab: completeSubThemeActive(theme.tab, theme, baseTheme.tab),
        tokenColors: theme.tokenColors === undefined ? baseTheme.tokenColors : {...baseTheme.tokenColors, ...theme.tokenColors},
        bracketColors: ifUndefined(theme.bracketColors, baseTheme.bracketColors),
        settings: completeSubTheme(theme.settings, theme, baseTheme.settings),
        button: completeSubThemeActive(theme.button, theme, baseTheme.button),
        textInput: completeSubThemeActive(theme.textInput, theme, baseTheme.textInput),
        numberInput: completeSubThemeActive(theme.numberInput, theme, baseTheme.numberInput),
        checkboxInput: completeSubThemeActive(theme.checkboxInput, theme, baseTheme.checkboxInput),
        css: ifUndefined(theme.css, baseTheme.css),
    }
}

function createThemeExtension(theme: CompleteTheme, {doSyntaxHighlighting}: {doSyntaxHighlighting?: boolean}): Extension[] {
    let tokenSettings: {tag: Tag | Tag[], [key: string]: any}[] = [];
    for (const [key, value] of Object.entries(theme.tokenColors)) {
        try {
            let tag: Tag | Tag[] = Function(`'use strict';${tagDeconstructor};return ${key};`).bind(tags)();
            if (tag == null) tag = tags.null;
            if (typeof value == 'string') {
                tokenSettings.push({ tag: tag, color: value });
            } else {
                tokenSettings.push({ tag: tag, ...value });
            }
        } catch (error) {
            console.warn(`Invalid key in tokenColors:\nkey: \`${key}\`\ncode: \`'use strict';${tagDeconstructor}return ${key};\`\nerror: ${error}`);
        }
    }
    let out: Extension[] = [
        EditorView.theme({
            '.cm-activeLine': {backgroundColor: 'unset!important'},
            '.cm-changedText': {backgroundSize: '100%!important'},
        }, {dark: theme.dark}),
    ]
    if (doSyntaxHighlighting) {
        out.push(syntaxHighlighting(HighlightStyle.define(tokenSettings)));
    }
    return out;
}

function generateSubThemeCSS(selector: string, theme: CompleteSubTheme): string {
    selector = selector.replace(/\$/g, '.editor-editor .cm-editor');
    if (selector.startsWith('%')) {
        selector = selector.slice(1);
    } else {
        selector = '.editor-wrapper :is(' + selector + ')';
    }
    return `
        ${selector} {
            font-family: ${theme.fontFamily};
            font-size: ${theme.fontSize};
            caret-color: ${theme.caretColor};
            background-color: ${theme.background};
            color: ${theme.color};
            border-top: ${theme.borderTop};
            border-bottom: ${theme.borderBottom};
            border-left: ${theme.borderLeft};
            border-right: ${theme.borderRight};
        }
    `;
}

function generateThemeCSS(theme: CompleteTheme): string {
    return `
        ${generateSubThemeCSS('.editor-wrapper-wrapper, $.cm-content', theme)}
        ${generateSubThemeCSS('$', theme.editor)}
        ${generateSubThemeCSS('$ .cm-gutters, $ .cm-gutter', theme.lineNumber)}
        ${generateSubThemeCSS('$ .cm-activeLineGutter', theme.lineNumber.active)}
        ${generateSubThemeCSS('$.cm-focused .cm-selectionBackground, ::selection', theme.selection)}
        ${generateSubThemeCSS('$ .cm-selectionMatch', theme.selectionMatch)}
        ${generateSubThemeCSS('$ .cm-foldPlaceholder', theme.fold)}
        ${generateSubThemeCSS('.editor-top-bar', theme.topBar)}
        ${generateSubThemeCSS('.editor-tab-bar, .editor-tab', theme.tab)}
        ${generateSubThemeCSS('.editor-active-tab', theme.tab.active)}
        ${generateSubThemeCSS('.editor-settings-wrapper, .editor-setting, .editor-tab-panel:has(> .editor-settings-wrapper)', theme.settings)}
        ${generateSubThemeCSS('button', theme.button)}
        ${generateSubThemeCSS('button:hover', theme.button.active)}
        ${generateSubThemeCSS(':is(input[type=text], input[type=password], input[type=email])', theme.textInput)}
        ${generateSubThemeCSS('input[type=number]', theme.numberInput)}
        ${generateSubThemeCSS('input[type=checkbox]', theme.checkboxInput)}
        ${generateSubThemeCSS('input[type=checkbox]:checked', theme.checkboxInput.active)}
        ${theme.css}
    `;
}

export {
    SubTheme,
    SubThemeActive,
    Theme,
    CompleteSubTheme,
    CompleteSubThemeActive,
    CompleteTheme,
    resolveTheme,
    completeTheme,
    createThemeExtension,
    generateThemeCSS,
}
