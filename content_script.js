document.addEventListener('dblclick', _event => {
    const selection = document.getSelection();
    const anchorNode = selection?.anchorNode;
    if (!anchorNode) return;

    const nodeType = anchorNode.nodeType;
    if ((nodeType === Node.TEXT_NODE || nodeType === Node.ELEMENT_NODE)) {
        if (!anchorNode.textContent) return;

        const trimmed = anchorNode.textContent.trim();
        if (!trimmed) return;

        const sentence = removeIfEndsWithDot(extractWordAtIndex(trimmed, selection.anchorOffset));
        if (!sentence) return;

        const fixed = fixHttp(toHalfWidthIfFullWidth(sentence));
        if (!fixed) return;

        const matched = matchURL(fixed);
        if (!matched) return;

        if (isValidURL(matched)) {
            sendMessage(matched);
            select(selection, anchorNode, matched);
            return;
        }
    }
});

/**
 * @param {Selection} selection
 * @param {Node} node
 * @param {string} url 
 */
const select = (selection, node, url) => {
    const startIndex = node.textContent.indexOf(url);
    const endIndex = startIndex + url.length;
    if (startIndex === -1) return;

    const range = document.createRange();
    range.setStart(node, startIndex);
    range.setEnd(node, endIndex);
    selection.removeAllRanges();
    selection.addRange(range);
};

/**
 * @param {string} url 
 * @returns 
 */
const sendMessage = url => {
    if (!chrome?.runtime?.id) return;
    chrome.runtime.sendMessage({ url: url });
};

/**
 * @param {string} text 
 * @returns 
 */
const fixHttp = text => !text.startsWith("http") ? text.replace(/h?t?tp/, "http") : text;

/**
 * @param {string} text 
 * @returns 
 */
const removeIfEndsWithDot = text => {
    if (!text) return null;
    if (!text.endsWith('.')) {
        return text;
    }
    return removeIfEndsWithDot(text.substring(0, text.length - 1));
};

/**
 * @param {string} text 
 * @param {number} index 
 * @returns 
 */
const extractWordAtIndex = (text, index) => {
    const words = text.split(/[\s]/);
    const targetWord = words.find((word, _wordIndex) => {
        const startIndex = text.indexOf(word);
        const endIndex = startIndex + word.length - 1;
        return startIndex <= index && endIndex >= index;
    });
    return targetWord;
};

/**
 * @param {string} text 
 * @returns 
 */
const toHalfWidthIfFullWidth = text => {
    const regex = /[\uff01-\uff5e]/;
    return regex.test(text) ?
        text.replace(RegExp(regex, "g"), str => String.fromCharCode(str.charCodeAt(0) - 0xFEE0)) : text;
};

/**
 * @param {string} text 
 * @returns 
 */
const matchURL = text => {
    const regex = /(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-@]*)*\/?/;
    const matched = text.match(regex);
    return matched && matched.length >= 0 ? matched[0] : null;
};

/**
 * @param {string} text 
 * @returns 
 */
const isValidURL = text => {
    if (!text) return false;
    try {
        new URL(text);
    } catch (_error) {
        return false;
    }
    const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-@]*)*\/?$/;
    return text.match(regex) !== null;
};