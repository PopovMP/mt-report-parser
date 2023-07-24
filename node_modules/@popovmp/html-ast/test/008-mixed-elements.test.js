import {parse} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("008-mixed-elements", () => {
    it('Parse mixed elements', () => {
        const html = `
                <!DOCTYPE html>
                <html lang="en">
                  <body>
                    <p>some text <b>bold text</b> <!-- comment --> other text <i> italic text </i></p>
                  </body>
                </html>`;
        const ast = parse(html);
        const p  = ast.children[0].children[0].children[0];

        const someText = p.children[0];
        equal(someText.tagName, "#text");
        equal(someText.text, "some text");

        const boldText = p.children[1];
        equal(boldText.tagName, "b");
        equal(boldText.children[0].text, "bold text");

        const otherText = p.children[2];
        equal(otherText.tagName, "#text");
        equal(otherText.text, "other text");

        const italicText = p.children[3];
        equal(italicText.tagName, "i");
        equal(italicText.children[0].text, "italic text");
    });
});
