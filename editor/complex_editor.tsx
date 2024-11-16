
import React, {useState} from 'react'
import {TabView, TabBar, Tab, TabSpace, TabPanel} from './tabs'
import {resolveTheme, completeTheme, generateThemeCSS} from './themes'
import {type Settings, defaultSettings} from './settings'
import {SettingsMenu} from './settings_gui'
import {type SimpleConfig, SimpleDualCodeEditor} from './simple_editor'

interface ComplexConfig extends SimpleConfig {
    oldValue?: string,
    allowShowChanges?: boolean,
    handleSave?: Function,
}

function ComplexCodeEditor({className, config, ...props}: {className?: string, config: ComplexConfig}) {
    let {settings: settings_, value, oldValue, readOnly, lang, allowShowChanges, handleSave, onChange} = config;
    const settings: Settings = {...defaultSettings, ...(settings_ === undefined ? {} : settings_)};
    const theme = completeTheme(settings.theme);
    if (handleSave === undefined) handleSave = () => {};
    const [showChanges, setShowChanges] = useState(false);
    function handleShowChanges() {
        setShowChanges(!showChanges);
        return;
    }
    // console.log(generateThemeCSS(theme));
    return (
        <div className='editor-wrapper-wrapper' {...props}>
            <style>{generateThemeCSS(theme)}</style>
            <div className='editor-wrapper'>
                <div>
                    <div className='editor-top-bar'>
                        <button className='save-button' onClick={handleSave()}>Save</button>
                        <button className='show-changes-button' onClick={handleShowChanges}>
                            {!showChanges && 'Show'}{showChanges && 'Hide'} changes
                        </button>
                    </div>
                </div>
                <TabView selected='index.html'>
                    <TabBar>
                        <Tab name='index.html' />
                        <TabSpace />
                        <Tab name='settings' displayName='Settings' />
                    </TabBar>
                    <TabPanel name='index.html'>
                        <SimpleDualCodeEditor
                            config={{
                                settings: settings,
                                value: value,
                                oldValue: oldValue,
                                readOnly: readOnly,
                                showChanges: showChanges,
                                lang: lang,
                                onChange: onChange,
                            }}
                        />
                    </TabPanel>
                    <TabPanel name='settings'>
                        <SettingsMenu 
                            settings={settings}
                        />
                    </TabPanel>
                </TabView>
            </div>
        </div>
    );
}

export {
    ComplexConfig,
    ComplexCodeEditor,
}
