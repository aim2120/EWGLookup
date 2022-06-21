const updatePopup = (changes) => {
    const savedProductsElement = document.getElementsByClassName('saved-products')[0];
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(key);
        console.log(oldValue);
        console.log(newValue);
        if (oldValue !== newValue) {
            savedProductsElement.innerHTML += newValue;
        }
    }
};

chrome.storage.onChanged.addListener(updatePopup);
