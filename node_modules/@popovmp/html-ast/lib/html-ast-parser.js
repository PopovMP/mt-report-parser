/**
 * @typedef {Object} ASTElement
 *
 * @property {string}           tagName
 * @property {{string: string}} attributes
 * @property {ASTElement[]}     children
 * @property {string}           text
 */

/**
 * All HTML tags
 * @type {string[]}
 */
const htmlTags = [
    "!doctype", "a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base",
    "basefont", "bdi", "bdo", "bgsound", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption",
    "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details",
    "dfn", "dir", "div", "dl", "dt", "element", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer",
    "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i",
    "iframe", "img", "input", "ins", "isindex", "kbd", "keygen", "label", "legend", "li", "link", "listing", "main",
    "map", "mark", "marquee", "menu", "menuitem", "meta", "meter", "nav", "nobr", "noframes", "noscript", "object",
    "ol", "optgroup", "option", "output", "p", "param", "plaintext", "pre", "progress", "q", "rp", "rt", "ruby", "s",
    "samp", "script", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style",
    "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title",
    "tr", "track", "tt", "u", "ul", "var", "video", "wbr", "xmp",
];

/**
 * All void HTML tags
 * @type {string[]}
 */
const voidHtmlTags = [
    "!doctype", "area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta",
    "param", "source", "track", "wbr",
];

/**
 * Parse an HTML string into an AST
 *
 * @param {string} html - The HTML string to parse
 */
export function parse(html) {
    let pos;

    /**
     * The root of the AST
     * @type {ASTElement}
     */
    const ast = {
        tagName   : "document",
        attributes: /** @type {{string: string}} */ {},
        children  : /** @type {ASTElement[]}     */ [],
        text      : "",
    };

    pos = eatWhiteSpace(html, 0)
    pos = eatCommentIfAny(html, pos);

    // Eat DOCTYPE
    const [tagName, doctypePos] = parseTagName(html, pos+1);
    if (tagName === "!DOCTYPE") {
        pos = eatTag(html, doctypePos);
    }

    parseElements(html, pos, ast.children);

    return ast;
}

/**
 * Parse an HTML Element content from a given position in a string recursively.
 * The content can consist of text nodes, elements, and comments.
 * The HTML comments are eaten.
 * Returns the position after the parsed content.
 *
 * @param {string} str - The string to parse from
 * @param {number} pos - The position to start parsing from
 * @param {ASTElement[]} children - The parent HTML element
 * @returns {number} The position after the parsed content
 */
function parseElements(str, pos, children) {
    while (pos < str.length) {
        pos = eatWhiteSpace(str, pos);
        pos = eatCommentIfAny(str, pos);

        // Parse a text node and continue if a text node was parsed
        const posBeforeTextNode = pos;
        pos = parseTextNode(str, pos, children);
        if (pos > posBeforeTextNode) {
            // A text node was parsed
            continue;
        }

        const [tagName, startTagPos] = parseStartTag(str, pos);
        if (tagName === "") {
            break;
        }

        const [element, elemPos] = parseElement(str, startTagPos, tagName);
        children.push(element);
        pos = elemPos;
    }

    return pos;
}

/**
 * Parse an HTML Element from a given position in a string recursively.
 * Returns the parsed HTML element and the position after the end tag.
 *
 * @param {string} str     - The string to parse from
 * @param {number} pos     - The position to start parsing from
 * @param {string} tagName - Current tag name
 *
 * @returns {[ASTElement, number]}
 */
function parseElement(str, pos, tagName) {
    /** @type {ASTElement} */
    const element = {
        tagName,
        attributes: /** @type {{string: string}} */ {},
        children  : /** @type {ASTElement[]}     */ [],
        text      : "",
    };

    pos = parseAttributes(str, pos, element.attributes);

    // Parse children elements of a non-void tag
    if (!voidHtmlTags.includes(tagName.toLowerCase())) {
        pos = parseElements(str, pos, element.children);
    }

    pos = eatWhiteSpace(str, pos);

    // Parse end tag of a non-void tag
    if (!voidHtmlTags.includes(tagName.toLowerCase())) {
        const [endTagName, endTagPos] = parseEndTag(str, pos);
        pos = endTagPos;
        if (endTagName !== tagName) {
            throw new Error(`Expected end tag "${tagName}" but found "${endTagName}"`);
        }
    }

    return [element, pos];
}

