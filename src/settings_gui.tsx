
import React, {type ReactNode, useState, useEffect, createContext, useContext} from 'react'
import {json} from '@codemirror/lang-json'
import {type Settings, type SettingsKey, type SettingsValue, type SettingsSaver, defaultSettings} from './settings'
import {Editor, Config} from './editor'

const SettingsContext: React.Context<[Settings, React.Dispatch<React.SetStateAction<Settings>>, React.Dispatch<React.SetStateAction<Settings>>]> = createContext<[Settings, React.Dispatch<React.SetStateAction<Settings>>, React.Dispatch<React.SetStateAction<Settings>>]>([defaultSettings, () => null, () => null]);

function BaseInput({type, setting, ...props}: {type: string, setting: SettingsKey}): ReactNode {
    const [settingsObj, setSettingsObj, saver] = useContext(SettingsContext);
    const [value, setValue] = useState(settingsObj[setting]);
    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        const target = event.currentTarget;
        let newValue: SettingsValue = target.type == 'checkbox' ? target.checked : target.value;
        setValue(newValue);
        if (target.type == 'number') {
            newValue = parseFloat(String(newValue));
            if (isNaN(newValue)) return;
        }
        settingsObj[setting] = newValue;
        setSettingsObj(settingsObj);
        saver(settingsObj);
    }
    return (
        <input
            type={type}
            onChange={handleChange}
            value={typeof value == 'number' || typeof value == 'string' ? value : ''}
            checked={typeof value == 'boolean' ? value : null}
            {...props}
        />
    );
}

function TextInput({setting, ...props}: {setting: SettingsKey}): ReactNode {
    return (
        <BaseInput type='text' setting={setting} {...props} />
    );
}

function NumberInput({setting, ...props}: {setting: SettingsKey}): ReactNode {
    return (
        <BaseInput type='number' setting={setting} {...props} />
    );
}

function CheckboxInput({setting, ...props}: {setting: SettingsKey}): ReactNode {
    return (
        <BaseInput type='checkbox' setting={setting} {...props} />
    );
}

