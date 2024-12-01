
import React, {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import CodeEditor from '../editor'
import {html} from '@codemirror/lang-html'

const testText = `<!DOCTYPE html>
<html>
  <head>
    <meta charset='utf-8'>
    <!-- this is not a comment -->
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
root.render(
    <StrictMode>
        <style>{`
            body, #root {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
            }
        `}</style>
        <CodeEditor.Complex config={{
            value: testText,
            lang: html(),
            settings: CodeEditor.loadSettings()
		}} />
    </StrictMode>
);
