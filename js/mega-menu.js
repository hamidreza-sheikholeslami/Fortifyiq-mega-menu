(function() {
    'use strict';

    // State Management
    const state = {
        currentMenu: null,
        currentCategory: null,
        currentCrypto: null,
        viewStack: [],
        leaveTimeout: null,
        col1HoverTimeout: null, // Hover-intent delay for Column 1
        col2HoverTimeout: null, // Hover-intent delay for Column 2
        tabHoverTimeout: null,  // Hover-intent delay for tabbed menus
        navDirection: null, // 'forward', 'back', or null (no animation)
        prevLeftType: null,  // Track previous left column view type
        prevRightType: null, // Track previous right column view type
        prevRightData: null, // Track previous right column data (for same-type comparisons)
        isTablet: window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches,
        isMobile: window.matchMedia('(max-width: 767px)').matches
    };

    // DOM Elements
    const elements = {
        navTriggers: document.querySelectorAll('.nav-trigger'),
        megaMenu: document.querySelector('.mega-menu'),
        megaOverlay: document.querySelector('.mega-menu-overlay'),
        hamburger: document.querySelector('.hamburger'),
        mobileMenu: document.querySelector('.mobile-menu'),
        mobileClose: document.querySelector('.mobile-close'),
        mobileBreadcrumb: document.querySelector('.mobile-breadcrumb'),
        mobileNavCol: document.querySelector('.mobile-nav-col'),
        mobileDetailCol: document.querySelector('.mobile-detail-col'),
        searchBtn: document.querySelector('.search-btn')
    };

    // Initialize
    function init() {
        setupDesktopMenu();
        setupMobileMenu();
        setupKeyboardNav();
        setupResponsive();
        
        // Auto-activate first items
        autoActivateFirstItems();
    }

    // ===================================
    // DESKTOP MENU HANDLERS
    // ===================================

    function setupDesktopMenu() {
        // Nav trigger hover/click
        elements.navTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', handleNavEnter);
            trigger.addEventListener('click', handleNavClick);
        });

        // Close on overlay click
        elements.megaOverlay.addEventListener('click', closeMegaMenu);

        // Setup Products menu
        setupProductsMenu();
        
        // Setup Insights/Company/Newsroom tabs
        setupTabbedMenus();

        // Close delay on menu leave
        elements.megaMenu.addEventListener('mouseleave', () => {
            state.leaveTimeout = setTimeout(closeMegaMenu, 175);
        });

        elements.megaMenu.addEventListener('mouseenter', () => {
            if (state.leaveTimeout) {
                clearTimeout(state.leaveTimeout);
                state.leaveTimeout = null;
            }
        });

        // Search toggle collapses mega
        if (elements.searchBtn) {
            elements.searchBtn.addEventListener('click', () => {
                closeMegaMenu();
                // Handle search expansion here
            });
        }
    }

    function handleNavEnter(e) {
        if (window.innerWidth <= 1024) return;
        
        const menuName = e.target.dataset.menu;
        
        if (state.leaveTimeout) {
            clearTimeout(state.leaveTimeout);
            state.leaveTimeout = null;
        }

        openMegaMenu(menuName);
    }

    function handleNavClick(e) {
        if (window.innerWidth <= 1024) return;
        
        e.preventDefault();
        const menuName = e.target.dataset.menu;
        
        if (state.currentMenu === menuName) {
            closeMegaMenu();
        } else {
            openMegaMenu(menuName);
        }
    }

    function openMegaMenu(menuName) {
        // Update current menu
        state.currentMenu = menuName;

        // Show overlay and menu
        elements.megaOverlay.classList.add('active');
        elements.megaMenu.classList.add('active');
        elements.megaMenu.setAttribute('aria-hidden', 'false');

        // Update nav triggers
        elements.navTriggers.forEach(trigger => {
            const isActive = trigger.dataset.menu === menuName;
            trigger.setAttribute('aria-expanded', isActive);
        });

        // Show correct panel
        const panels = document.querySelectorAll('.mega-panel');
        panels.forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === menuName);
        });

        // Auto-activate first item if needed
        if (menuName === 'products') {
            activateProductCategory('overview');
        }
    }

    function closeMegaMenu() {
        state.currentMenu = null;

        elements.megaOverlay.classList.remove('active');
        elements.megaMenu.classList.remove('active');
        elements.megaMenu.setAttribute('aria-hidden', 'true');

        elements.navTriggers.forEach(trigger => {
            trigger.setAttribute('aria-expanded', 'false');
        });

        if (state.leaveTimeout) {
            clearTimeout(state.leaveTimeout);
            state.leaveTimeout = null;
        }
        if (state.col1HoverTimeout) {
            clearTimeout(state.col1HoverTimeout);
            state.col1HoverTimeout = null;
        }
        if (state.col2HoverTimeout) {
            clearTimeout(state.col2HoverTimeout);
            state.col2HoverTimeout = null;
        }
        if (state.tabHoverTimeout) {
            clearTimeout(state.tabHoverTimeout);
            state.tabHoverTimeout = null;
        }
    }

    // ===================================
    // PRODUCTS MENU
    // ===================================

    function setupProductsMenu() {
        const col1Buttons = document.querySelectorAll('.products-grid .col-1 .menu-btn');
        const col2Buttons = document.querySelectorAll('.products-grid .col-2 .menu-btn');
        const accordionHeaders = document.querySelectorAll('.accordion .acc-header');

        // Column 1 navigation - HOVER with intent delay
        col1Buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (state.col1HoverTimeout) {
                    clearTimeout(state.col1HoverTimeout);
                }
                const category = btn.dataset.sub;
                if (category === state.currentCategory) return;
                state.col1HoverTimeout = setTimeout(() => {
                    activateProductCategory(category);
                    state.col1HoverTimeout = null;
                }, 120);
            });
            btn.addEventListener('mouseleave', () => {
                if (state.col1HoverTimeout) {
                    clearTimeout(state.col1HoverTimeout);
                    state.col1HoverTimeout = null;
                }
            });
        });

        // Column 2 crypto type navigation - HOVER with intent delay
        // Prevents flickering when mouse moves diagonally from Col 1 to Col 3
        col2Buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (state.col2HoverTimeout) {
                    clearTimeout(state.col2HoverTimeout);
                }
                const cryptoType = btn.dataset.crypto;
                // Skip delay if this item is already active
                if (cryptoType === state.currentCrypto) return;
                state.col2HoverTimeout = setTimeout(() => {
                    activateCryptoType(cryptoType);
                    state.col2HoverTimeout = null;
                }, 120);
            });
            btn.addEventListener('mouseleave', () => {
                if (state.col2HoverTimeout) {
                    clearTimeout(state.col2HoverTimeout);
                    state.col2HoverTimeout = null;
                }
            });
        });

        // Accordion toggles - keep as click
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                toggleAccordion(header.closest('.accordion'));
            });
        });
    }

    function activateProductCategory(category) {
        state.currentCategory = category;

        // Update col-1 buttons
        const col1Buttons = document.querySelectorAll('.products-grid .col-1 .menu-btn');
        col1Buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sub === category);
        });

        // Show/hide col-2
        const col2 = document.querySelector('.products-grid .col-2');
        if (category === 'hardware') {
            col2.setAttribute('data-active', 'true');
            // Auto-activate first crypto type
            activateCryptoType('pqc');
        } else {
            col2.setAttribute('data-active', 'false');
        }

        // Show correct content in col-3
        const subPanels = document.querySelectorAll('.products-grid .sub-panel');
        subPanels.forEach(panel => {
            panel.classList.toggle('active', panel.dataset.content === category);
        });

        // Reset scroll
        const col3 = document.querySelector('.products-grid .col-3');
        if (col3) col3.scrollTop = 0;
    }

    function activateCryptoType(cryptoType) {
        state.currentCrypto = cryptoType;

        // Update col-2 buttons
        const col2Buttons = document.querySelectorAll('.products-grid .col-2 .menu-btn');
        col2Buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.crypto === cryptoType);
        });

        // Show correct crypto section
        const cryptoSections = document.querySelectorAll('.crypto-section');
        cryptoSections.forEach(section => {
            section.classList.toggle('active', section.dataset.cryptoSection === cryptoType);
        });

        // Auto-expand first accordion in the section
        const activeSection = document.querySelector(`.crypto-section[data-crypto-section="${cryptoType}"]`);
        if (activeSection) {
            const accordions = activeSection.querySelectorAll('.accordion');
            accordions.forEach((acc, index) => {
                if (index === 0) {
                    acc.classList.add('active');
                    acc.querySelector('.acc-header').setAttribute('aria-expanded', 'true');
                } else {
                    acc.classList.remove('active');
                    acc.querySelector('.acc-header').setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Reset scroll
        const col3 = document.querySelector('.products-grid .col-3');
        if (col3) col3.scrollTop = 0;
    }

    function toggleAccordion(accordion) {
        const isActive = accordion.classList.contains('active');
        
        // Close all accordions in this crypto section
        const section = accordion.closest('.crypto-section');
        const accordions = section.querySelectorAll('.accordion');
        accordions.forEach(acc => {
            acc.classList.remove('active');
            acc.querySelector('.acc-header').setAttribute('aria-expanded', 'false');
        });

        // Open clicked accordion if it wasn't active
        if (!isActive) {
            accordion.classList.add('active');
            accordion.querySelector('.acc-header').setAttribute('aria-expanded', 'true');
        }
    }

    // ===================================
    // TABBED MENUS (Insights, Company)
    // ===================================

    function setupTabbedMenus() {
        const tabbedPanels = document.querySelectorAll('[data-panel="insights"], [data-panel="newsroom"], [data-panel="company"]');
        
        tabbedPanels.forEach(panel => {
            const tabButtons = panel.querySelectorAll('.sidebar .menu-btn');
            
            tabButtons.forEach(btn => {
                // HOVER with intent delay for Insights, Newsroom, Company
                btn.addEventListener('mouseenter', () => {
                    if (state.tabHoverTimeout) {
                        clearTimeout(state.tabHoverTimeout);
                    }
                    const tabName = btn.dataset.tab;
                    // Skip if already active
                    if (btn.classList.contains('active')) return;
                    state.tabHoverTimeout = setTimeout(() => {
                        // Update buttons
                        tabButtons.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');

                        // Show correct tab content
                        const tabContents = panel.querySelectorAll('.tab-content');
                        tabContents.forEach(content => {
                            content.classList.toggle('active', content.dataset.tabContent === tabName);
                        });

                        // Switch background image
                        const bgImages = panel.querySelectorAll('.bg-image');
                        bgImages.forEach(bg => {
                            bg.classList.toggle('active', bg.dataset.bg === tabName);
                        });
                        state.tabHoverTimeout = null;
                    }, 120);
                });
                btn.addEventListener('mouseleave', () => {
                    if (state.tabHoverTimeout) {
                        clearTimeout(state.tabHoverTimeout);
                        state.tabHoverTimeout = null;
                    }
                });
            });
        });
    }

    // ===================================
    // MOBILE/TABLET MENU
    // ===================================
    //
    // View Stack Navigation Model:
    // state.viewStack = [{ type, label, data }, ...]
    //   - Tablet: shows stack[N-2] in left col, stack[N-1] in right col
    //   - Mobile: shows stack[N-1] in single col
    //   - Breadcrumb (tablet): stack[1] to stack[N-2]
    //   - Breadcrumb (mobile): stack[1] to stack[N-1]

    function setupMobileMenu() {
        if (elements.hamburger) {
            elements.hamburger.addEventListener('click', toggleMobileMenu);
        }
        if (elements.mobileClose) {
            elements.mobileClose.addEventListener('click', closeMobileMenu);
        }

        // Close menu with animation when any link is clicked
        if (elements.mobileMenu) {
            elements.mobileMenu.addEventListener('click', (e) => {
                const link = e.target.closest('a[href]');
                if (!link || link.getAttribute('href') === '#') return;

                e.preventDefault();
                const href = link.getAttribute('href');
                closeMobileMenu();

                // Navigate after the slide-out animation completes
                elements.mobileMenu.addEventListener('transitionend', function handler(te) {
                    if (te.propertyName === 'transform') {
                        elements.mobileMenu.removeEventListener('transitionend', handler);
                        window.location.href = href;
                    }
                });
            });
        }
    }

    function toggleMobileMenu() {
        if (elements.mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        elements.mobileMenu.classList.add('active');
        elements.mobileMenu.setAttribute('aria-hidden', 'false');
        elements.hamburger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('no-scroll');

        state.viewStack = [{ type: 'main-nav', label: null }];
        if (state.isTablet) {
            state.viewStack.push({ type: 'products', label: 'Products' });
        }
        renderCurrentViews();
    }

    function closeMobileMenu() {
        elements.mobileMenu.classList.remove('active');
        elements.mobileMenu.setAttribute('aria-hidden', 'true');
        elements.hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');

        state.viewStack = [];
        state.prevLeftType = null;
        state.prevRightType = null;
        state.prevRightData = null;
        elements.mobileBreadcrumb.classList.remove('active');
        elements.mobileBreadcrumb.innerHTML = '';
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
        const direction = state.navDirection;
        const enterClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left';

        container.classList.remove('slide-in-right', 'slide-in-left');
        renderFn();
        // Force reflow to restart animation
        void container.offsetWidth;
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
            if (stack.length < 2) {
                stack.push({ type: 'products', label: 'Products' });
            }

            const newLeftEntry = stack[stack.length - 2];
            const newRightEntry = stack[stack.length - 1];
            const leftChanged = newLeftEntry.type !== state.prevLeftType;
            const rightChanged = newRightEntry.type !== state.prevRightType
                || JSON.stringify(newRightEntry.data) !== JSON.stringify(state.prevRightData);

            if (shouldAnimate && leftChanged) {
                animateSlide(elements.mobileNavCol, () => {
                    renderView(newLeftEntry, elements.mobileNavCol, 'left');
                });
            } else {
                renderView(newLeftEntry, elements.mobileNavCol, 'left');
            }

            if (shouldAnimate && rightChanged) {
                animateSlide(elements.mobileDetailCol, () => {
                    renderView(newRightEntry, elements.mobileDetailCol, 'right');
                });
            } else {
                renderView(newRightEntry, elements.mobileDetailCol, 'right');
            }

            state.prevLeftType = newLeftEntry.type;
            state.prevRightType = newRightEntry.type;
            state.prevRightData = newRightEntry.data || null;
        } else {
            // Mobile: show last view
            if (stack.length <= 1) {
                if (shouldAnimate) {
                    animateSlide(elements.mobileNavCol, () => {
                        renderView(stack[stack.length - 1], elements.mobileNavCol, 'single');
                    });
                } else {
                    renderView(stack[stack.length - 1], elements.mobileNavCol, 'single');
                }
                elements.mobileNavCol.classList.remove('hidden');
                elements.mobileDetailCol.classList.remove('active');
            } else {
                if (shouldAnimate) {
                    animateSlide(elements.mobileDetailCol, () => {
                        renderView(stack[stack.length - 1], elements.mobileDetailCol, 'single');
                    });
                } else {
                    renderView(stack[stack.length - 1], elements.mobileDetailCol, 'single');
                }
                elements.mobileNavCol.classList.add('hidden');
                elements.mobileDetailCol.classList.add('active');
            }
        }

        state.navDirection = null; // Reset - no animation for initial renders
        updateBreadcrumb();
    }

    function renderView(entry, container, position) {
        switch (entry.type) {
            case 'main-nav': renderMainNavView(container, position); break;
            case 'products': renderProductsSubView(container, position); break;
            case 'applications': renderApplicationsView(container); break;
            case 'insights': renderInsightsSubView(container, position); break;
            case 'newsroom': renderNewsroomSubView(container); break;
            case 'product-cards': renderProductCardsView(container, entry.data); break;
            case 'company': renderCompanySubView(container, position); break;
            case 'crypto-types': renderCryptoTypesView(container, position); break;
            case 'crypto-detail': renderCryptoDetailView(container, entry.data.cryptoId); break;
        }
    }

    // --- Main Nav View ---
    function renderMainNavView(container, position) {
        const items = [
            { id: 'products', label: 'Products' },
            { id: 'applications', label: 'Applications' },
            { id: 'insights', label: 'Insights' },
            { id: 'newsroom', label: 'Newsroom' },
            { id: 'company', label: 'Company' }
        ];

        // On tablet, highlight the item matching the right column
        let activeId = 'products';
        if (state.isTablet && state.viewStack.length >= 2) {
            activeId = state.viewStack[state.viewStack.length - 1].type;
        }

        let html = '<ul class="menu-list">';
        items.forEach(item => {
            html += `<li><button class="menu-btn${item.id === activeId ? ' active' : ''}" data-nav="${item.id}">${item.label}</button></li>`;
        });
        html += '</ul>';
        container.innerHTML = html;

        container.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const navId = btn.dataset.nav;
                const label = btn.textContent;
                state.navDirection = 'forward';

                if (position === 'left') {
                    // Tablet: reset to [main-nav, selected]
                    state.viewStack = [state.viewStack[0], { type: navId, label }];
                } else {
                    // Mobile: push
                    state.viewStack.push({ type: navId, label });
                }
                renderCurrentViews();
            });
        });
    }

    // --- Products Sub View ---
    function renderProductsSubView(container, position) {
        const items = [
            { id: 'overview', label: 'Product Overview' },
            { id: 'hardware', label: 'Cryptographic Hardware IP Cores', hasChildren: true },
            { id: 'software', label: 'Cryptographic Software Libraries', hasChildren: true },
            { id: 'pqc-main', label: 'PQC – Post-Quantum Cryptography', hasChildren: true },
            { id: 'forti', label: 'Forti EDA Validation Studios', hasChildren: true },
            { id: 'security', label: 'Security Assurance', hasChildren: true }
        ];

        // On tablet left, highlight item matching right column
        let activeId = null;
        if (position === 'left') {
            const rightView = state.viewStack[state.viewStack.length - 1];
            if (rightView.type === 'crypto-types' || rightView.type === 'crypto-detail') {
                activeId = 'hardware';
            } else if (rightView.type === 'product-cards' && rightView.data) {
                activeId = rightView.data.categoryId;
            }
        }

        let html = '<ul class="menu-list">';
        items.forEach(item => {
            html += `<li><button class="menu-btn${item.id === activeId ? ' active' : ''}" data-item="${item.id}" ${item.hasChildren ? 'data-has-children="true"' : ''}>${item.label}</button></li>`;
        });
        html += '</ul>';
        container.innerHTML = html;

        container.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.item;
                const label = btn.textContent;
                const navigableItems = ['hardware', 'software', 'pqc-main', 'forti', 'security'];

                if (!navigableItems.includes(itemId)) return;
                state.navDirection = 'forward';

                const viewEntry = itemId === 'hardware'
                    ? { type: 'crypto-types', label }
                    : { type: 'product-cards', label, data: { categoryId: itemId } };

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
            { id: 'pqc', label: 'PQC', icon: 'mm-icon-pqc' },
            { id: 'aes', label: 'AES', icon: 'mm-icon-aes' },
            { id: 'hmac', label: 'HMAC SHA2', icon: 'mm-icon-hmac' },
            { id: 'ecc', label: 'ECC/RSA', icon: 'mm-icon-ecc' },
            { id: 'cryptoboxes', label: 'CryptoBoxes', icon: 'mm-icon-cryptoboxes' },
            { id: 'roots', label: 'Roots of Trust', icon: 'mm-icon-root-of-trust' }
        ];

        // On tablet left, highlight item matching right column's crypto detail
        let activeId = null;
        if (position === 'left') {
            const rightView = state.viewStack[state.viewStack.length - 1];
            if (rightView.type === 'crypto-detail' && rightView.data) {
                activeId = rightView.data.cryptoId;
            }
        }

        let html = '<ul class="menu-list crypto-types">';
        cryptoTypes.forEach(type => {
            const isActive = type.id === activeId;
            html += `<li><button class="menu-btn${isActive ? ' active' : ''}" data-crypto="${type.id}"><svg class="mm-icon crypto-icon" width="28" height="28" aria-hidden="true"><use href="#${type.icon}"></use></svg>${type.label}</button></li>`;
        });
        html += '</ul>';
        container.innerHTML = html;

        container.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cryptoId = btn.dataset.crypto;
                const label = btn.textContent.trim();
                state.navDirection = 'forward';

                if (position === 'left') {
                    // Tablet left: replace right col
                    state.viewStack[state.viewStack.length - 1] = { type: 'crypto-detail', label, data: { cryptoId } };
                } else {
                    // Right col or mobile: push
                    state.viewStack.push({ type: 'crypto-detail', label, data: { cryptoId } });
                }
                renderCurrentViews();
            });
        });
    }

    // --- Crypto Detail View (accordion) ---
    function renderCryptoDetailView(container, cryptoId) {
        const cryptoData = getCryptoAccordionData(cryptoId);

        let html = '<div class="accordion-list">';
        cryptoData.forEach((acc, index) => {
            html += `
                <div class="accordion ${index === 0 ? 'active' : ''}">
                    <button class="acc-header" aria-expanded="${index === 0}">
                        <span>${acc.title}</span>
                        <svg width="12" height="12" class="acc-icon">
                            <path d="M2 4l4 4 4-4" stroke="currentColor" fill="none" stroke-width="2"/>
                        </svg>
                    </button>
                    <div class="acc-body">
                        <ul class="link-list">
                            ${acc.items.map(item => `<li><a href="#">${item}</a></li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;

        // Accordion toggle handlers
        container.querySelectorAll('.acc-header').forEach(header => {
            header.addEventListener('click', () => {
                const accordion = header.closest('.accordion');
                const isActive = accordion.classList.contains('active');

                container.querySelectorAll('.accordion').forEach(acc => {
                    acc.classList.remove('active');
                    acc.querySelector('.acc-header').setAttribute('aria-expanded', 'false');
                });

                if (!isActive) {
                    accordion.classList.add('active');
                    header.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    // --- Applications View (card grid) ---
    function renderApplicationsView(container) {
        const apps = [
            { title: 'Finance and Banking',            icon: 'mm-icon-app-finance' },
            { title: 'Industrial Automation',           icon: 'mm-icon-app-industrial-automation' },
            { title: 'Edge Devices',                    icon: 'mm-icon-app-edge-devices' },
            { title: 'Government and Public Sector',    icon: 'mm-icon-app-government' },
            { title: 'Smart Grid &amp; Energy',         icon: 'mm-icon-app-smart-gird' },
            { title: 'Internet of Things (IoT)',        icon: 'mm-icon-app-iot' },
            { title: 'Digital Identity &amp; Smart Cards', icon: 'mm-icon-app-digital-id' },
            { title: 'Critical Infrastructure',        icon: 'mm-icon-app-critical-infra' },
            { title: 'Medical Devices and Implants',   icon: 'mm-icon-app-medical' },
            { title: 'Telecommunications',             icon: 'mm-icon-app-telecommunications' },
            { title: 'Transportation',                 icon: 'mm-icon-app-transportation' },
            { title: 'Pay TV &amp; Media',             icon: 'mm-icon-app-pay-tv' },
            { title: 'Automotive',                     icon: 'mm-icon-app-automotive' },
            { title: 'Data Centers',                   icon: 'mm-icon-app-data-centers' },
            { title: 'IP Security &amp; Anti\u2011Cloning', icon: 'mm-icon-app-ip-security' }
        ];

        let html = '<div class="tablet-card-grid">';
        apps.forEach(app => {
            html += `<a href="#" class="tablet-app-card"><span class="tablet-card-icon"><svg class="mm-icon" width="32" height="32" aria-hidden="true"><use href="#${app.icon}"></use></svg></span><span class="tablet-card-title">${app.title}</span></a>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // --- Newsroom Sub View ---
    function renderNewsroomSubView(container) {
        const items = [
            { id: 'news',     label: 'News',            desc: 'Stay up to date with the latest company updates',                                  icon: 'mm-icon-newsroom-news' },
            { id: 'press',    label: 'Press Releases',  desc: 'Access our official statements, media announcements, and company news',             icon: 'mm-icon-newsroom-press' },
            { id: 'webinars', label: 'Webinars',        desc: 'Explore upcoming and on-demand online sessions',                                    icon: 'mm-icon-newsroom-webinar' },
            { id: 'events',   label: 'Events',          desc: 'Discover details about upcoming and past events',                                   icon: 'mm-icon-newsroom-events' }
        ];
        renderCardListView(container, items);
    }

    // --- Product Cards View (info-cards for sub-categories) ---
    function renderProductCardsView(container, data) {
        const cardsData = {
            software: [
                { title: 'PQC Cryptographic Libraries', desc: 'Provide high-assurance cryptographic protection, engineered for AVA_VAN.5 compliance and designed for high-security certification' },
                { title: 'AES Cryptographic Libraries', desc: 'Secures both new and already-deployed devices, including those without hardware countermeasures, and is proven in millions of systems' },
                { title: 'HMAC SHA2 Cryptographic Library', desc: 'Provides ultra-strong protection against SCA, FIA, and cache attacks' },
                { title: 'FAQ: Cryptographic Libraries', desc: 'What are side-channel and fault-injection attacks, and why would your device need protection against them' }
            ],
            'pqc-main': [
                { title: 'PQC Hardware Solutions', desc: 'Provides a comprehensive suite of post-quantum cryptography hardware, including CryptoBoxes, IP cores, and Root-of-Trust modules' },
                { title: 'PQC Software Libraries', desc: 'Provide high-assurance cryptographic protection, engineered for AVA_VAN.5 compliance and designed for high-security certification' },
                { title: 'PQC Hybrid + Classical', desc: 'CryptoBoxes and Roots of Trust (RoTs) integrate post-quantum and classical cryptography in a unified, high-assurance architecture' },
                { title: 'FAQ: Our Post Quantum Cryptography', desc: 'Why post-quantum cryptography matters' }
            ],
            forti: [
                { title: 'Fault Injection Studio', desc: 'Enables engineers to evaluate and strengthen hardware designs against fault injection attacks, e.g., DFA, SIFA, and AFA' },
                { title: 'Side\u2011Channel Studio', desc: 'Pre-silicon EDA tool suite designed to identify, analyze, and mitigate side-channel vulnerabilities in hardware designs from RTL' },
                { title: 'Security Assessment & Verification', desc: 'Mathematically sound and practically validated patented/patent-pending countermeasures, ensuring resistance to the most advanced physical attacks' }
            ],
            security: [
                { title: 'Security Validation & Cryptographic Assurance', desc: 'Mathematically sound and practically validated patented/patent-pending countermeasures, ensuring resistance to the most advanced physical attacks' },
                { title: 'FAQ: Security Validation & Compliance Assurance', desc: 'How does FortifyIQ validate resistance to side-channel and fault-injection attacks' }
            ]
        };

        const cards = cardsData[data.categoryId] || [];
        let html = '<div class="tablet-card-grid">';
        cards.forEach(card => {
            html += `<a href="#" class="tablet-info-card"><h3>${card.title}</h3><p>${card.desc}</p></a>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // --- Insights Sub View ---
    function renderInsightsSubView(container) {
        const items = [
            { id: 'academic', label: 'Academic Papers',      desc: 'This section features our academic publications',                       icon: 'mm-icon-insight-academic' },
            { id: 'white',    label: 'White Papers',         desc: 'This section demonstrates how we validate cryptographic solutions',     icon: 'mm-icon-insight-whitepapers' },
            { id: 'videos',   label: 'Explanatory Videos',   desc: 'Our explanatory videos break down complex hardware security concepts',   icon: 'mm-icon-insight-videos' }
        ];
        renderCardListView(container, items);
    }

    // --- Company Sub View ---
    function renderCompanySubView(container) {
        const items = [
            { id: 'about',    label: 'About Us',                    desc: 'Pioneers in hardware-based security innovation',              icon: 'mm-icon-company-about' },
            { id: 'services', label: 'Security & Crypto Boutique',  desc: 'Leverage the industry\'s best-practice expertise',           icon: 'mm-icon-company-security' },
            { id: 'team',     label: 'Our Team',                    desc: 'A unique blend of industry veterans with deep expertise',     icon: 'mm-icon-company-team' },
            { id: 'careers',  label: 'Careers',                     desc: 'We seek exceptional, passionate individuals',                icon: 'mm-icon-company-careers' }
        ];
        renderCardListView(container, items);
    }

    // --- Shared: render card list with icon + title + description ---
    function renderCardListView(container, items) {
        let html = '<div class="tablet-card-grid tablet-card-grid--single">';
        items.forEach(item => {
            html += `<a href="#" class="tablet-app-card tablet-app-card--detail">
                <span class="tablet-card-icon"><svg class="mm-icon" width="24" height="24" aria-hidden="true"><use href="#${item.icon}"></use></svg></span>
                <span class="tablet-card-text"><span class="tablet-card-title">${item.label}</span><span class="tablet-card-desc">${item.desc}</span></span>
            </a>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // --- Crypto Accordion Data ---
    function getCryptoAccordionData(cryptoId) {
        const data = {
            pqc: [
                {
                    title: 'Post-Quantum Cryptography Solutions',
                    items: [
                        'PQC-ML-KEM (Kyber) – Compact',
                        'PQC-ML-DSA (Dilithium) – Compact',
                        'ML-KEM & -DSA + support of SPHINCS+, XMSS, LMS – Balanced',
                        'Hybrid: PQC + Classical RSA/ECC - Balanced',
                        'Hybrid: PQC + Classical RSA/ECC - Fast',
                        'ML-KEM Hardened Post-Quantum Key Encapsulation SW Library',
                        'ML-DSA Hardened Post-Quantum Signature SW Library'
                    ]
                }
            ],
            aes: [
                {
                    title: 'AES-SX Family (Standard, GCM/XTS, DFA-protected)',
                    items: [
                        'AES-SX | ECB-only – Compact',
                        'AES-SX | all modes of operation supported – Balanced',
                        'AES-SX | all modes of operation supported – Fast',
                        'AES-SX-full | encryption + decryption – Fast',
                        'AES-SX-GCM-XTS | pipelined high-throughput – Fast',
                        'AES-SX-GCM-XTS-up | pipelined high-throughput – Fast'
                    ]
                },
                {
                    title: 'AES-STORM Ultra-Low Power (ULP) Family',
                    items: [
                        'AES-SX-ulp-full (STORM) – Compact',
                        'AES-SX-ulp-full (STORM) – Balanced',
                        'AES-SX-ulp-full (STORM) – Fast',
                        'AES-SX-ulp-full-up (STORM) – Fast'
                    ]
                },
                {
                    title: 'AES-XP Turbo Family (High-throughput, GCM/XTS)',
                    items: [
                        'AES-XP-GCM / encryption + decryption – Turbo',
                        'AES-XP-XTS / encryption + decryption – Turbo',
                        'AES-XP-GCM-XTS / encryption + decryption – Turbo'
                    ]
                }
            ],
            hmac: [
                {
                    title: 'Fast-Efficient FortiMAC Family',
                    items: [
                        'HMAC-SHA-256 – Fast',
                        'HMAC-SHA-512 – Fast'
                    ]
                },
                {
                    title: 'FortiMAC Family',
                    items: [
                        'Zero-leakage HMAC-SHA-256 – Balanced',
                        'Zero-leakage HMAC-SHA-512 – Balanced'
                    ]
                }
            ],
            ecc: [
                {
                    title: 'ECC/RSA Solutions',
                    items: [
                        'ECC-ECDH-ECDSA (1-mul16 to 2-mul32) – Compact',
                        'ECC-ECDH-ECDSA (1-mul16 to 2-mul32) – Balanced',
                        'ECC Curve25519 – Balanced',
                        'RSA Signature – Compact'
                    ]
                }
            ],
            cryptoboxes: [
                {
                    title: 'CryptoBox Solutions',
                    items: [
                        'CryptoBox Classical – Compact',
                        'CryptoBox Classical Plus – Balanced',
                        'PQ-CryptoBox Hybrid – Balanced',
                        'PQ-CryptoBox Hybrid – Fast'
                    ]
                }
            ],
            roots: [
                {
                    title: 'Roots of Trust',
                    items: [
                        'Cloud – Fast',
                        'Chiplet – Balanced'
                    ]
                }
            ]
        };

        return data[cryptoId] || [];
    }

    // --- Breadcrumb ---
    function updateBreadcrumb() {
        const stack = state.viewStack;
        const visibleCount = state.isTablet ? 2 : 1;
        const breadcrumbEnd = stack.length - visibleCount;

        if (breadcrumbEnd <= 0) {
            elements.mobileBreadcrumb.classList.remove('active');
            elements.mobileBreadcrumb.innerHTML = '';
            return;
        }

        elements.mobileBreadcrumb.classList.add('active');

        let html = '';
        for (let i = 1; i <= breadcrumbEnd; i++) {
            html += `<button class="breadcrumb-item" data-stack-index="${i}"><svg class="breadcrumb-chevron" width="7" height="12" viewBox="0 0 7 12"><path d="M6 1l-5 5 5 5" stroke="currentColor" fill="none" stroke-width="1.5"/></svg><span>${stack[i].label}</span></button>`;
        }

        elements.mobileBreadcrumb.innerHTML = html;

        elements.mobileBreadcrumb.querySelectorAll('.breadcrumb-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.stackIndex);
                if (state.isTablet) {
                    // Tablet: navigate so this item's view appears in the right col
                    navigateToStackIndex(idx);
                } else {
                    // Mobile: navigate to the level before this item
                    navigateToStackIndex(idx - 1);
                }
            });
        });
    }

    // ===================================
    // KEYBOARD NAVIGATION
    // ===================================

    function setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            // ESC closes mega menu
            if (e.key === 'Escape') {
                if (elements.megaMenu.classList.contains('active')) {
                    closeMegaMenu();
                }
                if (elements.mobileMenu.classList.contains('active')) {
                    closeMobileMenu();
                }
            }

            // Tab navigation within mega menu
            if (e.key === 'Tab' && elements.megaMenu.classList.contains('active')) {
                const focusableElements = elements.megaMenu.querySelectorAll('button, a');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
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

        tabletQuery.addEventListener('change', (e) => {
            state.isTablet = e.matches;
            closeMegaMenu();
            if (elements.mobileMenu.classList.contains('active')) {
                renderCurrentViews();
            }
        });

        mobileQuery.addEventListener('change', (e) => {
            state.isMobile = e.matches;
            closeMegaMenu();
            if (elements.mobileMenu.classList.contains('active')) {
                renderCurrentViews();
            }
        });

        // Close mega menu on resize to mobile
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 1024 && elements.megaMenu.classList.contains('active')) {
                closeMegaMenu();
            }
        });
    }

    // ===================================
    // AUTO-ACTIVATION
    // ===================================

    function autoActivateFirstItems() {
        // This is handled inline in the renderMobile functions and activateProductCategory
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();