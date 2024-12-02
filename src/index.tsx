
import React from 'react'
import type {Theme, CompleteTheme} from './themes'
import {type Settings, defaultSettings, loadSettings} from './settings'
import {type SimpleConfig, type SimpleDualConfig, SimpleCodeEditor, SimpleDualCodeEditor} from './simple_editor'
import {type ComplexConfig, ComplexCodeEditor} from './complex_editor'
import './style.css'

function CodeEditor({config, ...props}: {config: SimpleConfig}) {
    return (
        <SimpleCodeEditor
            config={config}
            {...props}
        />
    );
}

CodeEditor.Complex = ComplexCodeEditor;
CodeEditor.Simple = SimpleCodeEditor;
CodeEditor.SimpleDual = SimpleDualCodeEditor;
CodeEditor.defaultSettings = defaultSettings;
CodeEditor.loadSettings = loadSettings;

export default CodeEditor;
export {
    CodeEditor,
    SimpleConfig,
    SimpleDualConfig,
    ComplexConfig,
    SimpleCodeEditor,
    SimpleDualCodeEditor,
    ComplexCodeEditor,
    Theme,
    CompleteTheme,
    Settings,
    defaultSettings,
    loadSettings,
}
