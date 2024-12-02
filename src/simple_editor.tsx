
import React from 'react'
import CodeMirror from '@uiw/react-codemirror'
import {EditorView} from 'codemirror'
import {EditorState, type Extension} from '@codemirror/state'
import {indentUnit, indentOnInput, bracketMatching, foldKeymap, codeFolding} from '@codemirror/language'
import {keymap, ViewPlugin, ViewUpdate, Decoration, DecorationSet, crosshairCursor, highlightSpecialChars,
        drawSelection, rectangularSelection, dropCursor, highlightActiveLine, highlightActiveLineGutter, lineNumbers} from '@codemirror/view'
import {defaultKeymap, history, historyKeymap, indentWithTab} from '@codemirror/commands'
import {searchKeymap, highlightSelectionMatches} from '@codemirror/search';
import {autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap} from '@codemirror/autocomplete'
import {lintKeymap} from '@codemirror/lint'
// import {html} from '@codemirror/lang-html'
import {javascript} from '@codemirror/lang-javascript'
import CodeMirrorMerge from 'react-codemirror-merge'
import {type CompleteTheme, completeTheme, createThemeExtension} from './themes'
import {type Settings, convertTabSize, defaultSettings} from './settings'
import {vim} from '@replit/codemirror-vim'
import {emacs} from '@replit/codemirror-emacs'

/* This function was created by Erik Newland (https://github.com/eriknewland/) and modified by speedydelete.
It is licensed under the MIT license (https://choosealicense.com/licenses/mit/)*/
function bracketPairColorization(colors: string[]): Extension[] {
    return [
        ViewPlugin.fromClass(class {
            decorations: DecorationSet;
            openingBrackets: string[] = ['(', '[', '{'];
            closingBrackets: string[] = [')', ']', '}'];
            matchingBrackets: {[key: string]: string} = {')': '(', ']': '[', '}': '{'}
            constructor(view: EditorView) {
                this.decorations = this.getBracketDecorations(view);
            }
            update(update: ViewUpdate): void {
                if (update.docChanged || update.selectionSet || update.viewportChanged) {
                    this.decorations = this.getBracketDecorations(update.view);
                }
            }
            getBracketDecorations(view: EditorView): DecorationSet {
                const {doc} = view.state;
                const decorations: any[] = [];
                const stack: {type: string, from: number}[] = [];
                for (let pos = 0; pos < doc.length; pos++) {
                    const char = doc.sliceString(pos, pos + 1);
                    if (this.openingBrackets.includes(char)) {
                        stack.push({type: char, from: pos});
                    } else if (this.closingBrackets.includes(char)) {
                        const open = stack.pop();
                        if (open && open.type === this.matchingBrackets[char]) {
                            const colorNum = stack.length % colors.length;
                            decorations.push(
                                Decoration.mark({ class: `cm-bpc-${colorNum}` }).range(open.from, open.from + 1),
                                Decoration.mark({ class: `cm-bpc-${colorNum}` }).range(pos, pos + 1),
                            );
                        }
                    }
                }
                decorations.sort((a, b) => a.from - b.from || a.startSide - b.startSide);
                return Decoration.set(decorations);
            }
        }, {decorations: (v) => v.decorations}),
        EditorView.theme(Object.fromEntries(colors.map((x, i) => ['.cm-bpc-' + i, {color: x}]))),
    ]
}

