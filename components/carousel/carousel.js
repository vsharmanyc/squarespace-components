// encapsulate the carousel logic/variables/functions in this function, and return the data needed globally
const initVSNYCarousel = () => {
    // declare state variables
    const MAX_NUM_TILES_IN_VIEW = 3; // sets the max number of tiles to be visible at all times
    let tilesInView = MAX_NUM_TILES_IN_VIEW;
    let visibleStartIndex = 0; // index of the first visible tile
    let tileListElement; // reference to the tile list html element
    let touchstartX = 0
    let touchendX = 0

    const createElement = (tag, properties = {}) => {
        const element = document.createElement(tag);
        Object.entries(properties).forEach(([key, value]) => element[key] = value );
        return element;
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('default', { month: 'short', day: 'numeric' });
        } catch(e) {
            return '';
        }
    }

    const tile = (content) => {
        const tile = createElement('div', { classList: 'tile align-center' });

        const imageContainer = createElement('div', { classList: 'tile-img-container' });
        const imageSizer = createElement('div');
        imageSizer.append(createElement('img', { src: content.Image }));
        content.Image && imageContainer.append(imageSizer);

        const tileText = createElement('div', { classList: 'tile-text' })

        const dateTime = createElement('div', { classList: 'date-time' });
        dateTime.append(
            createElement('h2', { innerText: formatDate(content.Date), classList: 'date-header' }),
            createElement('div', { innerText: content.Time, classList: 'time-header' })
        );

        const headings = createElement('p');
        headings.append(
            createElement('strong', { innerText: content.Heading || '', classList: 'tile-heading'}),
            createElement('br'),
            createElement('em', { innerText: content.Subheading || '', classList: 'tile-subheading' }),
        )

        tileText.append(
            dateTime,
            headings,
            createElement('p', { innerHTML: content.Description || '', classList: 'date-description' })
        );

        tile.append(imageContainer, tileText);

        if (content.Registration) {
            tile.append(createElement('a', { innerText: 'Register', href: content.Registration,  target: '_blank', classList: 'tile-btn-link register' }));
        }

        tile.setAttribute('status', content.Status)

        return tile;
    };

    const formatSkeletonTiles = () => {
        tileListElement = document.querySelector('#vsny-carousel .tile-list');
        tileListElement.innerHTML = tileListElement.innerHTML.repeat(getSuggestedTilesInView());
        tileList(Array.from(tileListElement.children))
    };

    const tileList = (tiles = []) => {
        if (tiles.length) {
            const spacing = '1.5rem'; // controls the spacing between tiles
            tiles.forEach(tile => {
                tile.style.minWidth = `calc(${100 / tilesInView}% - ${(tilesInView + 1) / tilesInView} * ${spacing})`;
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

    // replicated slideToPrevTile and slideToNextTile functionality using ux from  https://primeng.org/carousel as a reference

    const slideToPrevTile = () => {
        if (visibleStartIndex - tilesInView < 0) return;

        // special case to always ensure tilesInView number tiles in view
        if (visibleStartIndex % tilesInView != 0) {
            visibleStartIndex -= visibleStartIndex % tilesInView;
        } else {
            visibleStartIndex -= tilesInView;
        }

        triggerTransition();
    };

    const slideToNextTile = () => {
        const children = tileListElement.children;
        if (visibleStartIndex + tilesInView >= children.length) return;

        visibleStartIndex += tilesInView;
        // special case to always ensure tilesInView number tiles in view
        if (children.length - visibleStartIndex < tilesInView) {
            visibleStartIndex -= tilesInView - (children.length - visibleStartIndex);
        }

        triggerTransition();
    };

    // we can force the number of tiles in view if we want
    // but less or more tiles may look better different screen sizes 
    const getSuggestedTilesInView = () => {
        if (window.screen.availWidth < 500) {
            return 1; // lets just suggest only 1 tile in view if screen width < 500px
        }

        const tileListWidth = tileListElement.getBoundingClientRect().width;
        const tileWidth = 350; // lets say a good width for a tile is 350px
        return Math.min(Math.floor(tileListWidth / tileWidth), MAX_NUM_TILES_IN_VIEW);
    };

    const resetView = () => {
        const suggestedTilesInView = getSuggestedTilesInView();
        if (tilesInView !== suggestedTilesInView) {
            tilesInView = suggestedTilesInView;
            // resize tiles based off new tilesInView
            tileList(Array.from(tileListElement.children));
        }
        triggerTransition();
    };

    const setupView = (tiles) => {
        tileListElement = document.querySelector('#vsny-carousel .tile-list');
        tileListElement.innerHTML = '';
        tilesInView = getSuggestedTilesInView();
        tileListElement.append(...tileList(tiles));
        tileListElement.addEventListener('touchstart', onTouchStart);
        tileListElement.addEventListener('touchend', onTouchEnd);
    }

    // reference stack overflow for detecting swipe right and left
    // https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android

    function checkDirection() {
        // left swipe
        if (touchendX < touchstartX) slideToNextTile();

        // right swipe
        if (touchendX > touchstartX) slideToPrevTile();
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
        formatSkeletonTiles();
        fetchCarouselContent().then(contentArray => {
            const tiles = contentArray.map(tileContent => tile(tileContent));
            setupView(tiles);
        })
    });

    window.addEventListener('resize', resetView);

    return { slideToNextTile, slideToPrevTile };
}

const { slideToNextTile, slideToPrevTile } = initVSNYCarousel();