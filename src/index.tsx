
import React, {type ReactNode, useState, createContext, useContext} from 'react';
import type {Theme, CompleteTheme} from './themes';
import {completeTheme, generateThemeCSS} from './themes';
import type {Settings, SettingsKey, SettingsValue, Saver, Loader} from './settings';
import {defaultSettings, localStorageSaver, localStorageLoader} from './settings';
import {BaseInput, TextInput, NumberInput, CheckboxInput, CodeInput, TextSetting, NumberSetting, CheckboxSetting, CodeSetting, SettingsMenu, SimpleSettingsMenu} from './settings_gui';
import {type Config, type DualConfig, Editor as _Editor, DualEditor as _DualEditor} from './simple_editor';
import {Tab, TabSpace, TabBar, TabPanel, TopBar, TabView} from './tabs';
import './style.css';

function _Wrapper({config, children, ...props}: {config: Config | DualConfig, children: ReactNode}): ReactNode {
    return (
        <div className='editor-wrapper' {...props}>
            <style>{generateThemeCSS(completeTheme(config.settings.theme))}</style>
            {children}
        </div>
    );
}

function Editor({config, ...props}: {config: Config}): ReactNode {
    return (
        <_Wrapper config={config} {...props}>
            <_Editor config={config}></_Editor>
        </_Wrapper>
    );
}

function DualEditor({config, ...props}: {config: DualConfig}): ReactNode {
    return (
        <_Wrapper config={config} {...props}>
            <_DualEditor config={config}></_DualEditor>
        </_Wrapper>
    );
}

const ShowChangesContext: React.Context<[boolean, React.Dispatch<React.SetStateAction<boolean>>]> = createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>([false, () => {}]);

const ConfigContext: React.Context<[Config | DualConfig, React.Dispatch<React.SetStateAction<Config | DualConfig>>]> = createContext<[Config | DualConfig, React.Dispatch<React.SetStateAction<Config | DualConfig>>]>([{}, () => {}]);

function TabbedEditor({config, selected, children, ...props}: {config: Config | DualConfig, selected?: string, children: ReactNode}): ReactNode {
    const [showChanges, setShowChanges] = useState(false);
    const [stateConfig, setConfig] = useState(config);
    const theme = completeTheme(config.settings.theme);
    return (
        <_Wrapper config={config} {...props}>
            <ConfigContext.Provider value={[stateConfig, setConfig]}>
                <ShowChangesContext.Provider value={[showChanges, setShowChanges]}>
                    <TabView selected={selected}>{children}</TabView>
                </ShowChangesContext.Provider>
            </ConfigContext.Provider>
        </_Wrapper>
    );
}

function EditorPanel({name, ...props}: {name: string}): ReactNode {
    return (
        <TabPanel name={name} {...props}>
            <_Editor config={useContext(ConfigContext)[0]} />
        </TabPanel>
    );
}

function DualEditorPanel({name, ...props}: {name: string}): ReactNode {
    return (
        <TabPanel name={name} {...props}>
            <_DualEditor config={{...useContext(ConfigContext)[0], showChanges: useContext(ShowChangesContext)[0]}} />
        </TabPanel>
    );
}

function SettingsPanel({name, settings, saver, children, ...props}: {name: string, settings: Settings, children: ReactNode, saver: Saver}): ReactNode {
    return (
        <TabPanel name={name} {...props}>
            <SettingsMenu settings={settings} saver={saver}>{children}</SettingsMenu>
        </TabPanel>
    );
}

function SimpleSettingsPanel({name, settings, saver, ...props}: {name: string, settings: Settings, saver: Saver}): ReactNode {
    return (
        <TabPanel name={name} {...props}>
            <SimpleSettingsMenu settings={settings} saver={saver} />
        </TabPanel>
    );
}

function ShowChangesButton({shownText, hiddenText}: {shownText: ReactNode, hiddenText: ReactNode}): ReactNode {
    const [showChanges, setShowChanges] = useContext(ShowChangesContext);
    function handleClick() {
        setShowChanges(!showChanges);
    }
    return (
        <button onClick={handleClick}>
            {showChanges && shownText}
            {!showChanges && hiddenText}
        </button>
    );
}


export {
    Config,
    DualConfig,
    Theme,
    CompleteTheme,
    Settings,
    SettingsKey,
    SettingsValue,
    Saver,
    Loader,
    defaultSettings,
    localStorageSaver,
    localStorageLoader,
    Editor,
    DualEditor,
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
    Tab,
    TabSpace,
    TabBar,
    TabPanel,
    TopBar,
    TabbedEditor,
    EditorPanel,
    DualEditorPanel,
    SettingsPanel,
    SimpleSettingsPanel,
    ShowChangesButton,
}
