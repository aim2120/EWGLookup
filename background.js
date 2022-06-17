chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "SearchEWG",
        contexts: ['selection'],
        title: 'Find EWG rating for "%s"',
    });
});

const searchEWG = (info, tab) => {
    console.log('searching for ' + info.selectionText);
};

chrome.contextMenus.onClicked.addListener(searchEWG);
