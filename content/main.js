import * as linkInsert from './linkinsert.js'

let backgroundPagePort;
chrome.runtime.onConnect.addListener(function connectListener(port) {
    backgroundPagePort = port;
    backgroundPagePort.onDisconnect.addListener(function disconnectListener() {
        linkInsert.removeLinks();
        backgroundPagePort.onDisconnect.removeListener(disconnectListener);
    });
    chrome.runtime.onConnect.removeListener(connectListener);
});

function openSourceFile(url, lineNumber) {
    backgroundPagePort && backgroundPagePort.postMessage({
        sourceUrl: url,
        lineNumber: lineNumber
    });
}

function onLoaded() {
    linkInsert.insertLinks(Array.from(document.body.children), openSourceFile);
    const mutationObserver = new MutationObserver(function(mutationRecords) {
        mutationRecords.forEach(function(mutationRecord) {
            if (mutationRecord.type == 'childList') {
                linkInsert.insertLinks(Array.from(mutationRecord.addedNodes), openSourceFile);
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
