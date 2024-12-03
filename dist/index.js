
import React, {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {
    TabbedEditor,
    TopBar,
    ShowChangesButton,
    Tab,
    TabBar,
    TabSpace,
    DualEditorPanel,
    SimpleSettingsPanel,
    localStorageSaver,
    localStorageLoader,
} from '../src'
import {html} from '@codemirror/lang-html'

const testText = `<!DOCTYPE html>
<html>
  <head>
    <meta charset='utf-8'>
    <!-- this is a comment -->
    <style>

body {
  background-color: #649bed;
  color: white;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
}

    </style>
  </head>
  <body>
    <div>if you see this, there is a problem</div>
    <div>const x = 1</div>
    <script>

window.addEventListener('load', function() {
  document.querySelector('div').innerHTML = 'hi';
  let x = 5;
  x = String('abcd');
  x.y = 5 + 'z';
  x = /foo/g;
  for (const item of ['foo', 'bar', 'baz']) {
    alert(item);
  }
});

    </script>
  </body>
</html>`;

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
const settings = localStorageLoader('editor-settings')();
root.render(
    <StrictMode>
        <TabbedEditor config={{
            value: testText,
            lang: html(),
            settings: localStorageLoader('editor-settings')(),
        }} selected='index.html'>
            <TopBar>
                <button onClick={localStorageSaver('editor-settings')}>Save</button>
                <ShowChangesButton shownText='Hide changes' hiddenText='Show changes' />
            </TopBar>
            <TabBar>
                <Tab name='index.html' />
                <TabSpace />
                <Tab name='settings' displayName='Settings' />
            </TabBar>
            <DualEditorPanel name='index.html' config={{
                value: testText,
                lang: html(),
                settings: settings,
            }} />
            <SimpleSettingsPanel name='settings' settings={settings} />
        </TabbedEditor>
    </StrictMode>
);
