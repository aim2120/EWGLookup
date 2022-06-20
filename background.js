import { JSDOM } from './jsdom.js';

const EWG_SEARCH_URL = 'https://www.ewg.org/skindeep/search/?utf8=%E2%9C%93&search=';
const GOOGLE_SEARCH_EWG_URL = 'https://www.google.com/search?q=site%3Aewg.org%2Fskindeep%2Fbrowse+';

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "SearchEWG",
        contexts: ['selection'],
        title: 'Find EWG rating for "%s"',
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

const getEWGUrlFromGoogleDOM = dom => {
    const { document } = dom.window;
    const resultNodes = document.getElementsByClassName('g');
    return resultNodes[0].getElementsByTagName('a')[0].href;
};

const getDOM = async url => {
    const response = await fetch(url);
    const data = await response.text();
    const dom = new JSDOM(data);

    return new Promise(resolve => {
        resolve(dom);
    });
};

const getSearchURL = (selectionText, url) => {
    const searchWords = selectionText.split(' ').map(word => encodeURIComponent(word));
    const searchString = searchWords.join('+');
    let searchUrl = `${url}${searchString}`;
    return searchUrl;
};

const sendMessageToContentScript = (results, tab) => {
    console.log('success');

    chrome.tabs.sendMessage(tab.id, { results }, (response) => {
        console.log(response);
    });
};

const initSearch = async (info, tab) => {
    console.log('searching for ' + info.selectionText);

    const searchUrlEWG = getSearchURL(info.selectionText, EWG_SEARCH_URL);
    const domEWG = await getDOM(searchUrlEWG);
    const resultsEWG = searchEWGDOM(domEWG);

    if (resultsEWG.productsLength > 0) {
        sendMessageToContentScript(resultsEWG, tab);
        return;
    }

    console.log('failure -- trying Google');

    const searchUrlGoogle = getSearchURL(info.selectionText, GOOGLE_SEARCH_EWG_URL);
    const domGoogle = await getDOM(searchUrlGoogle);
    const urlEWGFromGoogle = getEWGUrlFromGoogleDOM(domGoogle);
    const domEWGFromGoogle = await getDOM(urlEWGFromGoogle);
    const resultsEWGFromGoogle = searchEWGDOM(domEWGFromGoogle);

    if (resultsEWGFromGoogle.productsLength > 0) {
        sendMessageToContentScript(resultsEWGFromGoogle, tab);
        return;
    }

    console.log('failure -- nothing left to try');
};

chrome.contextMenus.onClicked.addListener(initSearch);
