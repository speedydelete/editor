
import {convertTabSize} from './settings'

// function beautifyJSON(input: string, tabSize: number = 2): string {
//     let tokens: string[] = [];
//     let buffer: string = ''; // Temporary buffer to accumulate tokens
//     function flushBuffer(): void {
//         if (buffer) {
//             tokens.push(buffer.trim());
//             buffer = '';
//         }
//     }
//     for (let i: number = 0; i < input.length; i++) {
//         const char: string = input[i];
//         if ('[]{},:'.includes(char)) {
//             flushBuffer();
//             tokens.push(char); // Add special JSON characters directly
//         } else if (char === '"' || char === "'") {
//             let end: number = i + 1;
//             while (end < input.length && input[end] !== char) {
//                 if (input[end] === '\\' && end + 1 < input.length) end++; // Skip escaped characters
//                 end++;
//             }
//             if (end < input.length) {
//                 tokens.push(input.slice(i, end + 1)); // Include quotes and escapes
//                 i = end;
//             } else {
//                 tokens.push(input.slice(i)); // Treat as literal string if unclosed
//                 break;
//             }
//         } else if (!/\s/.test(char)) {
//             buffer += char; // Accumulate non-whitespace characters
//         } else {
//             flushBuffer(); // Handle spaces as delimiters
//         }
//     }
//     flushBuffer(); // Flush any remaining buffer
//     let out: string = ''
//     let wasKey: boolean = false;
//     let indent: string = '';
//     function addToOut(value: string): void {
//         if (wasKey) {
//             out += value;
//             wasKey = false;
//         } else {
//             out += '\n' + indent + value;
//         }
//     }
//     for (let i: number = 0; i < tokens.length; i++) {
//         const token = tokens[i]
//         if (token == '[' || token == '{') {
//             addToOut(token);
//             indent += ' ';
//         } else if (token == ']' || token == '}') {
//             indent = indent.slice(0, -1);
//             addToOut(token);
//         } else if (token == ',') {
//             out += ',';
//         } else if (token == ':') {
//             out += ': ';
//             wasKey = true;
//         } else {
//             addToOut(token);
//         }
//     }
//     out = out.replace(/\[\n\s*\]/g, '[]').replace(/\{\n\s*\}/g, '{}');
//     return convertTabSize(out, 1, tabSize);
// }

function _beautifyJSON(obj: any, indentLevel: number = 0): string {
    const indent = ' '.repeat(indentLevel);
    const innerIndent = ' '.repeat(indentLevel + 1);
    let out: string[] = [];
    if (typeof obj === 'number') {
        out.push(obj.toString());
    } else if (typeof obj === 'string') {
        out.push(JSON.stringify(obj));
    } else if (typeof obj === 'boolean') {
        out.push((obj ? 'true' : 'false'));
    } else if (Array.isArray(obj)) {
        if (obj.length == 0) {
            out.push('[]');
        } else {
            out.push('[');
            for (const item of obj) {
                out.push(innerIndent + _beautifyJSON(item, indentLevel + 1) + ',');
            }
            out[out.length - 1] = out[out.length - 1].replace(/,$/, '');
            out.push(indent + ']');
        }
    } else if (typeof obj === 'object') {
        if (obj.length == 0) {
            out.push('{}');
        } else {
            out.push('{');
            const entries = Object.entries(obj);
            for (const [key, value] of entries) {
                out.push(innerIndent + JSON.stringify(key.toString()) + ': ' + _beautifyJSON(value, indentLevel + 1) + ',');
            }
            out[out.length - 1] = out[out.length - 1].replace(/,$/, '');
            out.push(indent + '}');
        }
    } else if (obj === null) {
        out.push('null');
    } else if (obj === undefined) {
        out.push('undefined');
    } else {
        throw new TypeError(`invalid JSON object ${obj}`);
    }
    return out.join('\n');
}

function beautifyJSON(obj: string): string {
    return convertTabSize(_beautifyJSON(JSON.parse(obj)), 1, 2);
}

export {
    beautifyJSON,
}
