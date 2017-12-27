(function() {

function insertLinks(rootNodes) {
    const childQueue = rootNodes || [];
    while (childQueue.length > 0) {
        let c = childQueue.pop();
        childQueue.push(...(c.childNodes || []));
        visit(c);
    }
}

const stackTracePattern = /at.*\(((http|https):\/\/.*):(\d+):\d+\)/g;
const linkClass = `_λ_stack_trace_link_λ_`
function visit(node) {
    if (!(node instanceof Text) || !stackTracePattern.test(node.data)) {
        return;
    }

    let dataWithLinks = htmlEscape(node.data);
    resetRegExp(stackTracePattern);
    dataWithLinks = dataWithLinks.replace(stackTracePattern, `<span class="${linkClass}" style="text-decoration: underline; cursor: pointer">$&</span>`);

    const nodes = parseHTMLString(dataWithLinks);
    replaceNodeWithNodes(node, nodes);

    addLinkListeners(nodes);
}

function htmlEscape(str) {
    let escaped = str.replace('&', '&amp;');
    escaped = escaped.replace('<', '&lt;');
    escaped = escaped.replace('>', '&gt;');
    return escaped;
}

function parseHTMLString(htmlString) {
    const div = document.createElement("div");
    div.innerHTML = htmlString;
    return Array.from(div.childNodes);
}

function addLinkListeners(nodes) {
    nodes.forEach(function(node) {
        if (!(node instanceof Text)) {
            node.addEventListener('mousedown', onMouseDownLink);
        }
    });
}

function onMouseDownLink(event) {
    event.preventDefault();
    event.stopPropagation();

    resetRegExp(stackTracePattern);
    const match = stackTracePattern.exec(event.target.innerText);
    if(!match) {
        return;
    }
    const sourceUrl = match[1];
    const lineNumber = +match[3] - 1;
    openSourceFile(sourceUrl, lineNumber);
}

function removeLinks() {
    const links = document.querySelectorAll(`.${linkClass}`);
    links.forEach(function(link) {
        replaceNodeWithNodes(link, link.childNodes);
    });
}

function resetRegExp(regex) {
    regex.lastIndex = 0;
}

function replaceNodeWithNodes(node, replacementNodes) {
    replacementNodes.forEach(function(replacementNode) {
        node.parentElement.insertBefore(replacementNode, node);
    });
    node.parentElement.removeChild(node);
}

let backgroundPagePort;
chrome.runtime.onConnect.addListener(function listener(port) {
    backgroundPagePort = port;
    backgroundPagePort.onDisconnect.addListener(function listener() {
        removeLinks();
        backgroundPagePort.onDisconnect.removeListener(listener);
    });
    chrome.runtime.onConnect.removeListener(listener);
});

function openSourceFile(url, lineNumber) {
    backgroundPagePort && backgroundPagePort.postMessage({
        sourceUrl: url,
        lineNumber: lineNumber
    });
}

function onLoaded() {
    insertLinks(Array.from(document.body.children));
    const mutationObserver = new MutationObserver(function(mutationRecords) {
        mutationRecords.forEach(function(mutationRecord) {
            if (mutationRecords.type == 'childList') {
                insertLinks(Array.from(mutationRecord.addedNodes));
            }
        });
    });
    mutationObserver.observe(document.body, {
        subtree: true,
        characterData: true,
        childList: true
    });
}

if (document.readyState == 'loading') {
    document.addEventListener('readystatechange', function onReadyStateChange() {
        if (document.readyState == 'interactive') {
            onLoaded();
            document.removeEventListener('readystatechange', onReadyStateChange);
        }
    });
} else {
    onLoaded();
}

})();
