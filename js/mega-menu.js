(function() {
    'use strict';

    // State Management
    const state = {
        currentMenu: null,
        currentCategory: null,
        currentCrypto: null,
        viewStack: [],
        leaveTimeout: null,
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
        
        // Setup Insights/Company tabs
        setupTabbedMenus();

        // Setup Newsroom hover bg switching
        setupNewsroomBg();

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
        const tabbedPanels = document.querySelectorAll('[data-panel="insights"], [data-panel="company"]');
        
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

    function setupNewsroomBg() {
        const panel = document.querySelector('[data-panel="newsroom"]');
        if (!panel) return;

        const links = panel.querySelectorAll('.menu-link[data-bg-target]');
        const bgImages = panel.querySelectorAll('.bg-image');

        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const target = link.dataset.bgTarget;
                bgImages.forEach(bg => {
                    bg.classList.toggle('active', bg.dataset.bg === target);
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
        elements.mobileBreadcrumb.classList.remove('active');
        elements.mobileBreadcrumb.innerHTML = '';
    }

    function navigateToStackIndex(index) {
        state.viewStack = state.viewStack.slice(0, index + 1);
        if (state.isTablet && state.viewStack.length < 2) {
            state.viewStack.push({ type: 'products', label: 'Products' });
        }
        renderCurrentViews();
    }

    function renderCurrentViews() {
        const stack = state.viewStack;

        if (state.isTablet) {
            if (stack.length < 2) {
                stack.push({ type: 'products', label: 'Products' });
            }
            renderView(stack[stack.length - 2], elements.mobileNavCol, 'left');
            renderView(stack[stack.length - 1], elements.mobileDetailCol, 'right');
        } else {
            // Mobile: show last view
            if (stack.length <= 1) {
                renderView(stack[stack.length - 1], elements.mobileNavCol, 'single');
                elements.mobileNavCol.classList.remove('hidden');
                elements.mobileDetailCol.classList.remove('active');
            } else {
                renderView(stack[stack.length - 1], elements.mobileDetailCol, 'single');
                elements.mobileNavCol.classList.add('hidden');
                elements.mobileDetailCol.classList.add('active');
            }
        }

        updateBreadcrumb();
    }

    function renderView(entry, container, position) {
        switch (entry.type) {
            case 'main-nav': renderMainNavView(container, position); break;
            case 'products': renderProductsSubView(container, position); break;
            case 'applications': renderSimpleContentView(container, 'Applications grid would be rendered here as a list of links.'); break;
            case 'insights': renderInsightsSubView(container, position); break;
            case 'newsroom': renderSimpleContentView(container, 'Newsroom links would be rendered here.'); break;
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
            { id: 'software', label: 'Cryptographic Software Libraries' },
            { id: 'pqc-main', label: 'PQC – Post-Quantum Cryptography' },
            { id: 'forti', label: 'Forti EDA Validation Studios' },
            { id: 'security', label: 'Security Assurance' }
        ];

        // On tablet left, highlight item matching right column
        let activeId = null;
        if (position === 'left') {
            const rightView = state.viewStack[state.viewStack.length - 1];
            if (rightView.type === 'crypto-types' || rightView.type === 'crypto-detail') {
                activeId = 'hardware';
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

                if (itemId === 'hardware') {
                    if (position === 'left') {
                        // Tablet left: replace right col
                        state.viewStack[state.viewStack.length - 1] = { type: 'crypto-types', label };
                    } else {
                        // Right col or mobile: push
                        state.viewStack.push({ type: 'crypto-types', label });
                    }
                    renderCurrentViews();
                }
                // Non-hardware items are page links — no navigation
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

    // --- Insights Sub View ---
    function renderInsightsSubView(container) {
        const items = [
            { id: 'academic', label: 'Academic Papers' },
            { id: 'white', label: 'White Papers' },
            { id: 'videos', label: 'Explanatory Videos' }
        ];
        renderListView(container, items);
    }

    // --- Company Sub View ---
    function renderCompanySubView(container) {
        const items = [
            { id: 'about', label: 'About Us' },
            { id: 'services', label: 'Services' },
            { id: 'team', label: 'Our Team' },
            { id: 'careers', label: 'Careers' }
        ];
        renderListView(container, items);
    }

    // --- Shared: render a simple list of link items ---
    function renderListView(container, items) {
        let html = '<ul class="menu-list">';
        items.forEach(item => {
            html += `<li><button class="menu-btn" data-item="${item.id}">${item.label}</button></li>`;
        });
        html += '</ul>';
        container.innerHTML = html;
        // Items are page links — no drill-down navigation
    }

    // --- Shared: simple content placeholder ---
    function renderSimpleContentView(container, text) {
        container.innerHTML = `<p style="padding: 20px;">${text}</p>`;
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