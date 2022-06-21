import { JSDOM } from './jsdom.js';

const EWG_SEARCH_URL = 'https://www.ewg.org/skindeep/search/?utf8=%E2%9C%93&search=';
const GOOGLE_SEARCH_EWG_URL = 'https://www.google.com/search?q=site%3Aewg.org%2Fskindeep%2Fbrowse+';

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "SearchEWG",
        contexts: ['selection'],
        title: 'Search EWG for "%s"',
    });
});

const searchEWGDOM = dom => {
    const { document } = dom.window;
    const productNodes = [...document.getElementsByClassName('product-tile')];

    const products = productNodes.map(node => {
        return node.outerHTML;
    });

    return {
        productsLength: products.length,
        products,
    };
};

// returns undefined if no search results on page
const getEWGUrlFromGoogleDOM = dom => {
    const { document } = dom.window;
    const resultNodes = document.getElementsByClassName('g');

    const url = resultNodes[0]?.getElementsByTagName('a')[0]?.href;

    if (url) {
        return url;
    }

    throw new Error(`Unable to find any Google results for ${dom.window.location}`);
};

const getDOM = async url => {
    let response, data, dom, errorMessage;

    try {
        response = await fetch(url);
        data = await response.text();
        dom = new JSDOM(data, {
            url,
        });
    } catch (e) {
        errorMessage = `Unable to fetch ${url}: ${e}`
    }

    return new Promise((resolve, reject) => {
        if (dom !== undefined) {
            resolve(dom);
        } else {
            reject(new Error(errorMessage))
        }
    });
};

const getSearchURL = (selectionText, url) => {
    const searchWords = selectionText.split(' ').map(word => encodeURIComponent(word));
    const searchString = searchWords.join('+');
    let searchUrl = `${url}${searchString}`;
    return searchUrl;
};

const sendMessageToContentScript = (results, tab) => {
    chrome.tabs.sendMessage(tab.id, { results }, (response) => {
        console.log(response);
    });
};

const initSearch = async (info, tab) => {
    console.log('searching for ' + info.selectionText);

    try {
        const searchUrlEWG = getSearchURL(info.selectionText, EWG_SEARCH_URL);
        const domEWG = await getDOM(searchUrlEWG);
        const resultsEWG = searchEWGDOM(domEWG);

        if (resultsEWG.productsLength > 0) {
            sendMessageToContentScript(resultsEWG, tab);
            return;
        }
    } catch (e) {
        console.error(e);
    }

    console.log('failure -- trying Google');

    try {
        const searchUrlGoogle = getSearchURL(info.selectionText, GOOGLE_SEARCH_EWG_URL);
        const domGoogle = await getDOM(searchUrlGoogle);
        const urlEWGFromGoogle = getEWGUrlFromGoogleDOM(domGoogle);
        const domEWGFromGoogle = await getDOM(urlEWGFromGoogle);
        const resultsEWGFromGoogle = searchEWGDOM(domEWGFromGoogle);

        if (resultsEWGFromGoogle.productsLength > 0) {
            sendMessageToContentScript(resultsEWGFromGoogle, tab);
            return;
        }
    } catch (e) {
        console.error(e);
    }

    console.log('failure -- nothing left to try');

    const emptyResults = {
        productsLength: 0,
        products: [],
    };

    sendMessageToContentScript(emptyResults, tab);
};

chrome.contextMenus.onClicked.addListener(initSearch);
