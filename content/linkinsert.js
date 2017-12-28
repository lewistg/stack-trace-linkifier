import * as util from './util.js';

const stackFramePattern = /at.*\(((http|https):\/\/.*):(\d+):\d+\)/g;
const linkClass = '_λ_stack_trace_link_λ_';

export function insertLinks(rootNodes, openSourceFile) {
    const childQueue = rootNodes || [];
    while (childQueue.length > 0) {
        let c = childQueue.pop();
        childQueue.push(...(c.childNodes || []));
        visit(c, openSourceFile);
    }
}
function visit(node, openSourceFile) {
    if (!(node instanceof Text) || !stackFramePattern.test(node.data)) {
        return;
    }

    let dataWithLinks = util.htmlEscape(node.data);
    util.resetRegExp(stackFramePattern);
    dataWithLinks = dataWithLinks.replace(stackFramePattern, `<span class="${linkClass}" style="text-decoration: underline; cursor: pointer">$&</span>`);

    const nodes = util.parseHTMLString(dataWithLinks);
    util.replaceNodeWithNodes(node, nodes);

    addLinkListeners(nodes, openSourceFile);
}

function addLinkListeners(nodes, openSourceFile) {
    nodes.forEach(function(node) {
        if (!(node instanceof Text)) {
            node.addEventListener('mousedown', function(event) {
                onMousedownLink(event, openSourceFile);
            });
        }
    });
}

function onMousedownLink(event, openSourceFile) {
    event.preventDefault();
    event.stopPropagation();

    util.resetRegExp(stackFramePattern);
    const match = stackFramePattern.exec(event.target.innerText);
    if(!match) {
        return;
    }
    const sourceUrl = match[1];
    const lineNumber = +match[3] - 1;
    openSourceFile(sourceUrl, lineNumber);
}

export function removeLinks() {
    const links = document.querySelectorAll(`.${linkClass}`);
    links.forEach(function(link) {
        util.replaceNodeWithNodes(link, link.childNodes);
    });
}
