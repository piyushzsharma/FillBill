
chrome.runtime.onInstalled.addListener(() => {
    console.log('Smart Billing Autofill extension installed')
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    return true
})

console.log('Smart Billing Autofill background script loaded')
