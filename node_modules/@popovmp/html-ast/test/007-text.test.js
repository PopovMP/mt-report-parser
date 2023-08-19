import {parse} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("text node", () => {
    it('Parse a text tag', () => {
        const html = `<!DOCTYPE html>
                        <html>
                          <body>
                            <h1> HTML to AST </h1>
                          </body>
                        </html>
        `;
        const ast = parse(html);
        const h1  = ast.children[0].children[0].children[0];
        const textElem = h1.children[0];
        equal(textElem.tagName, "#text");
        equal(textElem.text, "HTML to AST");
    });
});
