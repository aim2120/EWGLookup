const EWG_SEARCH_URL = 'https://www.ewg.org/skindeep/search/?utf8=%E2%9C%93&search=';
const GOOGLE_SEARCH_EWG_URL = 'https://www.google.com/search?q=site%3Aewg.org%2Fskindeep%2Fbrowse+';

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "SearchEWG",
        contexts: ['selection'],
        title: 'Find EWG rating for "%s"',
    });
});

const searchUrl = async (info, tab, url, source) => {
    const searchWords = info.selectionText.split(' ').map(word => encodeURIComponent(word));
    const searchString = searchWords.join('+');
    const searchUrl = `${url}${searchString}`;
    console.log(searchUrl);

    const response = await fetch(searchUrl);
    const data = await response.text();

    return new Promise(resolve => {
        chrome.tabs.sendMessage(tab.id, { data, source }, (response) => {
            if (response.numProductsFound === 0) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};

const initSearch = async (info, tab) => {
    console.log('searching for ' + info.selectionText);

    const resultSuccess = searchUrl(info, tab, EWG_SEARCH_URL, 'EWG');

    if (resultSuccess) {
        console.log('success');
    } else {
        console.log('failure');
    }
};

chrome.contextMenus.onClicked.addListener(initSearch);