function getExtensions(settings: Settings, readOnly?: boolean, lang?: Extension): Extension[] {
    const theme: CompleteTheme = completeTheme(settings.theme);
    let extensions: Extension[] = [
        highlightActiveLine(),
        EditorState.tabSize.of(settings.tabSize),
        indentUnit.of(' '.repeat(settings.tabSize)),
        createThemeExtension(theme, {doSyntaxHighlighting: settings.syntaxHighlighting}),
        (readOnly ? [EditorView.editable.of(false), EditorState.readOnly.of(true)] : []),
    ];
    if (settings.vim && !settings.emacs) extensions.push(vim());
    if (settings.emacs && !settings.vim) extensions.push(emacs());
    extensions.push(keymap.of(defaultKeymap));
    if (lang !== undefined) extensions.push(lang);
    if (settings.syntaxHighlighting) extensions.push(javascript());
    if (settings.highlightSpecialChars) extensions.push(highlightSpecialChars());
    if (settings.drawSelection) extensions.push(drawSelection());
    if (settings.multipleSelections) extensions.push(EditorState.allowMultipleSelections.of(true));
    if (settings.rectangularSelection) extensions.push([rectangularSelection(), crosshairCursor()]);
    if (settings.dropCursor) extensions.push(dropCursor());
    if (settings.highlightSelectionMatches) extensions.push(highlightSelectionMatches());
    if (settings.lineNumbers) extensions.push(lineNumbers());
    if (settings.highlightActiveLineGutter) extensions.push(highlightActiveLineGutter());
    if (settings.history) extensions.push([history(), keymap.of(historyKeymap)]);
    if (settings.indentOnInput) extensions.push(indentOnInput());
    if (settings.bracketMatching) extensions.push(bracketMatching());
    if (settings.closeBrackets) extensions.push([closeBrackets(), keymap.of(closeBracketsKeymap)]);
    if (settings.autocompletion) extensions.push([autocompletion(), keymap.of(completionKeymap)]);
    if (settings.codeFolding) extensions.push([codeFolding({placeholderText: theme.foldText}), keymap.of(foldKeymap)]);
    if (settings.bracketPairColorization && settings.syntaxHighlighting) extensions.push(bracketPairColorization(theme.bracketColors));
    if (settings.search) extensions.push(keymap.of(searchKeymap));
    if (settings.indentWithTab) extensions.push(keymap.of([indentWithTab]));
    if (settings.lint) extensions.push(keymap.of(lintKeymap));
    return extensions;
}

interface SimpleConfig {
    settings?: Settings,
    value?: string,
    readOnly?: boolean,
    lang?: Extension | Extension[],
    onChange?: (value: string, viewUpdate: ViewUpdate) => void,
}

interface SimpleDualConfig extends SimpleConfig {
    oldValue?: string,
    showChanges?: boolean,
}

function SimpleCodeEditor({config, ...props}: {config: SimpleConfig}) {
    let {settings, value, readOnly, lang, onChange} = config;
    if (settings === undefined) settings = defaultSettings;
    value = value === undefined ? '' : convertTabSize(value, 2, settings.tabSize);
    return (
        <div className='editor' {...props}>
            <CodeMirror value={value} extensions={getExtensions(settings, readOnly, lang)} onChange={onChange} />
        </div>
    );
}

function SimpleDualCodeEditor({config, ...props}: {config: SimpleDualConfig}) {
    let {settings, value, oldValue, showChanges, readOnly, lang, onChange} = config;
    if (settings === undefined) settings = defaultSettings;
    if (showChanges === undefined) showChanges = true;
    value = value === undefined ? '' : convertTabSize(value, 2, settings.tabSize);
    oldValue = oldValue === undefined ? '' : convertTabSize(oldValue, 2, settings.tabSize);
    return (
        <div className='editor dual-editor' {...props}>
            {!showChanges && 
                <CodeMirror value={value} extensions={getExtensions(settings, readOnly, lang)} onChange={onChange} />
            }
            {showChanges && 
                <CodeMirrorMerge destroyRerender={false} collapseUnchanged={settings.collapseUnchanged ? {} : undefined}>
                    <CodeMirrorMerge.Original value={value} extensions={getExtensions(settings, true, lang)} />
                    <CodeMirrorMerge.Modified value={oldValue} extensions={getExtensions(settings, readOnly, lang)} onChange={onChange} />
                </CodeMirrorMerge>
            }
        </div>
    );
}

export {
    SimpleConfig,
    SimpleDualConfig,
    SimpleCodeEditor,
    SimpleDualCodeEditor,
}
