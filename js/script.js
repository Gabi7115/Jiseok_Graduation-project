'use strict';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');

function closeMenu() {
    if (!menuButton || !navigation) {
        return;
    }

    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
}

if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
        const isOpen = navigation.classList.toggle('open');

        menuButton.setAttribute(
            'aria-expanded',
            String(isOpen)
        );
    });

    navigation.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', event => {
        if (
            event.key === 'Escape' &&
            navigation.classList.contains('open')
        ) {
            closeMenu();
            menuButton.focus();
        }
    });

    const desktopQuery = window.matchMedia(
        '(min-width: 701px)'
    );

    desktopQuery.addEventListener('change', event => {
        if (event.matches) {
            closeMenu();
        }
    });
}

function imageFallback(image) {
    if (image.dataset.failed === 'true') {
        return;
    }

    image.dataset.failed = 'true';

    if (image.classList.contains('home-hero-background')) {
        image.hidden = true;
        return;
    }

    image.classList.add('image-fallback');

    const label = (image.alt || '이미지 준비 중')
        .replace(/[&<>"']/g, '');

    const svg = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="640"
            height="480"
            viewBox="0 0 640 480"
        >
            <rect
                width="640"
                height="480"
                fill="#eee8dc"
            />

            <rect
                x="28"
                y="28"
                width="584"
                height="424"
                fill="none"
                stroke="#b79a61"
                stroke-width="1"
            />

            <path
                d="M270 200h100v65H270z M275 255l28-30 18 18 17-12 28 24"
                stroke="#b79a61"
                fill="none"
                stroke-width="2"
            />

            <text
                x="320"
                y="310"
                text-anchor="middle"
                fill="#142d4e"
                font-size="17"
                font-family="sans-serif"
            >${label}</text>

            <text
                x="320"
                y="342"
                text-anchor="middle"
                fill="#7e745f"
                font-size="11"
                font-family="sans-serif"
                letter-spacing="3"
            >ARANG &amp; SEUL</text>
        </svg>
    `;

    image.removeAttribute('srcset');
    image.removeAttribute('sizes');

    image.src =
        'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(svg);
}

function watchImage(image) {
    if (!image) {
        return;
    }

    image.addEventListener(
        'error',
        () => imageFallback(image),
        { once: true }
    );

    if (image.complete && !image.naturalWidth) {
        imageFallback(image);
    }
}

document.querySelectorAll('img').forEach(watchImage);

const filters = document.querySelectorAll('[data-filter]');
const stickers = document.querySelectorAll('[data-category]');
const resultCount = document.querySelector('#result-count');

function applyFilter(button) {
    filters.forEach(item => {
        item.setAttribute(
            'aria-pressed',
            String(item === button)
        );
    });

    let count = 0;

    stickers.forEach(item => {
        const matches =
            button.dataset.filter === 'all' ||
            item.dataset.category === button.dataset.filter;

        item.hidden = !matches;

        if (matches) {
            count++;
        }
    });

    if (resultCount) {
        resultCount.textContent =
            `${button.textContent.trim()} ${count}개 작품`;
    }
}

filters.forEach(button => {
    button.addEventListener('click', () => {
        applyFilter(button);
    });
});

if (filters.length > 0) {
    const initialFilter =
        Array.from(filters).find(button => {
            return button.getAttribute('aria-pressed') === 'true';
        }) || filters[0];

    applyFilter(initialFilter);
}

const modal = document.querySelector('#lightbox');
let opener = null;

if (modal) {
    const modalImage = modal.querySelector('.modal-image');
    const modalTitle = modal.querySelector('#lightbox-title');
    const closeButton = modal.querySelector('.close');

    document.querySelectorAll('[data-zoom]').forEach(button => {
        button.addEventListener('click', () => {
            const original = button.querySelector('img');

            if (
                !original ||
                !modalImage ||
                !modalTitle ||
                modal.open
            ) {
                return;
            }

            opener = button;

            const copy = original.cloneNode(true);

            copy.removeAttribute('id');
            copy.removeAttribute('width');
            copy.removeAttribute('height');
            copy.loading = 'eager';

            modalImage.replaceChildren(copy);

            modalTitle.textContent =
                original.alt || '이미지 확대 보기';

            watchImage(copy);

            modal.showModal();
            modal.scrollTop = 0;

            document.body.classList.add('modal-open');

            if (closeButton) {
                closeButton.focus({ preventScroll: true });
            }
        });
    });

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.close();
        });
    }

    modal.addEventListener('click', event => {
        const box = modal.getBoundingClientRect();

        const outside =
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom;

        if (event.target === modal && outside) {
            modal.close();
        }
    });

    modal.addEventListener('cancel', event => {
        event.preventDefault();
        modal.close();
    });

    modal.addEventListener('close', () => {
        document.body.classList.remove('modal-open');

        if (modalImage) {
            modalImage.replaceChildren();
        }

        if (opener && opener.isConnected) {
            opener.focus({ preventScroll: true });
        }

        opener = null;
    });
}

const views = document.querySelectorAll('[data-view]');
const renderStage = document.querySelector('#render-stage');
const renderCaption = document.querySelector('#render-caption');

views.forEach(button => {
    button.addEventListener('click', () => {
        const original = button.querySelector('img');

        if (!original || !renderStage) {
            return;
        }

        views.forEach(item => {
            item.setAttribute(
                'aria-pressed',
                String(item === button)
            );
        });

        const copy = original.cloneNode(true);

        copy.removeAttribute('id');
        copy.loading = 'eager';

        renderStage.replaceChildren(copy);
        watchImage(copy);

        if (renderCaption) {
            renderCaption.textContent = copy.alt;
        }
    });
});

const videos = Array.from(document.querySelectorAll('video'));

videos.forEach(video => {
    const status = video.parentElement?.querySelector(
        '.video-status'
    );

    const showError = () => {
        if (status) {
            status.hidden = false;
        }
    };

    const hideError = () => {
        if (status) {
            status.hidden = true;
        }
    };

    video.addEventListener('error', showError);
    video.addEventListener('loadeddata', hideError);

    video.addEventListener('play', () => {
        if (!document.body.classList.contains('model-page')) {
            return;
        }

        videos.forEach(otherVideo => {
            if (otherVideo !== video) {
                otherVideo.pause();
            }
        });
    });

    video.querySelectorAll('source').forEach(source => {
        source.addEventListener('error', showError);
    });

    if (video.error) {
        showError();
    }
});