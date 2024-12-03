
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

type SettingsKey = keyof Settings;
type SettingsValue = Settings[SettingsKey];

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

function convertTabSize(value: string, oldSize: number, newSize: number): string {
    return value.replace(/\t/g, ' '.repeat(oldSize)).split('\n').map(
        (line) => {
            const extra: number = line.length - line.trimStart().length;
            return ' '.repeat(newSize * extra / oldSize) + line.slice(extra);
        }
    ).join('\n');
}

type Saver = (settings: Settings) => void;
type Loader = () => Settings;

function localStorageSaver(key: string): Saver {
    return (settings: Settings): void => {
        localStorage.setItem(key, JSON.stringify(settings));
    }
}

function localStorageLoader(key: string): Loader {
    return (): Settings => {
        if (key in localStorage) {
            return JSON.parse(localStorage.getItem(key));
        } else {
            return defaultSettings;
        }
    }
}

export {
    Settings,
    SettingsKey,
    SettingsValue,
    Saver,
    Loader,
    defaultSettings,
    convertTabSize,
    localStorageSaver,
    localStorageLoader,
}