function CodeInput({setting, config, height, width, json, enforceJsonObject, ...props}:
    {setting: SettingsKey, config: Config, height?: string, width?: string, json?: boolean, enforceJsonObject?: boolean}): ReactNode {
    const [settingsObj, setSettingsObj, saver] = useContext(SettingsContext);
    const initValue = json ? JSON.stringify(settingsObj[setting], null, '  ') : settingsObj[setting];
    const [invalid, setInvalid] = useState('');
    function handleChange(value: string): void {
        if (json) {
            setInvalid('');
            try {
                const parsed = JSON.parse(value);
                console.log(parsed);
                if (enforceJsonObject && (typeof parsed != 'object' || Array.isArray(parsed) || parsed === null)) {
                    throw new SyntaxError('Input is not a JSON object');
                }
                setSettingsObj({...settingsObj, [setting]: parsed});
                saver(settingsObj);
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
        <div className='setting-input' {...props}>
            <div style={{maxHeight: height, minHeight: 0, width: width}}>
                <Editor config={{onChange: handleChange, value: initValue, ...config}} style={{overflowY: 'scroll', maxHeight: height, minHeight: 0, width: width}} />
            </div>
            <br />
            {(invalid !== '') && 
                <div style={{color: 'red'}}>{invalid}</div>
            }
        </div>
    );
}

function Setting({name, desc, children, ...props}: {name: string, desc: string, children: ReactNode}): ReactNode {
    return (
        <div className='setting' {...props}>
            <div className='setting-name'>{name}</div>
            <br />
            <span>{desc}</span>
            <br />
            <br />
            {children}
            <br />
            <br />
            <br />
        </div>
    );
}

function TextSetting({name, desc, setting, ...props}: {name: string, desc: string, setting: SettingsKey}): ReactNode {
    return (
        <Setting name={name} desc={desc} {...props}>
            <TextInput setting={setting} />
        </Setting>
    );
}

function NumberSetting({name, desc, setting, ...props}: {name: string, desc: string, setting: SettingsKey}): ReactNode {
    return (
        <Setting name={name} desc={desc} {...props}>
            <NumberInput setting={setting} />
        </Setting>
    );
}

function CheckboxSetting({name, desc, setting, ...props}: {name: string, desc: string, setting: SettingsKey}): ReactNode {
    return (
        <div className='setting' {...props}>
            <div className='setting-name'>{name}</div><br />
            <div>
                <CheckboxInput setting={setting} />
                &nbsp;
                <span>{desc}</span>
            </div>
            <br />
            <br />
            <br />
        </div>
    );
}

function CodeSetting({name, desc, setting, config, height, width, json, enforceJsonObject, ...props}:
    {name: string, desc: string, setting: SettingsKey, config: Config, height?: string, width?: string, json?: boolean, enforceJsonObject?: boolean}): ReactNode {
    return (
        <Setting name={name} desc={desc} {...props}>
            <CodeInput setting={setting} config={config} height={height} width={width} json={json} enforceJsonObject={enforceJsonObject} />
        </Setting>
    );
}

function SettingsMenu({settings, saver, title, children, ...props}: 
    {settings: Settings, saver: SettingsSaver, title?: string, children: ReactNode}): ReactNode {
    const [settingsObj, setSettingsObj] = useState(settings);
    return (
        <div className='settings-wrapper' {...props}>
            <SettingsContext.Provider value={[settingsObj, setSettingsObj, saver]}>
                {title && 
                    <>
                        <div className='settings-title'>{title}</div>
                        <br />
                        <br />
                    </>
                }
                {children}
            </SettingsContext.Provider>
        </div>
    );
}

function SimpleSettingsMenu({settings, saver, ...props}: {settings: Settings, saver: SettingsSaver}): ReactNode {
    return (
        <SettingsMenu settings={settings} saver={saver} {...props} title='Settings'>
            <NumberSetting 
                name='Tab Size'
                desc='Controls the tab size of the editor (how many spaces equal 1 indent level)'
                setting='tabSize'
            />
            <CheckboxSetting
                name='Vim Keybindings'
                desc='Enables Vim keybindings'
                setting='vim'
            />
            <CheckboxSetting
                name='Emacs Keybindings'
                desc='Enables Emacs keybindings'
                setting='emacs'
            />
            <CheckboxSetting
                name='Syntax Highlighting'
                desc='Whether to highlight code based on what it does'
                setting='syntaxHighlighting'
            />
            <CheckboxSetting
                name='Collapse Unchanged'
                desc='Whether to collapse unchanged lines when changes are shown'
                setting='collapseUnchanged'
            />
            <CheckboxSetting
                name='Line Wrapping'
                desc='Whether to enable line wrapping'
                setting='lineWrapping'
            />
            <CheckboxSetting
                name='Highlight Special Characters'
                desc='Whether to highlight various special characters'
                setting='highlightSpecialChars'
            />
            <CheckboxSetting
                name='Draw Selection'
                desc='Whether to enable drawing of selection of text'
                setting='drawSelection'
            />
            <CheckboxSetting
                name='Multiple Selections'
                desc='Whether to enable multiple selections'
                setting='multipleSelections'
            />
            <CheckboxSetting
                name='Rectangular Selection'
                desc='Whether to enable rectangular selections'
                setting='rectangularSelection'
            />
            <CheckboxSetting
                name='Drop Cursor'
                desc='Whether to enable a drop cursor'
                setting='dropCursor'
            />
            <CheckboxSetting
                name='Highlight Selection Matches'
                desc='Whether to highlight selection matches'
                setting='highlightSelectionMatches'
            />
            <CheckboxSetting
                name='Highlight Active Line Number'
                desc='Whether to highlight the active line number'
                setting='highlightActiveLineGutter'
            />
            <CheckboxSetting
                name='Undo/Redo'
                desc='Whether to enable undoing/redoing'
                setting='history'
            />
            <CheckboxSetting
                name='Autoindent'
                desc='Whether to automatically indent'
                setting='indentOnInput'
            />
            <CheckboxSetting
                name='Highlight Matching Brackets'
                desc='Whether to highlight brackets that match the bracket the cursor is on'
                setting='bracketMatching'
            />
            <CheckboxSetting
                name='Auto-close Brackets'
                desc='Whether to automatically close brackets'
                setting='closeBrackets'
            />
            <CheckboxSetting
                name='Autocompletion'
                desc='Whether to do autocompletion'
                setting='autocompletion'
            />
            <CheckboxSetting
                name='Indent With Tab'
                desc='Whether to enable indentation with tab'
                setting='indentWithTab'
            />
            <CheckboxSetting
                name='Bracket Pair Colorization'
                desc='Whether to enable bracket pair colorization (matching brackets have the same color, brackets are colored by nesting level)'
                setting='bracketPairColorization'
            />
            <CheckboxSetting
                name='Code Folding'
                desc='Whether to enable code folding'
                setting='codeFolding'
            />
            <CheckboxSetting
                name='Search'
                desc='Whether to enable search'
                setting='search'
            />
            <CheckboxSetting
                name='Linting'
                desc='Whether to enable code linting'
                setting='lint'
            />
            <CodeSetting
                name='Theme'
                desc='Custom theme settings, do not change the code unless you know what you are doing.'
                config={{lang: json(), settings: settings}}
                setting='theme'
                height='500px'
                width='500px'
                json={true}
                enforceJsonObject={true}
            />
            {/* <button onClick={() => applySettings(initialSettings, settings)}>Apply</button> */}
            <div style={{color: '#dddddd', marginBottom: '125px'}}>
                Editor v1.1.0 | <a href="https://github.com/speedydelete/editor">GitHub</a>
                <br />
                Created by <a href={window.location.hostname.includes('wildwest.gg') ? 'https://www.wildwest.gg/u/speedydelete' : 'https://speedydelete.com/'}>speedydelete</a>
            </div>
        </SettingsMenu>
    );
}

export {
    BaseInput,
    TextInput,
    NumberInput,
    CheckboxInput,
    CodeInput,
    TextSetting,
    NumberSetting,
    CheckboxSetting,
    CodeSetting,
    SettingsMenu,
    SimpleSettingsMenu,
}
