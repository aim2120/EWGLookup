const EWG_SEARCH_URL = 'https://www.ewg.org/skindeep/search/?utf8=%E2%9C%93&search=';
const GOOGLE_SEARCH_EWG_URL = 'https://www.google.com/search?q=site%3Aewg.org%2Fskindeep%2Fbrowse+';

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "SearchEWG",
        contexts: ['selection'],
        title: 'Find EWG rating for "%s"',
    });
});

const searchEWG = async (info, tab) => {
    console.log('searching for ' + info.selectionText);

    const searchWords = info.selectionText.split(' ').map(word => encodeURIComponent(word));
    const searchString = searchWords.join('+');
    const searchUrl = `${EWG_SEARCH_URL}${searchString}`;
    console.log(searchUrl);

    const response = await fetch(searchUrl);``
    const data = await response.text();

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { data }, (response) => {
            if (response.numProductsFound === 0) {
                console.log('need more products');
            }
        });
    });
};

chrome.contextMenus.onClicked.addListener(searchEWG);
