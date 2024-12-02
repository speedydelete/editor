
import React from 'react'
import type {Theme, CompleteTheme} from './themes'
import {type Settings, type SettingsKey, type SettingsValue, defaultSettings, localStorageSaver, localStorageLoader} from './settings'
import {type SimpleConfig, type SimpleDualConfig, SimpleCodeEditor, SimpleDualCodeEditor} from './simple_editor'
import {type ComplexConfig, ComplexCodeEditor} from './complex_editor'
import './style.css'

export {
    SimpleConfig,
    SimpleDualConfig,
    ComplexConfig,
    Theme,
    CompleteTheme,
    Settings,
    SettingsKey,
    SettingsValue,
    defaultSettings,
    localStorageSaver,
    localStorageLoader,
    SimpleCodeEditor,
    SimpleDualCodeEditor,
    ComplexCodeEditor,
}
