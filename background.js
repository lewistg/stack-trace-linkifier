chrome.runtime.onConnect.addListener(function(devToolsPort) {
    if (devToolsPort.name != 'devtools-page') {
        return;
    }
    new ContentScriptDevToolsPipe(devToolsPort);
});

/**
 * Message pipe between the content script and the dev tools script.
 * @param {Port} devToolsPort
 * @constructor
 */
function ContentScriptDevToolsPipe(devToolsPort) {
    /** @private {Port} */
    this.devToolsPort = devToolsPort;
    /** @private {Port} */
    this.contentScriptPort;
    /** @private {number} */
    this.inspectedTabId;
    /** @private {function(Object)} */
    this.tabNavigationListener = (details) => {
        if (details.tabId == this.inspectedTabId) {
            this.loadContentScript();
        }

    };

    this.devToolsPort.onMessage.addListener((message, sender, sendResponse) => {
        if (!message.inspectedTabId) {
            return;
        }
        this.inspectedTabId = message.inspectedTabId;
        this.loadContentScript();
    });
    this.devToolsPort.onDisconnect.addListener((message, sender, sendResponse) => this.onDevToolsClosed());
    chrome.webNavigation.onDOMContentLoaded.addListener(this.tabNavigationListener);
}

/**
 * @private
 */
ContentScriptDevToolsPipe.prototype.loadContentScript = function() {
    chrome.tabs.executeScript(
        this.inspectedTabId,
        {file: './content_script.js'},
        () => {
            this.contentScriptPort = chrome.tabs.connect(this.inspectedTabId);
            this.contentScriptPort.onMessage.addListener((message, sender, sendResponse) => this.pipeMessageToDevTools(message));
        }
    );
}

/**
 * @private
 */
ContentScriptDevToolsPipe.prototype.onDevToolsClosed = function() {
    this.contentScriptPort.disconnect();
    chrome.webNavigation.onDOMContentLoaded.removeListener(this.tabNavigationListener);
}

/**
 * @private
 */
ContentScriptDevToolsPipe.prototype.pipeMessageToDevTools = function(message) {
    this.devToolsPort.postMessage(message);
}