/**
 * Parse HTML attributes from a given position in a string.
 * Returns the position after the start tag.
 *
 * @param {string} str - The string to parse from
 * @param {number} pos - The position to start parsing from
 * @param {{string: string}} attributes - The attribute object to add the parsed attributes to
 * @returns {number} The position after the start tag
 */
function parseAttributes(str, pos, attributes) {
    pos = eatWhiteSpace(str, pos);

    while (str[pos] !== ">") {
        const [name, value, newPos] = parseAttribute(str, pos);
        attributes[name] = value;
        pos = newPos;
    }

    // Eat the end ">" of the start tag
    return pos + 1;
}

/**
 * Parse an HTML attribute from a given position in a string.
 * Returns the attribute name, value and the position after the attribute.
 *
 * @param {string} str - The string to parse from
 * @param {number} pos - The position to start parsing from
 * @returns {[string, string, number]} The attribute name, value and the position after the attribute
 */
function parseAttribute(str, pos) {
    pos = eatWhiteSpace(str, pos);

    const [attributeName, posAfterName] = parseAttributeName(str, pos);

    pos = eatWhiteSpace(str, posAfterName);

    const [attributeValue, posAfterValue] = parseAttributeValue(str, pos);

    return [attributeName, attributeValue, posAfterValue];
}

/**
 * Get an HTML attribute name from a given position in a string.
 * Returns the attribute name and the position after it.
 *
 * @param {string} str - The string to get the attribute name from
 * @param {number} pos - The position to start getting the attribute name from
 * @returns {[string, number]} The attribute name and the position after it
 */
function parseAttributeName(str, pos) {
    let name = "";

    // Attribute name finishes before "=", or ">" or " " in case of a void attribute.
    while (str[pos] !== "=" && str[pos] !== ">" && str[pos] !== " ") {
        name += str[pos];
        pos  += 1;
    }

    return [name, pos];
}

/**
 * Get an HTML attribute value from a given position in a string.
 * Returns the attribute value and the position after it.
 *
 * @param {string} str - The string to get the attribute value from
 * @param {number} pos - The position to start getting the attribute value from
 * @returns {[string, number]} The attribute value and the position after it
 */
function parseAttributeValue(str, pos) {
    let value = "";

    // Check if the attribute has a value
    if (str[pos] !== "=") {
        return [value, pos];
    }

    // Eat "="
    pos += 1;

    pos = eatWhiteSpace(str, pos);

    if (str[pos] === '"') {
        // Eat opening quote
        pos += 1;

        while (str[pos] !== '"') {
            value += str[pos];
            pos   += 1;
        }

        // Eat closing quote
        pos += 1;
    } else {
        while (str[pos] !== " " && str[pos] !== ">") {
            value += str[pos];
            pos   += 1;
        }
    }

    return [value, pos];
}

/**
 * Parse a text node from a given position in a string.
 * Pushes the text node to the children array.
 * Returns the position after the text node.
 *
 * @param str - The string to parse from
 * @param pos - The position to start parsing from
 * @param children - The children array to push the text node to
 * @returns {number}
 */
function parseTextNode(str, pos, children) {
    let text = "";

    while (str[pos] !== "<" && pos < str.length) {
        text += str[pos];
        pos  += 1;
    }

    text = text.trim();

    // Create and push a text node if it is not all space or blank
    if (text !== "") {
        children.push({
            tagName   : "#text",
            attributes: /** @type {{string: string}} */ {},
            children  : /** @type {ASTElement[]}     */ [],
            text,
        });
    }

    return pos;
}

