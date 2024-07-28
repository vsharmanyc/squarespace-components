// declare state variables
let viewLimit = 3; // sets the max numnber of tiles to be visible at all times
let visibleStartIndex = 0; // index of the first visible tile
let tileListElement; // reference to the tile list html element
let touchstartX = 0
let touchendX = 0

const createElement = (tag, properties = {}) => {
    const element = document.createElement(tag);
    Object.entries(properties).forEach(([key, value]) => element[key] = value );
    return element;
};

const tile = (content) => {
    const tile = createElement('div', { classList: 'tile align-center' });
    const tileBody = [
        createElement('img', { src: content.Image, classList: 'display-picture' }),
        createElement('h1', { innerText: new Date(content.Date).toDateString() }),
        createElement('h1', { innerText: content.Heading }),
        createElement('h1', { innerText: content.Subheading }),
        createElement('h1', { innerText: content.Description })
    ]
    tile.append(...tileBody);
    return tile
};

const tileList = (tiles = []) => {
    if (tiles.length) {
        const spacing = '1.5rem'; // controls the spacing between tiles
        tiles.forEach(tile => {
            tile.style.minWidth = `calc(${100 / viewLimit}% - ${(viewLimit + 1) / viewLimit} * ${spacing})`;
            tile.style.marginLeft = spacing;
        })
        tiles[tiles.length - 1].style.marginRight = spacing;
    }
    return tiles;
};


const triggerTransition = () => {
    const children = tileListElement.children;
    const offset = children[0].getBoundingClientRect().x - children[visibleStartIndex].getBoundingClientRect().x;
    tileListElement.style.transform = `translate3d(${offset}px, 0px, 0px)`;
    tileListElement.classList.remove('transition-effect');
    tileListElement.classList.add('transition-effect');
};

// replicated prev and next functionality using ux from  https://primeng.org/carousel as a reference

const prev = () => {
    if (visibleStartIndex - viewLimit < 0) return;

    // special case to always ensure viewLimit number tiles in view
    if (visibleStartIndex % viewLimit != 0) {
        visibleStartIndex -= visibleStartIndex % viewLimit;
    } else {
        visibleStartIndex -= viewLimit;
    }

    triggerTransition();
};

const next = () => {
    const children = tileListElement.children;
    if (visibleStartIndex + viewLimit >= children.length) return;

    visibleStartIndex += viewLimit;
    // special case to always ensure viewLimit number tiles in view
    if (children.length - visibleStartIndex < viewLimit) {
        visibleStartIndex -= viewLimit - (children.length - visibleStartIndex);
    }

    triggerTransition();
};

// we can force the number of tiles in view if we want
// but less or more tiles may look better different screen sizes 
const getSuggestedViewLimit = () => {
    if (window.screen.availWidth < 500) {
        return 1; // lets just suggest only 1 tile in view if screen width < 500px
    }

    const tileListWidth = tileListElement.getBoundingClientRect().width;
    const tileWidth = 300; // lets say a good width for a tile is 300px
    return Math.floor(tileListWidth / tileWidth);
};

const resetView = () => {
    const suggestedViewLimit = getSuggestedViewLimit();
    if (viewLimit !== suggestedViewLimit) {
        viewLimit = suggestedViewLimit;
        // resize tiles based off new viewLimit
        tileList(Array.from(tileListElement.children));
    }
    triggerTransition();
};

const setupView = (tiles) => {
    tileListElement = document.querySelector('#carousel .tile-list');
    viewLimit = getSuggestedViewLimit();
    tileListElement.append(...tileList(tiles));
    tileListElement.addEventListener('touchstart', onTouchStart);
    tileListElement.addEventListener('touchend', onTouchEnd);
}

// reference stack overflow for detecting swipe right and left
// https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android

function checkDirection() {
    // left swipe
    if (touchendX < touchstartX) next();

    // right swipe
    if (touchendX > touchstartX) prev();
}

const onTouchStart = (e) => touchstartX = e.changedTouches[0].screenX;

const onTouchEnd = (e) => {
    touchendX = e.changedTouches[0].screenX;
    checkDirection();
}


const fetchCarouselContent = () => {
    const url = 'https://script.google.com/macros/s/AKfycbwJrO9SW0gmpIyUXhVY4c9s-zo6NWgMENJqfjLWVv4gdccPgzerJZ8MXWXqi0MCtCze/exec';
    return fetch(url)
    .then(response => response.json())
    .catch(() => []);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCarouselContent().then(contentArray => {
        const tiles = contentArray.map(tileContent => tile(tileContent));
        setupView(tiles);
    })
});

window.addEventListener('resize', resetView);