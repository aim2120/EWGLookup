const popupContainer = document.createElement('div');
const popupDragger = document.createElement('div');
const popupCloseButton = document.createElement('div');
const closeButtonSVG = `<svg viewPort="0 0 20 20" version="1.1"
xmlns="http://www.w3.org/2000/svg">
<line x1="1" y1="19"
     x2="19" y2="1"
     stroke="black"
     stroke-width="2"/>
<line x1="1" y1="1"
     x2="19" y2="19"
     stroke="black"
     stroke-width="2"/>
</svg>`;

popupContainer.className = 'ewg-popup-container';
popupDragger.className = 'ewg-popup-dragger';
popupCloseButton.className = 'ewg-popup-close-button';

popupContainer.style.top = `${window.innerHeight}px`;
popupCloseButton.style.display = 'none';
popupCloseButton.innerHTML = closeButtonSVG;

popupContainer.appendChild(popupDragger);
popupContainer.appendChild(popupCloseButton);
document.body.appendChild(popupContainer);

const setEventListeners = () => {
    let isMovingEWGBorder = false;

    popupDragger.addEventListener('mousedown', e => {
        console.log('mousedown');
        isMovingEWGBorder = true;
    });

    popupDragger.addEventListener('mouseup', e => {
        console.log('mouseup');
        isMovingEWGBorder = false;
    });

    document.body.addEventListener('mousemove', e => {
        if (isMovingEWGBorder) {
            console.log('moving');
            popupContainer.style.top = e.clientY + 'px';
        }
    });

    popupCloseButton.addEventListener('click', e => {
        popupContainer.style.top = `${window.innerHeight}px`;
        popupCloseButton.style.display = 'none';

        const popupContentElement = document.getElementsByClassName('ewg-popup-content');

        if (popupContentElement.length > 0) {
            popupContainer.removeChild(popupContentElement[0]);
        }
    });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { results } = message;
    const { products } = results;

    const popupContent = document.createElement('div');
    popupContent.className = 'ewg-popup-content';

    for (let product of products) {
        popupContent.innerHTML += product;
    }

    if (products.length === 0) {
        popupContent.innerHTML += '<h1>Couldn\'t find anything for that, sorry...</h1>';
    }

    const popupContentElement = document.getElementsByClassName('ewg-popup-content');

    if (popupContentElement.length > 0) {
        popupContentElement[0].innerHTML = popupContent.innerHTML;
    } else {
        popupContainer.appendChild(popupContent);
        popupContainer.style.top = `${window.innerHeight - 360}px`;
        popupCloseButton.style.display = 'block';
        setEventListeners();
    }

    sendResponse('we got it!');
});


console.log('This is the extensions!!!!!!!!!');