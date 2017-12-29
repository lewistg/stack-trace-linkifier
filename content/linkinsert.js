import * as Util from './util.js';

export function insertLinks(rootNodes, openSourceFile) {
    setTimeout(function() {
        const childQueue = rootNodes || [];
        while (childQueue.length > 0) {
            let c = childQueue.pop();
            childQueue.push(...(c.childNodes || []));
            visit(c, openSourceFile);
        }
    }, 1000);
}
function visit(node, openSourceFile) {
    if (!(node instanceof Text) || !StackFramePatterns.stackFrame.test(node.data)) {
        return;
    }
    const linkifiedStackTraceNodes = getLinkifiedStackTrace(node.data);
    Util.replaceNodeWithNodes(node, linkifiedStackTraceNodes);
    addLinkListeners(linkifiedStackTraceNodes, openSourceFile);
}

function getLinkifiedStackTrace(stackTraceString) {
    let htmlString = Util.htmlEscape(stackTraceString);
    Util.resetRegExp(StackFramePatterns.stackFrame);
    htmlString = htmlString.replace(StackFramePatterns.stackFrame, function(stackFrameString) {
        return stackFrameString.replace(
            StackFramePatterns.sourceLocation, 
            `<span class="${linkClass}" style="text-decoration: underline; cursor: pointer">$&</span>`
        );
    });
    return Util.parseHTMLString(htmlString);
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
    const sourceLocation = getSourceLocation(event.target.innerText);
    if (!sourceLocation) {
        return;
    }
    const [sourceUrl, lineNumber] = sourceLocation;
    openSourceFile(sourceUrl, lineNumber);
}

function getSourceLocation(sourceLocationString) {
    const match = StackFramePatterns.sourceLocation.exec(sourceLocationString);
    if(!!match) {
        return [
            match[StackFramePatterns.sourceLocationGroupIndices.url],
            +match[StackFramePatterns.sourceLocationGroupIndices.lineNumber] - 1
        ];
    }
}

export function removeLinks() {
    const links = document.querySelectorAll(`.${linkClass}`);
    links.forEach(function(link) {
        Util.replaceNodeWithNodes(link, link.childNodes);
    });
}

const linkClass = '_λ_stack_trace_link_λ_';
const StackFramePatterns = {
    sourceLocation: /((https?:\/)?\/.*):(\d+):\d+/,
    sourceLocationGroupIndices: {
        url: 1,
        lineNumber: 3
    }
}
StackFramePatterns.stackFrame = new RegExp(`at.*\(${StackFramePatterns.sourceLocation.source}\)`, 'g');
