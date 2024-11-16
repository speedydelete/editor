
import {type Theme, resolveTheme} from './themes'

interface Settings {
    version: number,
    tabSize: number,
    theme: Theme,
    vim: boolean,
    emacs: boolean,
    syntaxHighlighting: boolean,
    collapseUnchanged: boolean,
    highlightSpecialChars: boolean,
    drawSelection: boolean,
    multipleSelections: boolean,
    rectangularSelection: boolean,
    dropCursor: boolean,
    highlightSelectionMatches: boolean,
    lineNumbers: boolean,
    highlightActiveLineGutter: boolean,
    history: boolean,
    indentOnInput: boolean,
    bracketMatching: boolean,
    closeBrackets: boolean,
    autocompletion: boolean,
    indentWithTab: boolean,
    bracketPairColorization: boolean,
    codeFolding: boolean,
    search: boolean,
    lint: boolean,
}

const defaultSettings: Settings = {
    version: 1,
    tabSize: 2,
    theme: resolveTheme('vscode'),
    vim: false,
    emacs: false,
    syntaxHighlighting: true,
    collapseUnchanged: true,
    highlightSpecialChars: true,
    drawSelection: true,
    multipleSelections: true,
    rectangularSelection: true,
    dropCursor: true,
    highlightSelectionMatches: true,
    lineNumbers: true,
    highlightActiveLineGutter: true,
    history: true,
    indentOnInput: true,
    bracketMatching: true,
    closeBrackets: true,
    autocompletion: true,
    indentWithTab: true,
    bracketPairColorization: true,
    codeFolding: true,
    search: true,
    lint: true,
}

function saveSettings(settings: Settings): void {
    localStorage.setItem('ww-editor-settings', JSON.stringify(settings));
}

function loadSettings(): Settings {
    const storedSettings = localStorage.getItem('ww-editor-settings');
    if (storedSettings) {
        return JSON.parse(storedSettings);
    } else {
        return defaultSettings;
    }
}

function convertTabSize(value: string, oldSize: number, newSize: number): string {
    return value.replace(/\t/g, ' '.repeat(oldSize)).split('\n').map(
        (line) => {
            const extra: number = line.length - line.trimStart().length;
            return ' '.repeat(newSize * extra / oldSize) + line.slice(extra);
        }
    ).join('\n');
}

export {
    Settings,
    defaultSettings,
    saveSettings,
    loadSettings,
    convertTabSize,
}
