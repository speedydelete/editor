
import React, {useState} from 'react'
import {json} from '@codemirror/lang-json'
import {type Settings, saveSettings} from './settings'
import {SimpleCodeEditor, SimpleConfig} from './simple_editor'
import {beautifyJSON} from './beautifier'

type Element = React.JSX.Element;

function InputSetting({type, name, desc, settingsKey, settingsObj, ...props}: 
    {type: string, name: string, desc: string, settingsKey: string, settingsObj: Settings}) {
    const id = 'editor-setting-input-' + settingsKey;
    const [value, setValue] = useState(settingsObj[settingsKey]);
    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        setValue(event.target.value);
        settingsObj[settingsKey] = event.currentTarget.value;
        saveSettings(settingsObj);
    }
    return (
        <div className={' editor-setting editor-setting-' + type} {...props}>
            <div className='editor-setting-name'>{name}</div>
            <br />
            {desc}
            <br />
            <br />
            <input
                className='editor-setting-input'
                type={type}
                id={id}
                onChange={handleChange}
                value={value}
            />
            <br />
            <br />
            <br />
        </div>
    );
}

function resetDefaultButton({settingsKey, settingsObj, ...props}: {settingsKey: string, settingsObj: Settings}): null {
    return (
        null
    );
}

function TextSetting({name, desc, settingsKey, settingsObj, ...props}: 
    {name: string, desc: string, settingsKey: string, settingsObj: Settings}) {
    return (
        <InputSetting type='text' name={name} desc={desc} settingsKey={settingsKey} settingsObj={settingsObj} {...props} />
    );
}

function NumberSetting({name, desc, settingsKey, settingsObj, ...props}: 
    {name: string, desc: string, settingsKey: string, settingsObj: Settings}) {
    return (
        <InputSetting type='number' name={name} desc={desc} settingsKey={settingsKey} settingsObj={settingsObj} {...props} />
    );
}

function CheckboxSetting({name, desc, settingsKey, settingsObj, ...props}: 
    {name: string, desc: string, settingsKey: string, settingsObj: Settings}) {
    const id = 'editor-setting-input-' + settingsKey;
    const [checked, setChecked] = useState(settingsObj[settingsKey]);
    function handleChange(e) {
        setChecked(!e.target.checked);
        settingsObj[settingsKey] = e.target.checked;
        saveSettings(settingsObj);
    }
    return (
        <div className=' editor-setting editor-setting-checkbox' {...props}>
            <div className='editor-setting-name'>{name}</div><br />
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <input
                    className='editor-setting-input'
                    type='checkbox'
                    id={id}
                    onChange={handleChange}
                    defaultChecked={checked}
                />&nbsp;
                <span>{desc}</span>
            </div>
            <br />
            <br />
            <br />
        </div>
    );
}

function CodeSetting({name, desc, config, settingsKey, settingsObj, width, json, ...props}:
    {name: string, desc: string | Element, config: SimpleConfig, settingsKey: string, settingsObj: Settings, width: string, json?: boolean}) {
    const initValue = json ? beautifyJSON(JSON.stringify(settingsObj[settingsKey])) : settingsObj[settingsKey];
    const [invalid, setInvalid] = useState('');
    function handleChange(value: string): void {
        if (json) {
            setInvalid('');
            try {
                settingsObj[settingsKey] = JSON.parse(value);
                saveSettings(settingsObj);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    const msg = error.message.replace('JSON.parse: ', '');
                    setInvalid(msg.charAt(0).toUpperCase() + msg.slice(1));
                    return;
                } else {
                    throw error;
                }
            }
        }
    }
    return (
        <div className='editor-setting editor-setting-code' {...props}>
            <div className='editor-setting-name'>{name}</div>
            <br />
            {desc}
            <br />
            <br />
            <div style={{width: width}}>
                <SimpleCodeEditor config={{onChange: handleChange, value: initValue, ...config}} />
            </div>
            <br />
            {(invalid !== '') && 
                <div style={{color: 'red'}}>{invalid}</div>
            }
            <br />
            <br />
        </div>
    );
}

