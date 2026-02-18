(function() {
    'use strict';

    // State Management
    const state = {
        currentMenu: null,
        currentCategory: null,
        currentCrypto: null,
        viewStack: [],
        leaveTimeout: null,
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
    }

    // ===================================
    // PRODUCTS MENU
    // ===================================

    function setupProductsMenu() {
        const col1Buttons = document.querySelectorAll('.products-grid .col-1 .menu-btn');
        const col2Buttons = document.querySelectorAll('.products-grid .col-2 .menu-btn');
        const accordionHeaders = document.querySelectorAll('.accordion .acc-header');

        // Column 1 navigation - HOVER ACTIVATION
        col1Buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                const category = btn.dataset.sub;
                activateProductCategory(category);
            });
        });

        // Column 2 crypto type navigation - HOVER ACTIVATION
        col2Buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                const cryptoType = btn.dataset.crypto;
                activateCryptoType(cryptoType);
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
                // HOVER ACTIVATION for Insights and Company
                btn.addEventListener('mouseenter', () => {
                    const tabName = btn.dataset.tab;
                    
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
            html += `<li><button class="menu-btn${isActive ? ' active' : ''}" data-crypto="${type.id}"><img src="https://fortifyiq.com/wp-content/uploads/2026/02/${type.icon}.svg" width="28" height="28" alt="" class="crypto-icon">${type.label}</button></li>`;
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
            { title: 'Finance and Banking', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="6" width="24" height="20" rx="2"/><line x1="4" y1="12" x2="28" y2="12"/><circle cx="9" cy="20" r="2"/></svg>' },
            { title: 'Industrial Automation', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="14" width="8" height="12"/><rect x="18" y="8" width="8" height="18"/><path d="M4 26h24"/><circle cx="10" cy="10" r="4"/></svg>' },
            { title: 'Edge Devices', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="4" width="16" height="24" rx="2"/><line x1="14" y1="24" x2="18" y2="24"/><circle cx="16" cy="14" r="3"/></svg>' },
            { title: 'Government and Public Sector', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="24" height="24" rx="2"/><path d="M4 10h24"/><line x1="10" y1="16" x2="22" y2="16"/><line x1="10" y1="20" x2="18" y2="20"/></svg>' },
            { title: 'Smart Grid &amp; Energy', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="16" cy="16" r="10"/><path d="M12 8l4 8-4 8"/><path d="M20 8l-4 8 4 8"/><line x1="6" y1="16" x2="26" y2="16"/></svg>' },
            { title: 'Internet of Things (IoT)', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="16" cy="14" r="6"/><path d="M16 20v6"/><path d="M10 28h12"/><path d="M8 10l-4-2"/><path d="M24 10l4-2"/></svg>' },
            { title: 'Digital Identity &amp; Smart Cards', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="20" height="24" rx="3"/><circle cx="16" cy="16" r="4"/><line x1="12" y1="24" x2="20" y2="24"/></svg>' },
            { title: 'Critical Infrastructure', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4l10 6v12l-10 6-10-6V10z"/><line x1="16" y1="16" x2="16" y2="28"/><line x1="16" y1="16" x2="26" y2="10"/><line x1="16" y1="16" x2="6" y2="10"/></svg>' },
            { title: 'Medical Devices and Implants', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 16h8"/><path d="M16 12v8"/><rect x="6" y="6" width="20" height="20" rx="4"/><path d="M10 4v4"/><path d="M22 4v4"/></svg>' },
            { title: 'Telecommunications', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="16" cy="16" r="10"/><path d="M16 6v4"/><path d="M16 22v4"/><path d="M6 16h4"/><path d="M22 16h4"/><circle cx="16" cy="16" r="3"/></svg>' },
            { title: 'Transportation', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 26l6-8 5 4 4-6 5 6"/><rect x="4" y="6" width="24" height="20" rx="2"/></svg>' },
            { title: 'Pay TV &amp; Media', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="6" width="24" height="16" rx="2"/><polygon points="13,10 13,18 20,14"/><line x1="8" y1="26" x2="24" y2="26"/></svg>' },
            { title: 'Automotive', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="8" width="20" height="16" rx="2"/><circle cx="16" cy="16" r="4"/><path d="M6 12h20"/></svg>' },
            { title: 'Data Centers', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="8" width="24" height="18" rx="2"/><path d="M4 14h24"/><rect x="8" y="18" width="6" height="4"/><rect x="18" y="18" width="6" height="4"/></svg>' },
            { title: 'IP Security &amp; Anti\u2011Cloning', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="20" height="24" rx="2"/><path d="M16 14v6"/><path d="M13 17h6"/><circle cx="16" cy="10" r="2"/></svg>' }
        ];

        let html = '<div class="tablet-card-grid">';
        apps.forEach(app => {
            html += `<a href="#" class="tablet-app-card"><span class="tablet-card-icon">${app.icon}</span><span class="tablet-card-title">${app.title}</span></a>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // --- Newsroom Sub View ---
    function renderNewsroomSubView(container) {
        const items = [
            { id: 'news', label: 'News', desc: 'Stay up to date with the latest company updates', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="5" width="24" height="22" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="24" y2="14"/><line x1="8" y1="18" x2="24" y2="18"/><line x1="8" y1="22" x2="20" y2="22"/></svg>' },
            { id: 'press', label: 'Press Releases', desc: 'Access our official statements, media announcements, and company news', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="5" width="24" height="22" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="24" y2="14"/><line x1="8" y1="18" x2="24" y2="18"/><line x1="8" y1="22" x2="20" y2="22"/></svg>' },
            { id: 'webinars', label: 'Webinars', desc: 'Explore upcoming and on-demand online sessions', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="5" width="24" height="22" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="24" y2="14"/><line x1="8" y1="18" x2="24" y2="18"/><line x1="8" y1="22" x2="20" y2="22"/></svg>' },
            { id: 'events', label: 'Events', desc: 'Discover details about upcoming and past events', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="5" width="24" height="22" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="24" y2="14"/><line x1="8" y1="18" x2="24" y2="18"/><line x1="8" y1="22" x2="20" y2="22"/></svg>' }
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
            { id: 'academic', label: 'Academic Papers', desc: 'This section features our academic publications', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="20" height="24" rx="2"/><line x1="10" y1="10" x2="22" y2="10"/><line x1="10" y1="14" x2="22" y2="14"/><line x1="10" y1="18" x2="18" y2="18"/></svg>' },
            { id: 'white', label: 'White Papers', desc: 'This section demonstrates how we validate cryptographic solutions', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="20" height="24" rx="2"/><line x1="10" y1="10" x2="22" y2="10"/><line x1="10" y1="14" x2="22" y2="14"/><line x1="10" y1="18" x2="18" y2="18"/></svg>' },
            { id: 'videos', label: 'Explanatory Videos', desc: 'Our explanatory videos break down complex hardware security concepts', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="6" width="24" height="16" rx="2"/><polygon points="13,10 13,18 20,14"/><line x1="8" y1="26" x2="24" y2="26"/></svg>' }
        ];
        renderCardListView(container, items);
    }

    // --- Company Sub View ---
    function renderCompanySubView(container) {
        const items = [
            { id: 'about', label: 'About Us', desc: 'Pioneers in hardware-based security innovation', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="16" cy="12" r="5"/><path d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10"/></svg>' },
            { id: 'services', label: 'Security & Crypto Boutique', desc: 'Leverage the industry\'s best-practice expertise', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="16" cy="16" r="6"/><path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.8 7.8l2.8 2.8M21.4 21.4l2.8 2.8M7.8 24.2l2.8-2.8M21.4 10.6l2.8-2.8"/></svg>' },
            { id: 'team', label: 'Our Team', desc: 'A unique blend of industry veterans with deep expertise', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="4"/><circle cx="22" cy="13" r="3"/><path d="M2 26c0-4.4 3.6-8 8-8h2c4.4 0 8 3.6 8 8"/><path d="M20 18c3.3 0 6 2.7 6 6"/></svg>' },
            { id: 'careers', label: 'Careers', desc: 'We seek exceptional, passionate individuals', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="10" width="24" height="16" rx="2"/><path d="M12 10V8a4 4 0 018 0v2"/><line x1="16" y1="16" x2="16" y2="20"/></svg>' }
        ];
        renderCardListView(container, items);
    }

    // --- Shared: render card list with icon + title + description ---
    function renderCardListView(container, items) {
        let html = '<div class="tablet-card-grid tablet-card-grid--single">';
        items.forEach(item => {
            html += `<a href="#" class="tablet-app-card tablet-app-card--detail">
                <span class="tablet-card-icon">${item.icon}</span>
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