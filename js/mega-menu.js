(function () {
    'use strict';

    // ===================================
    // STATE & DOM CACHE
    // ===================================

    const state = {
        currentMenu:      null,
        currentCategory:  null,
        currentCrypto:    null,
        viewStack:        [],
        leaveTimeout:     null,
        col1HoverTimeout: null, // Hover-intent delay for Column 1
        col2HoverTimeout: null, // Hover-intent delay for Column 2
        tabHoverTimeout:  null, // Hover-intent delay for tabbed menus
        navDirection:     null, // 'forward', 'back', or null (no animation)
        prevLeftType:     null,
        prevRightType:    null,
        prevRightData:    null,
        isTablet: window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches,
        isMobile: window.matchMedia('(max-width: 767px)').matches,
    };

    const els = {
        navTriggers:      document.querySelectorAll('.nav-trigger'),
        megaMenu:         document.querySelector('.mega-menu'),
        megaOverlay:      document.querySelector('.mega-menu-overlay'),
        hamburger:        document.querySelector('.hamburger'),
        mobileMenu:       document.querySelector('.mobile-menu'),
        mobileClose:      document.querySelector('.mobile-close'),
        mobileBreadcrumb: document.querySelector('.mobile-breadcrumb'),
        mobileNavCol:     document.querySelector('.mobile-nav-col'),
        mobileDetailCol:  document.querySelector('.mobile-detail-col'),
        searchBtn:        document.querySelector('.search-btn'),
    };

    // ===================================
    // HELPERS
    // ===================================

    /** Clear a state timer and null it out. Safe to call when already null. */
    function clearTimer(key) {
        clearTimeout(state[key]);
        state[key] = null;
    }

    function clearAllTimers() {
        clearTimer('leaveTimeout');
        clearTimer('col1HoverTimeout');
        clearTimer('col2HoverTimeout');
        clearTimer('tabHoverTimeout');
    }

    /**
     * Attach mouseenter/mouseleave hover-intent to a list of buttons.
     * @param {NodeList|Element[]} buttons
     * @param {string}   stateKey  – key in `state` for the timeout reference
     * @param {number}   delay     – intent delay in ms
     * @param {Function} skipFn    – (btn) => boolean; return true to abort on mouseenter
     * @param {Function} actionFn  – (btn) => void; called after delay
     */
    function addHoverIntent(buttons, stateKey, delay, skipFn, actionFn) {
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                clearTimer(stateKey);
                if (skipFn?.(btn)) return;
                state[stateKey] = setTimeout(() => {
                    actionFn(btn);
                    state[stateKey] = null;
                }, delay);
            });
            btn.addEventListener('mouseleave', () => clearTimer(stateKey));
        });
    }

    // ===================================
    // DESKTOP MENU HANDLERS
    // ===================================

    function setupDesktopMenu() {
        els.navTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', handleNavEnter);
            trigger.addEventListener('click', handleNavClick);
        });

        els.megaOverlay.addEventListener('click', closeMegaMenu);

        els.megaMenu.addEventListener('mouseleave', () => {
            state.leaveTimeout = setTimeout(closeMegaMenu, 175);
        });
        els.megaMenu.addEventListener('mouseenter', () => clearTimer('leaveTimeout'));

        els.searchBtn?.addEventListener('click', () => closeMegaMenu());

        setupProductsMenu();
        setupTabbedMenus();
    }

    function handleNavEnter(e) {
        if (window.innerWidth <= 1024) return;
        clearTimer('leaveTimeout');
        openMegaMenu(e.target.dataset.menu);
    }

    function handleNavClick(e) {
        if (window.innerWidth <= 1024) return;
        e.preventDefault();
        const menuName = e.target.dataset.menu;
        state.currentMenu === menuName ? closeMegaMenu() : openMegaMenu(menuName);
    }

    function openMegaMenu(menuName) {
        state.currentMenu = menuName;

        els.megaOverlay.classList.add('active');
        els.megaMenu.classList.add('active');
        els.megaMenu.setAttribute('aria-hidden', 'false');

        els.navTriggers.forEach(t => t.setAttribute('aria-expanded', t.dataset.menu === menuName));

        document.querySelectorAll('.mega-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === menuName);
        });

        if (menuName === 'products') activateProductCategory('overview');
    }

    function closeMegaMenu() {
        state.currentMenu = null;
        clearAllTimers();

        els.megaOverlay.classList.remove('active');
        els.megaMenu.classList.remove('active');
        els.megaMenu.setAttribute('aria-hidden', 'true');

        els.navTriggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
    }

    // ===================================
    // PRODUCTS MENU
    // ===================================

    function setupProductsMenu() {
        const col1Buttons     = document.querySelectorAll('.products-grid .col-1 .menu-btn');
        const col2Buttons     = document.querySelectorAll('.products-grid .col-2 .menu-btn');
        const accordionHeaders = document.querySelectorAll('.accordion .acc-header');

        addHoverIntent(
            col1Buttons, 'col1HoverTimeout', 120,
            btn => btn.dataset.sub === state.currentCategory,
            btn => activateProductCategory(btn.dataset.sub)
        );

        addHoverIntent(
            col2Buttons, 'col2HoverTimeout', 120,
            btn => btn.dataset.crypto === state.currentCrypto,
            btn => activateCryptoType(btn.dataset.crypto)
        );

        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => toggleAccordion(header.closest('.accordion')));
        });
    }

    function activateProductCategory(category) {
        state.currentCategory = category;

        document.querySelectorAll('.products-grid .col-1 .menu-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sub === category);
        });

        const col2 = document.querySelector('.products-grid .col-2');
        if (category === 'hardware') {
            col2.setAttribute('data-active', 'true');
            activateCryptoType('pqc');
        } else {
            col2.setAttribute('data-active', 'false');
        }

        document.querySelectorAll('.products-grid .sub-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.content === category);
        });

        const col3 = document.querySelector('.products-grid .col-3');
        if (col3) col3.scrollTop = 0;
    }

    function activateCryptoType(cryptoType) {
        state.currentCrypto = cryptoType;

        document.querySelectorAll('.products-grid .col-2 .menu-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.crypto === cryptoType);
        });

        document.querySelectorAll('.crypto-section').forEach(section => {
            section.classList.toggle('active', section.dataset.cryptoSection === cryptoType);
        });

        const activeSection = document.querySelector(`.crypto-section[data-crypto-section="${cryptoType}"]`);
        activeSection?.querySelectorAll('.accordion').forEach((acc, i) => {
            acc.classList.toggle('active', i === 0);
            acc.querySelector('.acc-header').setAttribute('aria-expanded', i === 0);
        });

        const col3 = document.querySelector('.products-grid .col-3');
        if (col3) col3.scrollTop = 0;
    }

    function toggleAccordion(accordion) {
        const isActive = accordion.classList.contains('active');
        const scope = accordion.closest('.crypto-section') ?? accordion.closest('.accordion-list');

        // Close all open accordions in scope, animating from actual height to 0
        scope.querySelectorAll('.accordion.active').forEach(acc => {
            const body = acc.querySelector('.acc-body');
            body.style.maxHeight = body.scrollHeight + 'px'; // pin before animating
            void body.offsetHeight;                          // force reflow
            body.style.maxHeight = '0';
            acc.classList.remove('active');
            acc.querySelector('.acc-header').setAttribute('aria-expanded', 'false');
        });

        // Open the clicked accordion if it was closed
        if (!isActive) {
            accordion.classList.add('active');
            accordion.querySelector('.acc-header').setAttribute('aria-expanded', 'true');
            const body = accordion.querySelector('.acc-body');
            body.style.maxHeight = body.scrollHeight + 'px';
            body.addEventListener('transitionend', () => {
                if (accordion.classList.contains('active')) body.style.maxHeight = '';
            }, { once: true });
        }
    }

    // ===================================
    // TABBED MENUS (Insights, Newsroom, Company)
    // ===================================

    function setupTabbedMenus() {
        document.querySelectorAll('[data-panel="insights"], [data-panel="newsroom"], [data-panel="company"]')
            .forEach(panel => {
                const tabButtons = panel.querySelectorAll('.sidebar .menu-btn');

                addHoverIntent(
                    tabButtons, 'tabHoverTimeout', 120,
                    btn => btn.classList.contains('active'),
                    btn => {
                        const tabName = btn.dataset.tab;
                        tabButtons.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        panel.querySelectorAll('.tab-content').forEach(c => {
                            c.classList.toggle('active', c.dataset.tabContent === tabName);
                        });
                        panel.querySelectorAll('.bg-image').forEach(bg => {
                            bg.classList.toggle('active', bg.dataset.bg === tabName);
                        });
                    }
                );
            });
    }

    // ===================================
    // MOBILE / TABLET MENU
    // ===================================
    //
    // View Stack Navigation Model:
    //   state.viewStack = [{ type, label, data? }, ...]
    //   Tablet: shows stack[N-2] in left col, stack[N-1] in right col
    //   Mobile: shows stack[N-1] in single col
    //   Breadcrumb (tablet): stack[1..N-2], (mobile): stack[1..N-1]

    function setupMobileMenu() {
        els.hamburger?.addEventListener('click', toggleMobileMenu);
        els.mobileClose?.addEventListener('click', closeMobileMenu);

        // Close menu with animation when a real link is clicked
        els.mobileMenu?.addEventListener('click', e => {
            const link = e.target.closest('a[href]');
            if (!link || link.getAttribute('href') === '#') return;

            e.preventDefault();
            const href = link.getAttribute('href');
            closeMobileMenu();

            els.mobileMenu.addEventListener('transitionend', function handler(te) {
                if (te.propertyName === 'transform') {
                    els.mobileMenu.removeEventListener('transitionend', handler);
                    window.location.href = href;
                }
            });
        });
    }

    function toggleMobileMenu() {
        els.mobileMenu.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
    }

    function openMobileMenu() {
        els.mobileMenu.classList.add('active');
        els.mobileMenu.setAttribute('aria-hidden', 'false');
        els.hamburger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('no-scroll');

        state.viewStack = [{ type: 'main-nav', label: null }];
        if (state.isTablet) state.viewStack.push({ type: 'products', label: 'Products' });
        renderCurrentViews();
    }

    function closeMobileMenu() {
        els.mobileMenu.classList.remove('active');
        els.mobileMenu.setAttribute('aria-hidden', 'true');
        els.hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');

        state.viewStack    = [];
        state.prevLeftType  = null;
        state.prevRightType = null;
        state.prevRightData = null;
        els.mobileBreadcrumb.classList.remove('active');
        els.mobileBreadcrumb.innerHTML = '';
    }

    function navigateToStackIndex(index) {
        state.navDirection = 'back';
        state.viewStack = state.viewStack.slice(0, index + 1);
        if (state.isTablet && state.viewStack.length < 2) {
            state.viewStack.push({ type: 'products', label: 'Products' });
        }
        renderCurrentViews();
    }

    function animateSlide(container, renderFn) {
        const enterClass = state.navDirection === 'forward' ? 'slide-in-right' : 'slide-in-left';
        container.classList.remove('slide-in-right', 'slide-in-left');
        renderFn();
        void container.offsetWidth; // force reflow to restart animation
        container.classList.add(enterClass);
        container.addEventListener('animationend', function handler() {
            container.classList.remove('slide-in-right', 'slide-in-left');
            container.removeEventListener('animationend', handler);
        });
    }

    function renderCurrentViews() {
        const stack = state.viewStack;
        const shouldAnimate = state.navDirection !== null;

        if (state.isTablet) {
            if (stack.length < 2) stack.push({ type: 'products', label: 'Products' });

            const leftEntry  = stack[stack.length - 2];
            const rightEntry = stack[stack.length - 1];
            const leftChanged  = leftEntry.type !== state.prevLeftType;
            const rightChanged = rightEntry.type !== state.prevRightType
                || JSON.stringify(rightEntry.data) !== JSON.stringify(state.prevRightData);

            if (shouldAnimate && leftChanged) {
                animateSlide(els.mobileNavCol, () => renderView(leftEntry, els.mobileNavCol, 'left'));
            } else {
                renderView(leftEntry, els.mobileNavCol, 'left');
            }

            if (shouldAnimate && rightChanged) {
                animateSlide(els.mobileDetailCol, () => renderView(rightEntry, els.mobileDetailCol, 'right'));
            } else {
                renderView(rightEntry, els.mobileDetailCol, 'right');
            }

            state.prevLeftType  = leftEntry.type;
            state.prevRightType = rightEntry.type;
            state.prevRightData = rightEntry.data ?? null;
        } else {
            // Mobile: show the last view in the appropriate column
            const isSingleView = stack.length <= 1;
            const targetCol    = isSingleView ? els.mobileNavCol : els.mobileDetailCol;

            // Only slide-animate content when the target column is already visible.
            // When the column is entering/leaving the viewport, its own CSS transition
            // (transform translateX) handles the movement — adding animateSlide on top
            // causes the content to appear twice.
            const colAlreadyVisible = isSingleView
                ? !els.mobileNavCol.classList.contains('hidden')
                : els.mobileDetailCol.classList.contains('active');

            if (shouldAnimate && colAlreadyVisible) {
                animateSlide(targetCol, () => renderView(stack.at(-1), targetCol, 'single'));
            } else {
                renderView(stack.at(-1), targetCol, 'single');
            }

            els.mobileNavCol.classList.toggle('hidden', !isSingleView);
            els.mobileDetailCol.classList.toggle('active', !isSingleView);
        }

        state.navDirection = null;
        updateBreadcrumb();
    }

    function renderView(entry, container, position) {
        const renderers = {
            'main-nav':      () => renderMainNavView(container, position),
            'products':      () => renderProductsSubView(container, position),
            'applications':  () => renderApplicationsView(container),
            'insights':      () => renderInsightsSubView(container, position),
            'newsroom':      () => renderNewsroomSubView(container),
            'product-cards': () => renderProductCardsView(container, entry.data),
            'company':       () => renderCompanySubView(container, position),
            'crypto-types':  () => renderCryptoTypesView(container, position),
            'crypto-detail': () => renderCryptoDetailView(container, entry.data.cryptoId),
        };
        renderers[entry.type]?.();
    }

    // --- Main Nav View ---
    function renderMainNavView(container, position) {
        const items = [
            { id: 'products',     label: 'Products' },
            { id: 'applications', label: 'Applications' },
            { id: 'insights',     label: 'Insights' },
            { id: 'newsroom',     label: 'Newsroom' },
            { id: 'company',      label: 'Company' },
        ];

        let activeId = 'products';
        if (state.isTablet && state.viewStack.length >= 2) {
            activeId = state.viewStack.at(-1).type;
        }

        container.innerHTML = `<ul class="menu-list">${
            items.map(item =>
                `<li><button class="menu-btn${item.id === activeId ? ' active' : ''}" data-nav="${item.id}">${item.label}</button></li>`
            ).join('')
        }</ul>`;

        container.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const navId = btn.dataset.nav;
                state.navDirection = 'forward';
                if (position === 'left') {
                    // Tablet: reset stack to [main-nav, selected]
                    state.viewStack = [state.viewStack[0], { type: navId, label: btn.textContent }];
                } else {
                    state.viewStack.push({ type: navId, label: btn.textContent });
                }
                renderCurrentViews();
            });
        });
    }

    // --- Products Sub View ---
    function renderProductsSubView(container, position) {
        const items = [
            { id: 'overview',  label: 'Product Overview',                href: 'https://fortifyiq.com/products-overview/' },
            { id: 'hardware',  label: 'Cryptographic Hardware IP Cores',  hasChildren: true },
            { id: 'software',  label: 'Cryptographic Software Libraries', hasChildren: true },
            { id: 'pqc-main', label: 'PQC – Post-Quantum Cryptography',  hasChildren: true },
            { id: 'forti',     label: 'Forti EDA Validation Studios',     hasChildren: true },
            { id: 'security',  label: 'Security Assurance',               hasChildren: true },
        ];

        let activeId = null;
        if (position === 'left') {
            const rightView = state.viewStack.at(-1);
            if (rightView.type === 'crypto-types' || rightView.type === 'crypto-detail') {
                activeId = 'hardware';
            } else if (rightView.type === 'product-cards' && rightView.data) {
                activeId = rightView.data.categoryId;
            }
        }

        container.innerHTML = `<ul class="menu-list">${
            items.map(item =>
                item.href
                    ? `<li><a class="menu-btn" href="${item.href}">${item.label}</a></li>`
                    : `<li><button class="menu-btn${item.id === activeId ? ' active' : ''}" data-item="${item.id}"${item.hasChildren ? ' data-has-children="true"' : ''}>${item.label}</button></li>`
            ).join('')
        }</ul>`;

        const navigable = new Set(['hardware', 'software', 'pqc-main', 'forti', 'security']);

        container.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.item;
                if (!navigable.has(itemId)) return;
                state.navDirection = 'forward';

                const viewEntry = itemId === 'hardware'
                    ? { type: 'crypto-types', label: btn.textContent }
                    : { type: 'product-cards', label: btn.textContent, data: { categoryId: itemId } };

                if (position === 'left') {
                    state.viewStack[state.viewStack.length - 1] = viewEntry;
                } else {
                    state.viewStack.push(viewEntry);
                }
                renderCurrentViews();
            });
        });
    }

    // --- Crypto Types View ---
    function renderCryptoTypesView(container, position) {
        const cryptoTypes = [
            { id: 'pqc',         label: 'PQC',            icon: 'mm-icon-pqc',            href: 'https://fortifyiq.com/ip-catalog/protecting-quantum-era-cryptography/' },
            { id: 'aes',         label: 'AES',            icon: 'mm-icon-aes',            href: 'https://fortifyiq.com/ip-catalog/fortiaes/' },
            { id: 'hmac',        label: 'HMAC SHA2',      icon: 'mm-icon-hmac',           href: 'https://fortifyiq.com/ip-catalog/fortimac-hmac-sha2/' },
            { id: 'ecc',         label: 'ECC/RSA',        icon: 'mm-icon-ecc',            href: 'https://fortifyiq.com/ip-catalog/fortipka/' },
            { id: 'cryptoboxes', label: 'CryptoBoxes',    icon: 'mm-icon-cryptoboxes',    href: 'https://fortifyiq.com/ip-catalog/forticryptobox/' },
            { id: 'roots',       label: 'Roots of Trust', icon: 'mm-icon-root-of-trust',  href: 'https://fortifyiq.com/ip-catalog/fortitrust/' },
        ];

        let activeId = null;
        if (position === 'left') {
            const rightView = state.viewStack.at(-1);
            if (rightView.type === 'crypto-detail') activeId = rightView.data?.cryptoId;
        }

        container.innerHTML = `<ul class="menu-list crypto-types">${
            cryptoTypes.map(type =>
                `<li><a class="menu-btn${type.id === activeId ? ' active' : ''}" href="${type.href}" data-crypto="${type.id}"><svg class="mm-icon crypto-icon" width="28" height="28" aria-hidden="true"><use href="#${type.icon}"></use></svg>${type.label}</a></li>`
            ).join('')
        }</ul>`;

        container.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault();
                const cryptoId = btn.dataset.crypto;
                state.navDirection = 'forward';
                const viewEntry = { type: 'crypto-detail', label: btn.textContent.trim(), data: { cryptoId } };
                if (position === 'left') {
                    state.viewStack[state.viewStack.length - 1] = viewEntry;
                } else {
                    state.viewStack.push(viewEntry);
                }
                renderCurrentViews();
            });
        });
    }

    // --- Crypto Detail View (accordion) ---
    function renderCryptoDetailView(container, cryptoId) {
        container.innerHTML = `<div class="accordion-list">${
            getCryptoAccordionData(cryptoId).map((acc, i) => `
                <div class="accordion${i === 0 ? ' active' : ''}">
                    <button class="acc-header" aria-expanded="${i === 0}">
                        <span>${acc.title}</span>
                        <svg width="12" height="12" class="acc-icon">
                            <path d="M2 4l4 4 4-4" stroke="currentColor" fill="none" stroke-width="2"/>
                        </svg>
                    </button>
                    <div class="acc-body">
                        <ul class="link-list">${acc.items.map(item => `<li><a href="${item.url}">${item.label}</a></li>`).join('')}</ul>
                    </div>
                </div>`
            ).join('')
        }</div>`;

        container.querySelectorAll('.acc-header').forEach(header => {
            header.addEventListener('click', () => toggleAccordion(header.closest('.accordion')));
        });
    }

    // --- Applications View ---
    function renderApplicationsView(container) {
        const apps = [
            { title: 'Finance and Banking',                 icon: 'mm-icon-app-finance',           href: 'https://fortifyiq.com/applications/finance-and-banking/' },
            { title: 'Industrial Automation',               icon: 'mm-icon-app-industrial-automation', href: 'https://fortifyiq.com/applications/automotive/' },
            { title: 'Edge Devices',                        icon: 'mm-icon-app-edge-devices',      href: '#' },
            { title: 'Government and Public Sector',        icon: 'mm-icon-app-government',        href: 'https://fortifyiq.com/applications/government-and-public-sector/' },
            { title: 'Smart Grid &amp; Energy',             icon: 'mm-icon-app-smart-gird',        href: 'https://fortifyiq.com/applications/smart-grid-energy/' },
            { title: 'Internet of Things (IoT)',            icon: 'mm-icon-app-iot',               href: 'https://fortifyiq.com/applications/internet-of-things/' },
            { title: 'Digital Identity &amp; Smart Cards',  icon: 'mm-icon-app-digital-id',        href: 'https://fortifyiq.com/applications/digital-identity-smart-cards/' },
            { title: 'Critical Infrastructure',             icon: 'mm-icon-app-critical-infra',    href: 'https://fortifyiq.com/applications/critical-infrastructure/' },
            { title: 'Medical Devices and Implants',        icon: 'mm-icon-app-medical',           href: 'https://fortifyiq.com/applications/medical-devices-and-implants/' },
            { title: 'Telecommunications',                  icon: 'mm-icon-app-telecommunications', href: 'https://fortifyiq.com/applications/telecommunications/' },
            { title: 'Transportation',                      icon: 'mm-icon-app-transportation',    href: 'https://fortifyiq.com/applications/transportation/' },
            { title: 'Pay TV &amp; Media',                  icon: 'mm-icon-app-pay-tv',            href: 'https://fortifyiq.com/applications/pay-tv-media/' },
            { title: 'Automotive',                          icon: 'mm-icon-app-automotive',        href: 'https://fortifyiq.com/applications/automotive/' },
            { title: 'Data Centers',                        icon: 'mm-icon-app-data-centers',      href: 'https://fortifyiq.com/applications/data-centers/' },
            { title: 'IP Security &amp; Anti\u2011Cloning', icon: 'mm-icon-app-ip-security',       href: 'https://fortifyiq.com/applications/ip-security-anti-cloning/' },
        ];

        container.innerHTML = `<div class="tablet-card-grid tablet-card-grid--apps">${
            apps.map(app =>
                `<a href="${app.href}" class="tablet-app-card"><span class="tablet-card-icon"><svg class="mm-icon" width="32" height="32" aria-hidden="true"><use href="#${app.icon}"></use></svg></span><span class="tablet-card-title">${app.title}</span></a>`
            ).join('')
        }</div>`;
    }

    // --- Newsroom Sub View ---
    function renderNewsroomSubView(container) {
        renderCardListView(container, [
            { id: 'news',     label: 'News',           desc: 'Stay up to date with the latest company updates',                              icon: 'mm-icon-newsroom-news',    href: 'https://fortifyiq.com/newsroom/news/' },
            { id: 'press',    label: 'Press Releases', desc: 'Access our official statements, media announcements, and company news',       icon: 'mm-icon-newsroom-press',   href: 'https://fortifyiq.com/newsroom/press-releases/' },
            { id: 'webinars', label: 'Webinars',       desc: 'Explore upcoming and on-demand online sessions',                              icon: 'mm-icon-newsroom-webinar', href: 'https://fortifyiq.com/newsroom/webinars/' },
            { id: 'events',   label: 'Events',         desc: 'Discover details about upcoming and past events',                             icon: 'mm-icon-newsroom-events',  href: 'https://fortifyiq.com/newsroom/events/' },
        ]);
    }

    // --- Product Cards View ---
    function renderProductCardsView(container, data) {
        const cardsData = {
            software: [
                { title: 'PQC Cryptographic Libraries',     desc: 'Provide high-assurance cryptographic protection, engineered for AVA_VAN.5 compliance and designed for high-security certification.',      href: 'https://fortifyiq.com/software-cryptography/fortipqc-software-libraries/' },
                { title: 'AES Cryptographic Libraries',     desc: 'Secures both new and already-deployed devices, including those without hardware countermeasures, and is proven in millions of systems.',   href: 'https://fortifyiq.com/products/fiq-aes01-cl-fortiaes-high-assurance-cryptographic-library/' },
                { title: 'HMAC SHA2 Cryptographic Library', desc: 'Provides ultra-strong protection against SCA, FIA, and cache attacks.',                                                                    href: 'https://fortifyiq.com/products/fortimac-library-advanced-hmac-sha2-dpa-and-fia-resistant-software-library/' },
                { title: 'FAQ: Cryptographic Libraries',    desc: 'What are side-channel and fault-injection attacks, and why would your device need protection against them? Etc.',                         href: 'https://fortifyiq.com/software-cryptography/faq-software-crypto-libraries/' },
            ],
            'pqc-main': [
                { title: 'PQC Hardware Solutions',             desc: 'Provides a comprehensive suite of post-quantum cryptography hardware, including CryptoBoxes, IP cores, and Root-of-Trust modules.', href: 'https://fortifyiq.com/ip-catalog/protecting-quantum-era-cryptography/' },
                { title: 'PQC Software Libraries',             desc: 'Provide high-assurance cryptographic protection, engineered for AVA_VAN.5 compliance and designed for high-security certification.', href: 'https://fortifyiq.com/software-cryptography/fortipqc-software-libraries/' },
                { title: 'PQC Hybrid + Classical',             desc: 'CryptoBoxes and Roots of Trust (RoTs) integrate post-quantum and classical cryptography in a unified, high-assurance architecture.', href: 'https://fortifyiq.com/pqc/' },
                { title: 'FAQ: Our Post Quantum Cryptography', desc: 'Why post-quantum cryptography matters? Etc.',                                                                                          href: '#' },
                { title: 'PQC: Myths vs Facts',                desc: 'The most popular myths and facts about post-quantum cryptography.',                                                                    href: '#' },
            ],
            forti: [
                { title: 'Fault Injection Studio',             desc: 'Enables engineers to evaluate and strengthen hardware designs against fault injection attacks, e.g., DFA, SIFA, and AFA.',                                                              href: '#' },
                { title: 'Side\u2011Channel Studio',            desc: 'Pre-silicon EDA tool suite designed to identify, analyze, and mitigate side-channel vulnerabilities in hardware designs from RTL.',                                                    href: 'https://fortifyiq.com/forti-eda-validation-studios/side-channel-studio/' },
                { title: 'Security Assessment & Verification', desc: 'Mathematically sound and practically validated patented/patent-pending countermeasures, ensuring resistance to the most advanced physical attacks.',                                    href: 'https://fortifyiq.com/forti-eda-validation-studios/security-validation/' },
            ],
            security: [
                { title: 'Security Validation & Cryptographic Assurance',   desc: 'Mathematically sound and practically validated patented/patent-pending countermeasures, ensuring resistance to the most advanced physical attacks.',  href: 'https://fortifyiq.com/fortifyiq-security-assurance/security-validation-cryptographic-assurance/' },
                { title: 'FAQ: Security Validation & Compliance Assurance', desc: 'How does FortifyIQ validate resistance to side-channel and fault-injection attacks? Etc.',                                                            href: 'https://fortifyiq.com/fortifyiq-security-assurance/faq-security-validation-compliance-assurance/' },
            ],
        };

        container.innerHTML = `<div class="tablet-card-grid">${
            (cardsData[data.categoryId] ?? []).map(card =>
                `<a href="${card.href}" class="tablet-info-card"><h3>${card.title}</h3><p>${card.desc}</p></a>`
            ).join('')
        }</div>`;
    }

    // --- Insights Sub View ---
    function renderInsightsSubView(container) {
        renderCardListView(container, [
            { id: 'academic', label: 'Academic Papers',    desc: 'This section features our academic publications',                     icon: 'mm-icon-insight-academic',    href: 'https://fortifyiq.com/insights/academic-papers/' },
            { id: 'white',    label: 'White Papers',       desc: 'This section demonstrates how we validate cryptographic solutions',   icon: 'mm-icon-insight-whitepapers', href: 'https://fortifyiq.com/insights/white-papers/' },
            { id: 'videos',   label: 'Explanatory Videos', desc: 'Our explanatory videos break down complex hardware security concepts', icon: 'mm-icon-insight-videos',      href: 'https://fortifyiq.com/insights/explanatory-videos/' },
        ]);
    }

    // --- Company Sub View ---
    function renderCompanySubView(container) {
        renderCardListView(container, [
            { id: 'about',    label: 'About Us',                   desc: 'Pioneers in hardware-based security innovation',             icon: 'mm-icon-company-about',    href: 'https://fortifyiq.com/company/about-us/' },
            { id: 'services', label: 'Security & Crypto Boutique', desc: "Leverage the industry's best-practice expertise",            icon: 'mm-icon-company-security', href: 'https://fortifyiq.com/company/secure-systems-boutique/' },
            { id: 'team',     label: 'Our Team',                   desc: 'A unique blend of industry veterans with deep expertise',    icon: 'mm-icon-company-team',     href: 'https://fortifyiq.com/company/our-team/' },
            { id: 'careers',  label: 'Careers',                    desc: 'We seek exceptional, passionate individuals',               icon: 'mm-icon-company-careers',  href: 'https://fortifyiq.com/company/careers/' },
        ]);
    }

    // --- Shared: icon + title + description card list ---
    function renderCardListView(container, items) {
        container.innerHTML = `<div class="tablet-card-grid tablet-card-grid--single">${
            items.map(item =>
                `<a href="${item.href ?? '#'}" class="tablet-app-card tablet-app-card--detail">
                    <span class="tablet-card-icon"><svg class="mm-icon" width="24" height="24" aria-hidden="true"><use href="#${item.icon}"></use></svg></span>
                    <span class="tablet-card-text"><span class="tablet-card-title">${item.label}</span><span class="tablet-card-desc">${item.desc}</span></span>
                </a>`
            ).join('')
        }</div>`;
    }

    // --- Crypto Accordion Data ---
    function getCryptoAccordionData(cryptoId) {
        const data = {
            pqc: [
                {
                    title: 'Post-Quantum Cryptography Solutions',
                    items: [
                        { label: 'PQC-ML-KEM (Kyber) – Compact',                              url: 'https://fortifyiq.com/products/fiq-pqc-01-c-post-quantum-ml-kem-ip-core/' },
                        { label: 'PQC-ML-DSA (Dilithium) – Compact',                          url: 'https://fortifyiq.com/products/fiq-pqc-02-c-post-quantum-ml-dsa-dilithium-accelerator/' },
                        { label: 'ML-KEM & -DSA + support of SPHINCS+, XMSS, LMS – Balanced', url: 'https://fortifyiq.com/products/fiq-pqc-03-b-post-quantum-accelerator/' },
                        { label: 'Hybrid: PQC + Classical RSA/ECC - Balanced',                 url: 'https://fortifyiq.com/products/fiq-pqc-04-b-hybrid-classical-and-post-quantum-cryptography/' },
                        { label: 'Hybrid: PQC + Classical RSA/ECC - Fast',                     url: 'https://fortifyiq.com/products/fiq-pqc-05-f-high-performance-hybrid-classical-and-post-quantum-cryptography/' },
                        { label: 'ML-KEM Hardened Post-Quantum Key Encapsulation SW Library',  url: 'https://fortifyiq.com/products/fiq-pqc-01-cl-ml-kem-cryptographic-library/' },
                        { label: 'ML-DSA Hardened Post-Quantum Signature SW Library',          url: 'https://fortifyiq.com/products/fiq-pqc-02-cl-ml-dsa-cryptographic-library/' },
                    ],
                },
            ],
            aes: [
                {
                    title: 'AES-SX Family (Standard, GCM/XTS, DFA-protected)',
                    items: [
                        { label: 'AES-SX | ECB-only – Compact',                        url: 'https://fortifyiq.com/products/fiq-aes-01-c-aes-sx-secure-core/' },
                        { label: 'AES-SX | all modes of operation supported – Balanced', url: 'https://fortifyiq.com/products/fiq-aes-02-b-es-sx-secure-core/' },
                        { label: 'AES-SX | all modes of operation supported – Fast',     url: 'https://fortifyiq.com/products/fiq-aes-03-f-aes-sx-secure-core/' },
                        { label: 'AES-SX-full | encryption + decryption – Fast',         url: 'https://fortifyiq.com/products/fiq-aes-04-f-aes-sx-full-secure-core/' },
                        { label: 'AES-SX-GCM-XTS | pipelined high-throughput – Fast',   url: 'https://fortifyiq.com/products/fiq-aes-05-f-aes-sx-gcm-xts-secure-core/' },
                        { label: 'AES-SX-GCM-XTS-up | pipelined high-throughput – Fast', url: 'https://fortifyiq.com/products/fiq-aes-06-f-aes-sx-gcm-xts-up-secure-core/' },
                    ],
                },
                {
                    title: 'AES-STORM Ultra-Low Power (ULP) Family',
                    items: [
                        { label: 'AES-SX-ulp-full (STORM) – Compact',    url: 'https://fortifyiq.com/products/fiq-aes-07-c-aes-sx-ulp-full-secure-core/' },
                        { label: 'AES-SX-ulp-full (STORM) – Balanced',   url: 'https://fortifyiq.com/products/fiq-aes-08-b-aes-sx-ulp-full-secure-core/' },
                        { label: 'AES-SX-ulp-full (STORM) – Fast',       url: 'https://fortifyiq.com/products/fiq-aes-09-f-aes-sx-ulp-full-secure-core/' },
                        { label: 'AES-SX-ulp-full-up (STORM) – Fast',    url: 'https://fortifyiq.com/products/fiq-aes-10-f-aes-sx-ulp-full-secure-core/' },
                    ],
                },
                {
                    title: 'AES-XP Turbo Family (High-throughput, GCM/XTS)',
                    items: [
                        { label: 'AES-XP-GCM / encryption + decryption – Turbo',     url: 'https://fortifyiq.com/products/fiq-aes-11-t-aes-xp-gcm-ultra-high-performance-secure-core/' },
                        { label: 'AES-XP-XTS / encryption + decryption – Turbo',     url: 'https://fortifyiq.com/products/fiq-aes-12-t-aes-xp-xts-ultra-high-performance-secure-core/' },
                        { label: 'AES-XP-GCM-XTS / encryption + decryption – Turbo', url: 'https://fortifyiq.com/products/fiq-aes-13-t-aes-xp-gcm-xts-ultra-high-performance-secure-core/' },
                    ],
                },
            ],
            hmac: [
                {
                    title: 'Fast-Efficient FortiMAC Family',
                    items: [
                        { label: 'HMAC-SHA-256 – Fast', url: 'https://fortifyiq.com/products/fiq-hmac-01-f-hmac-sha-256-secure-core/' },
                        { label: 'HMAC-SHA-512 – Fast', url: 'https://fortifyiq.com/products/fiq-hmac-02-f-hmac-sha256-512-secure-core/' },
                    ],
                },
                {
                    title: 'FortiMAC Family',
                    items: [
                        { label: 'Zero-leakage HMAC-SHA-256 – Balanced', url: 'https://fortifyiq.com/products/fiq-hmac-03-b-zero-leakage-hmac-sha256-secure-core/' },
                        { label: 'Zero-leakage HMAC-SHA-512 – Balanced', url: 'https://fortifyiq.com/products/fiq-hmac-04-b-zero-leakage-hmac-sha256-512-secure-core/' },
                    ],
                },
            ],
            ecc: [
                {
                    title: 'ECC/RSA Solutions',
                    items: [
                        { label: 'ECC-ECDH-ECDSA (1-mul16 to 2-mul32) – Compact',  url: 'https://fortifyiq.com/products/fiq-pka-01-c-ecc-secure-accelerator/' },
                        { label: 'ECC-ECDH-ECDSA (1-mul16 to 2-mul32) – Balanced', url: 'https://fortifyiq.com/products/fiq-pka-02-b-ecc-secure-accelerator/' },
                        { label: 'ECC Curve25519 – Balanced',                       url: 'https://fortifyiq.com/products/fiq-pka-03-b-rsa-accelerator/' },
                        { label: 'RSA Signature – Compact',                          url: 'https://fortifyiq.com/products/fiq-pka-04-c-rsa-signature-verification-accelerator/' },
                    ],
                },
            ],
            cryptoboxes: [
                {
                    title: 'CryptoBox Solutions',
                    items: [
                        { label: 'CryptoBox Classical – Compact',      url: 'https://fortifyiq.com/products/fiq-box-01-c-crypto-box-toolset-secure-accelerator/' },
                        { label: 'CryptoBox Classical Plus – Balanced', url: 'https://fortifyiq.com/products/fiq-box-02-b-crypto-box-toolset-secure-accelerator/' },
                        { label: 'PQ-CryptoBox Hybrid – Balanced',      url: 'https://fortifyiq.com/products/fiq-box-03-b-crypto-box-toolset-secure-accelerator/' },
                        { label: 'PQ-CryptoBox Hybrid – Fast',          url: 'https://fortifyiq.com/products/fiq-box-04-f-crypto-box-toolset-secure-accelerator/' },
                    ],
                },
            ],
            roots: [
                {
                    title: 'Roots of Trust',
                    items: [
                        { label: 'Cloud – Fast',      url: 'https://fortifyiq.com/products/fiq-rot-02-f-secure-rot-core-for-data-centers/' },
                        { label: 'Chiplet – Balanced', url: 'https://fortifyiq.com/products/fiq-rot-04-f-chiplet-rot-secure-core/' },
                    ],
                },
            ],
        };

        return data[cryptoId] ?? [];
    }

    // --- Breadcrumb ---
    function updateBreadcrumb() {
        const stack = state.viewStack;
        const breadcrumbEnd = stack.length - (state.isTablet ? 2 : 1);

        if (breadcrumbEnd <= 0) {
            els.mobileBreadcrumb.classList.remove('active');
            els.mobileBreadcrumb.innerHTML = '';
            return;
        }

        els.mobileBreadcrumb.classList.add('active');
        els.mobileBreadcrumb.innerHTML = Array.from(
            { length: breadcrumbEnd },
            (_, i) => `<button class="breadcrumb-item" data-stack-index="${i + 1}"><svg class="breadcrumb-chevron" width="7" height="12" viewBox="0 0 7 12"><path d="M6 1l-5 5 5 5" stroke="currentColor" fill="none" stroke-width="1.5"/></svg><span>${stack[i + 1].label}</span></button>`
        ).join('');

        els.mobileBreadcrumb.querySelectorAll('.breadcrumb-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.stackIndex, 10);
                navigateToStackIndex(state.isTablet ? idx : idx - 1);
            });
        });
    }

    // ===================================
    // KEYBOARD NAVIGATION
    // ===================================

    function setupKeyboardNav() {
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                if (els.megaMenu.classList.contains('active'))   closeMegaMenu();
                if (els.mobileMenu.classList.contains('active')) closeMobileMenu();
                return;
            }

            if (e.key === 'Tab' && els.megaMenu.classList.contains('active')) {
                const focusable = [...els.megaMenu.querySelectorAll('button, a')];
                if (!focusable.length) return;
                const first = focusable[0];
                const last  = focusable.at(-1);
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }

    // ===================================
    // RESPONSIVE HANDLING
    // ===================================

    function setupResponsive() {
        const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1024px)');
        const mobileQuery = window.matchMedia('(max-width: 767px)');

        tabletQuery.addEventListener('change', e => {
            state.isTablet = e.matches;
            closeMegaMenu();
            if (els.mobileMenu.classList.contains('active')) renderCurrentViews();
        });

        mobileQuery.addEventListener('change', e => {
            state.isMobile = e.matches;
            closeMegaMenu();
            if (els.mobileMenu.classList.contains('active')) renderCurrentViews();
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth <= 1024 && els.megaMenu.classList.contains('active')) closeMegaMenu();
        });
    }

    // ===================================
    // INIT
    // ===================================

    function init() {
        setupDesktopMenu();
        setupMobileMenu();
        setupKeyboardNav();
        setupResponsive();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
