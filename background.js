const options = {
    enableOpenNewTab: true,
};

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    chrome.storage.sync.get({
        options
    }, result => {
        if (result.options.enableOpenNewTab) {
            chrome.tabs.create({ url: message.url });
        } else {
            chrome.tabs.update({ url: message.url });
        }
    });
    return true;
});
