/**
 * Get the attributes of an AST element.
 *
 * @param {ASTElement} elem
 * @return {string[]} The attribute names
 */
export function getAttributeNames(elem) {
    return Object.keys(elem.attributes);
}

/**
 * Get the attribute's value of an AST element.
 *
 * @param {ASTElement} elem
 * @param {string} attrName
 */
export function getAttribute(elem, attrName) {
    return elem.attributes[attrName];
}

/**
 * Gets the id of an AST element.
 *
 * @param {ASTElement} elem
 * @return {string}
 */
export function getId(elem) {
    return elem.attributes["id"] || "";
}

/**
 * Gets a class name of an AST element.
 *
 * @param {ASTElement} elem
 * @return {string}
 */
export function getClassName(elem) {
    return elem.attributes["class"] || "";
}

/**
 * Get the class names of an AST element.
 *
 * @param {ASTElement} elem
 * @return {string[]} The class names array
 */
export function getClassList(elem) {
    return getClassName(elem).split(" ").map((name) => name.trim()).filter((name) => name !== "");
}

/**
 * Gets an AST element by its id recursively.
 * Returns null if not found.
 *
 * @param {ASTElement} elem
 * @param {string} id
 * @return {ASTElement|null}
 */
export function getElementById(elem, id) {
    if (getId(elem) === id) {
        return elem;
    }

    if (Array.isArray(elem.children)) {
        for (let /** @type {ASTElement} */ child of elem.children) {
            if (child.tagName === "#text") continue;

            /**  @type {ASTElement|null} */
            const found = getElementById(child, id);
            if (found) {
                return found;
            }
        }
    }

    return null;
}

/**
 * Gets children elements of an AST element by a tag name recursively.
 *
 * @param {ASTElement} elem
 * @param {string} tagName
 * @return {ASTElement[]}
 */
export function getElementsByTagName(elem, tagName) {
    /**  @type {ASTElement[]} */
    let children = [];

    if (Array.isArray(elem.children)) {
        for (let /** @type {ASTElement} */ child of elem.children) {
            if (child.tagName === "#text") continue;

            if (child.tagName === tagName) {
                children.push(child);
            }
            children = children.concat(getElementsByTagName(child, tagName));
        }
    }

    return children;
}

/**
 * Gets children elements of an AST element by a class name recursively.
 *
 * @param {ASTElement} elem
 * @param {string} className
 * @returns {ASTElement[]}
 */
export function getElementsByClassName(elem, className) {
    /**  @type {ASTElement[]} */
    let children = [];

    if (Array.isArray(elem.children)) {
        for (let /** @type {ASTElement} */ child of elem.children) {
            if (child.tagName === "#text") continue;

            if (getClassList(child).includes(className)) {
                children.push(child);
            }
            children = children.concat(getElementsByClassName(child, className));
        }
    }

    return children;
}

/**
 * Gets the inner text of an element.
 * If the element contains children, it returns the children's text joined with a space.
 *
 * @param {ASTElement} elem
 * @return {string}
 */
export function getText(elem) {
    /**  @type {string[]} */
    let texts = [];

    if (Array.isArray(elem.children)) {
        for (let /** @type {ASTElement} */ child of elem.children) {
            if (child.tagName === "#text") {
                texts.push(child.text);
                continue;
            }

            texts = texts.concat(getText(child));
        }
    }

    return texts.join(" ");
}
