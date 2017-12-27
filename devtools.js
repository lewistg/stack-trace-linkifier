let backgroundPagePort = chrome.runtime.connect({name: 'devtools-page'});
backgroundPagePort.onMessage.addListener(function(message) {
    chrome.devtools.panels.openResource(message.sourceUrl, message.lineNumber, function() {});
});
backgroundPagePort.postMessage({
    inspectedTabId: chrome.devtools.inspectedWindow.tabId,
});