function SettingsMenu({settings, ...props}: {className?: string, settings: Settings}) {
    const initialSettings = JSON.parse(JSON.stringify(settings));
    return (
        <div className='editor-settings-wrapper' {...props}>
            <div className='editor-settings-title'>Settings</div>
            <br />
            <br />
            <NumberSetting 
                name='Tab Size'
                desc='Controls the tab size of the editor (how many spaces equal 1 indent level)'
                settingsKey='tabSize'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Vim Keybindings'
                desc='Enables Vim keybindings'
                settingsKey='vim'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Emacs Keybindings'
                desc='Enables Emacs keybindings'
                settingsKey='emacs'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Syntax Highlighting'
                desc='Whether to highlight code based on what it does'
                settingsKey='syntaxHighlighting'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Collapse Unchanged'
                desc='Whether to collapse unchanged lines when changes are shown'
                settingsKey='collapseUnchanged'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Highlight Special Characters'
                desc='Whether to highlight various special characters'
                settingsKey='highlightSpecialChars'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Draw Selection'
                desc='Whether to enable drawing of selection of text'
                settingsKey='drawSelection'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Multiple Selections'
                desc='Whether to enable multiple selections'
                settingsKey='multipleSelections'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Rectangular Selection'
                desc='Whether to enable rectangular selections'
                settingsKey='rectangularSelection'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Drop Cursor'
                desc='Whether to enable a drop cursor'
                settingsKey='dropCursor'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Highlight Selection Matches'
                desc='Whether to highlight selection matches'
                settingsKey='highlightSelectionMatches'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Highlight Active Line Number'
                desc='Whether to highlight the active line number'
                settingsKey='highlightActiveLineGutter'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Undo/Redo'
                desc='Whether to enable undoing/redoing'
                settingsKey='history'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Autoindent'
                desc='Whether to automatically indent'
                settingsKey='indentOnInput'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Highlight Matching Brackets'
                desc='Whether to highlight brackets that match the bracket the cursor is on'
                settingsKey='bracketMatching'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Auto-close Brackets'
                desc='Whether to automatically close brackets'
                settingsKey='closeBrackets'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Autocompletion'
                desc='Whether to do autocompletion'
                settingsKey='autocompletion'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Indent With Tab'
                desc='Whether to enable indentation with tab'
                settingsKey='indentWithTab'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Bracket Pair Colorization'
                desc='Whether to enable bracket pair colorization (matching brackets have the same color, brackets are colored by nesting level)'
                settingsKey='bracketPairColorization'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Code Folding'
                desc='Whether to enable code folding'
                settingsKey='codeFolding'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Search'
                desc='Whether to enable search'
                settingsKey='search'
                settingsObj={settings}
            />
            <CheckboxSetting
                name='Linting'
                desc='Whether to enable code linting'
                settingsKey='lint'
                settingsObj={settings}
            />
            <CodeSetting
                name='Theme'
                desc={<span>Custom theme settings (<a href='https://speedydelete.com/ww/vscode_theme.json'>default value</a>).</span>}
                config={{lang: json(), settings: settings}}
                settingsKey='theme'
                settingsObj={settings}
                width='100%'
                json={true}
            />
            {/* <button onClick={() => applySettings(initialSettings, settings)}>Apply</button> */}
            <div style={{color: '#dddddd'}}>
                Editor v1.1.0 | <a href="https://github.com/speedydelete/editor">GitHub</a>
                <br />
                Created by <a href={window.location.hostname.includes('wildwest.gg') ? 'https://www.wildwest.gg/u/speedydelete' : 'https://speedydelete.com/'}>speedydelete</a>
            </div>
            <br />
            <br />
            <br />
            <br />
        </div>
    );
}

export {
    SettingsMenu,
}
