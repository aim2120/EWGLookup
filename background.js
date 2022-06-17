const EWG_SEARCH_URL = 'https://www.ewg.org/skindeep/search/?utf8=%E2%9C%93&search=';
const GOOGLE_SEARCH_EWG_URL = 'https://www.google.com/search?q=ewg+';

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
    let searchUrl = `${url}${searchString}`;

    if (source === 'Google') {
        searchUrl += '&btnI';

    }

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

    let resultSuccess = await searchUrl(info, tab, EWG_SEARCH_URL, 'EWG');

    if (resultSuccess) {
        console.log('success');
        return;
    }

    console.log('failure -- trying Google');
    resultSuccess = await searchUrl(info, tab, GOOGLE_SEARCH_EWG_URL, 'Google');

    if (resultSuccess) {
        console.log('success');
        return;
    }

    console.log('failure -- nothing left to try');
};

chrome.contextMenus.onClicked.addListener(initSearch);
