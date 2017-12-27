chrome.runtime.onConnect.addListener(function(devToolsPort) {
    if (devToolsPort.name != 'devtools-page') {
        return;
    }
    let tabId;
    let contentScriptPort;
    function devToolsListener(message, sender, sendResponse) {
        tabId = message.inspectedTabId;
        chrome.tabs.executeScript(
            message.inspectedTabId, 
            {file: './content_script.js'},
            onContentScriptExecuted
        );
    }
    function onContentScriptExecuted() {
        contentScriptPort = chrome.tabs.connect(tabId);
        contentScriptPort.onMessage.addListener(contentScriptListener);
    }
    function contentScriptListener(message, sender, sendResponse) {
        devToolsPort.postMessage(message);
    }
    devToolsPort.onMessage.addListener(devToolsListener);
    devToolsPort.onDisconnect.addListener(function listener() {
        contentScriptPort.disconnect();

        devToolsPort.onMessage.addListener(devToolsListener);
        contentScriptPort.onMessage.removeListener(contentScriptListener);

        devToolsPort.onDisconnect.removeListener(listener);
    });
});
