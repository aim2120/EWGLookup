chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { results } = message;

    console.log(results);

    sendResponse('we got it!');
});

console.log('This is the extensions!!!!!!!!!');
