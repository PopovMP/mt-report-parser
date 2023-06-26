# Parse a standard HTML string to AST

Example:

```javascript
import {parse} from "@popovmp/html-ast";

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Page Title</title>
</head>
<body>
    <!-- Comment -->
    <h1 id="heading-1">Heading</h1>
    <p>Some text</p>
</body>
</html>`;

const ast = parse(html);
```

When the HTML string is parsed to a DOM object, the result is:
```json
{
  "tagName": "document",
  "attributes": {},
  "children": [
    {
      "tagName": "html",
      "attributes": {
        "lang": "en"
      },
      "children": [
        {
          "tagName": "head",
          "attributes": {},
          "children": [
            {
              "tagName": "meta",
              "attributes": {
                "charset": "UTF-8"
              },
              "children": [
                {
                  "tagName": "title",
                  "attributes": {},
                  "children": [
                    {
                      "tagName": "#text",
                      "value": "Page Title"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "tagName": "body",
          "attributes": {},
          "children": [
            {
              "tagName": "h1",
              "attributes": {
                "id": "heading-1"
              },
              "children": [
                {
                  "tagName": "#text",
                  "value": "Heading"
                }
              ]
            },
            {
              "tagName": "p",
              "attributes": {},
              "children": [
                {
                  "tagName": "#text",
                  "value": "Some text"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

Element properties: "getAttributeNames", "getAttribute", "getId", "getClassName", "getClassList".

Query methods: "getElementById", "getElementsByClassName", "getElementsByTagName".
