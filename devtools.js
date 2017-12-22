let backgroundPagePort = chrome.runtime.connect({name: 'devtools-page'});
backgroundPagePort.onMessage.addListener(function(message) {
    chrome.devtools.panels.openResource(message.sourceUrl, message.lineNumber, function() {});
});
backgroundPagePort.postMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    scriptToInject: 'content_script.js'
});
