import {parse, getAttributeNames, getAttribute} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("query attributes", () => {
    const html = '<html lang="English" class="wrapper main-page" hidden></html>';
    const ast = parse(html);
    const element = ast.children[0];

    it("attribute names", () => {
        const names = getAttributeNames(element);
        equal(names[0], "lang"  );
        equal(names[1], "class" );
        equal(names[2], "hidden");
    });

    it("attribute value", () => {
        equal(getAttribute(element, "lang"  ), "English");
        equal(getAttribute(element, "class" ), "wrapper main-page");
        equal(getAttribute(element, "hidden"), "");
    });
});
