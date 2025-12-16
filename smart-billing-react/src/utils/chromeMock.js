export const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

export const storage = {
    get: (keys, callback) => {
        if (isExtension) {
            chrome.storage.local.get(keys, callback);
        } else {
            // Mock for localhost using localStorage
            const result = {};
            const keyList = Array.isArray(keys) ? keys : [keys];
            keyList.forEach((key) => {
                const item = localStorage.getItem(key);
                if (item) {
                    try {
                        result[key] = JSON.parse(item);
                    } catch {
                        result[key] = item;
                    }
                }
            });
            // Simulate async callback
            setTimeout(() => callback(result), 0);
        }
    },
    set: (items) => {
        if (isExtension) {
            chrome.storage.local.set(items);
        } else {
            // Mock for localhost
            Object.keys(items).forEach((key) => {
                localStorage.setItem(key, JSON.stringify(items[key]));
            });
        }
    },
};

export const sendTabMessage = async (message) => {
    if (isExtension) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
            chrome.tabs.sendMessage(tab.id, message);
        }
    } else {
        console.log('Localhost Mock: Message sent to content script:', message);
        alert(`[Localhost Mock] Autofill triggered with data:\n${JSON.stringify(message.data, null, 2)}`);
    }
};