/**
 * Eat space or blank from a given position in a string.
 * Returns the position after the spaces or blanks.
 *
 * @param {string} str - The string to eat from
 * @param {number} pos - The position to start eating from
 * @returns {number} The position after the space or blank
 */
function eatWhiteSpace(str, pos) {
    const spaces = [" ", "\r", "\n", "\t"];

    while (pos < str.length && spaces.includes(str[pos])) {
        pos += 1;
    }

    return pos;
}

/**
 * Eat a void HTML tag from a given position in a string.
 * Returns the position after the void HTML tag.
 *
 * @param {string} str - The string to eat from
 * @param {number} pos - The position to start eating from
 * @returns {number} The position after the void HTML tag
 */
function eatTag(str, pos) {
    while (str[pos] !== ">") {
        pos += 1;
    }

    // Eat closing ">"
    return pos + 1;
}

/**
 * Eat an HTML comment from a given position in a string if any.
 * Returns the position after the HTML comment.
 *
 * @param {string} str - The string to eat from
 * @param {number} pos - The position to start eating from
 * @returns {number} The position after the HTML comment's closing "-->"
 */
function eatCommentIfAny(str, pos) {
    // Check for opening "<!--"
    if (str.slice(pos, pos + 4) !== "<!--") {
        return pos;
    }

    // Eat opening "<!--"
    pos += 4;

    // Eat the comment content until closing "-->"
    while (str.slice(pos, pos + 3) !== "-->" && pos < str.length) {
        pos += 1;
    }

    // Eat closing "-->"
    return pos + 3;
}

/**
 * Parses a start HTML tag at a given position in a string.
 * It throws an error if the tag is not valid.
 * If true, return the tag name and the position after the tag name.
 *
 * @param {string} str - The string to check
 * @param {number} pos - The position to check
 * @returns {[string, number]} Gets the tag name and the position after the tag name
 */
function parseStartTag(str, pos) {
    // Start tag must start with "<" and not continue with "/", "!", or "?"
    if (str[pos] !== "<" || str[pos + 1] === "/" || str[pos + 1] === "!" || str[pos + 1] === "?") {
        return ["", pos];
    }

    const [tagName, newPos] = parseTagName(str, pos+1);
    pos = newPos;

    if (tagName === "" || !htmlTags.includes(tagName.toLowerCase())) {
        throw new Error(`Invalid HTML tag: "${tagName}"`);
    }

    return [tagName, pos];
}

/**
 * Parses a closing HTML tag at a given position in a string
 * Validates the tag name and throws an error if it is not valid.
 * The given position is before the tag's opening "</".
 *
 * @param {string} str - The string to check
 * @param {number} pos - The position to check
 * @returns {[string, number]} Returns the tag name and the position after the closing ">"
 */
function parseEndTag(str, pos) {
    // End tag must start with "</"
    if (str[pos] !== "<" || str[pos + 1] !== "/") {
        return ["", pos];
    }

    const [tagName, newPos] = parseTagName(str, pos + 2);
    if (tagName === "" || !htmlTags.includes(tagName.toLowerCase())) {
        throw new Error(`Invalid HTML tag: "${tagName}"`);
    }

    // Eat closing ">"
    pos = newPos + 1;

    return [tagName, pos];
}

/**
 * Get a tag name from a given position in a string.
 * Returns the tag name and the position after the word.
 * The given position is after the tag's opening "<" or "</".
 * The returned position is before the tag's closing ">" or blank.
 *
 * @param {string} str - The string to get the word from
 * @param {number} pos - The position to start getting the word from
 * @returns {[string, number]} The tag name and the position after it
 */
function parseTagName(str, pos) {
    let tagName = "";

    while (str[pos] !== " " && str[pos] !== "\n" && str[pos] !== "\t" && str[pos] !== ">" && pos < str.length) {
        tagName += str[pos];
        pos     += 1;
    }

    return [tagName, pos];
}
