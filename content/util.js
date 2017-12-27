export function htmlEscape(str) {
    let escaped = str.replace('&', '&amp;');
    escaped = escaped.replace('<', '&lt;');
    escaped = escaped.replace('>', '&gt;');
    return escaped;
}

export function parseHTMLString(htmlString) {
    const div = document.createElement("div");
    div.innerHTML = htmlString;
    return Array.from(div.childNodes);
}

export function replaceNodeWithNodes(node, replacementNodes) {
    replacementNodes.forEach(function(replacementNode) {
        node.parentElement.insertBefore(replacementNode, node);
    });
    node.parentElement.removeChild(node);
}

export function resetRegExp(regex) {
    regex.lastIndex = 0;
}
