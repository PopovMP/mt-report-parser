import {parse, getClassName, getClassList} from "../index.js";

import {describe, it} from "node:test";
import {equal} from "node:assert";

describe("query class", () => {
    const html = '<html lang="English" class="wrapper main-page" hidden></html>';
    const ast = parse(html);
    const element = ast.children[0];

    it("classname", () => {
        const className = getClassName(element);
        equal(className, "wrapper main-page");
    });

    it("class list", () => {
        const classList = getClassList(element);
        equal(classList[0], "wrapper");
        equal(classList[1], "main-page");
    });
});
