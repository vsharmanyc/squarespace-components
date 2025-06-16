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
            return date.toLocaleString('default', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', ' . ');
        } catch(e) {
            return '';
        }
    }

    const getLink = (file) => `https://raw.githubusercontent.com/vsharmanyc/squarespace-components/refs/heads/master/components/carousel/assets/${file}`;
    const imgLinks = {
        FESTIVAL: getLink('special.png'),
        GOSPEL:  getLink('gospel.png'),
        GITA:  getLink('gita.jpg'),
        SUNDAY:  getLink('altar.jpg')
    };

    const tile = (content) => {
        console.log(content);
        const tile = createElement('div', { classList: 'tile align-center' });


        // IMAGE SECTION
        const imageStyle = 'square';
        const imageContainer = createElement('div', { classList: `tile-img-container ${imageStyle}` });
        const imageSizer = createElement('div');
        imageSizer.append(createElement('img', { src: imgLinks[ content?.event_type || imgLinks.FESTIVAL ] }));
        imageContainer.append(imageSizer);

        // DATE AND TIME SECTION
        const dateTime = createElement('div', { classList: 'date-time' });
        dateTime.append(
            createElement('p', { innerText: formatDate(content.date), classList: 'date-header' }),
            createElement('p', { innerText: content.time, classList: 'time-header blue-text' })
        );

        // EVENT INFO SECTION
        const eventInfo = createElement('p');
        eventInfo.append(
            createElement('p', { innerText: content.heading || '', classList: 'heading blue-text'}),
            createElement('p', { innerText: content.subheading || '', classList: 'subheading blue-text' }),
            createElement('p', { innerText: content.speaker || '', classList: 'speaker blue-text' }),
        )

        // LINKS SECTION
        const linksSection = createElement('div', { classList: 'links-section' })

        if (content.registration_link) {
            linksSection.append(createElement('a', { innerText: 'Register', href: content.registration_link,  target: '_blank', classList: 'tile-btn-link register' }));
        }

        tile.setAttribute('status', content.status);

        tile.append(imageContainer, dateTime, eventInfo, linksSection);

        // const pill = createElement('div', { classList: 'pill-event'});
        // pill.innerText = 'Festival';
        // tile.append(pill)

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
        const url = 'https://script.google.com/macros/s/AKfycbya2Mwy9XeugjnjQkXJetLhabTwxT10Vr1LHxaT0RRT4hX69t6bv5OgoS3cjn9JfTlhZA/exec';
        return fetch(url)
        .then(response => response.json())
        .catch(() => []);
    }

    document.addEventListener('DOMContentLoaded', () => {
        formatSkeletonTiles();
        fetchCarouselContent().then(contentArray => {

             static =  {

                
             }
                console.log(contentArray)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tiles = contentArray
                        .filter(tileContent => new Date(tileContent.date) >= today)
                        .map(tileContent => tile(tileContent));
                setupView(tiles);
        })
    });

    window.addEventListener('resize', resetView);

    return { slideToNextTile, slideToPrevTile };
}

const { slideToNextTile, slideToPrevTile } = initVSNYCarousel();