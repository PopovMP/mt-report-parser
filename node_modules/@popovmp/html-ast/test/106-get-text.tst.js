import {parse, getText} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("106-get-text", () => {
    it("getText", () => {
        const html = `
                <!DOCTYPE html>
                <html lang="en">
                  <body>
                    <p>some text <b>bold text</b> <!-- comment --> other text <i> italic text </i></p>
                  </body>
                </html>`;
        const ast = parse(html);
        const p   = ast.children[0].children[0].children[0];

        const actual = getText(p);
        equal(actual, "some text bold text other text italic text");
    });
});
