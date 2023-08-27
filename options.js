const options = {
    enableOpenNewTab: true,
};

document.addEventListener('DOMContentLoaded', () => {
    const checkbox = document.getElementById("checkbox");
    chrome.storage.sync.get({
        options
    }, result => {
        console.log(result.options.is_open_new_tab);
        checkbox.checked = result.options.enableOpenNewTab;
    });

    checkbox.addEventListener('change', _ => {
        options.enableOpenNewTab = checkbox.checked;
        chrome.storage.sync.set({
            options
        }, () => {
            console.log(`Open in new tab is set to ${checkbox.checked}`);
        });
    });
});