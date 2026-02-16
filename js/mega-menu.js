(function() {
    'use strict';

    // State Management
    const state = {
        currentMenu: null,
        currentCategory: null,
        currentCrypto: null,
        mobileNavStack: [],
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

                    // Fade background image
                    const bgImage = panel.querySelector('.bg-image');
                    if (bgImage) {
                        bgImage.style.opacity = '0';
                        setTimeout(() => {
                            bgImage.style.opacity = '0.3';
                        }, 50);
                    }
                });
            });
        });
    }

    // ===================================
    // MOBILE/TABLET MENU
    // ===================================

    function setupMobileMenu() {
        if (elements.hamburger) {
            elements.hamburger.addEventListener('click', toggleMobileMenu);
        }

        if (elements.mobileClose) {
            elements.mobileClose.addEventListener('click', closeMobileMenu);
        }

        // Initialize mobile nav
        renderMobileLevel1();
    }

    function toggleMobileMenu() {
        const isOpen = elements.mobileMenu.classList.contains('active');
        
        if (isOpen) {
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
        
        // Reset to level 1
        state.mobileNavStack = [];
        renderMobileLevel1();
    }

    function closeMobileMenu() {
        elements.mobileMenu.classList.remove('active');
        elements.mobileMenu.setAttribute('aria-hidden', 'true');
        elements.hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
        
        // Reset state
        state.mobileNavStack = [];
        elements.mobileBreadcrumb.classList.remove('active');
        elements.mobileBreadcrumb.innerHTML = '';
    }

    function renderMobileLevel1() {
        const navItems = [
            { id: 'products', label: 'Products', hasChildren: true },
            { id: 'applications', label: 'Applications', hasChildren: false },
            { id: 'insights', label: 'Insights', hasChildren: true },
            { id: 'newsroom', label: 'Newsroom', hasChildren: false },
            { id: 'company', label: 'Company', hasChildren: true }
        ];

        let html = '<ul class="menu-list">';
        navItems.forEach(item => {
            html += `<li><button class="menu-btn${item.id === 'products' ? ' active' : ''}" data-nav="${item.id}" ${item.hasChildren ? 'data-has-children="true"' : ''}>${item.label}</button></li>`;
        });
        html += '</ul>';

        elements.mobileNavCol.innerHTML = html;

        // Render products in detail col by default
        renderMobileProducts();

        // Add event listeners
        const navButtons = elements.mobileNavCol.querySelectorAll('.menu-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const navId = btn.dataset.nav;
                
                // Update active state
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Render appropriate content
                if (navId === 'products') {
                    renderMobileProducts();
                } else if (navId === 'applications') {
                    renderMobileApplications();
                } else if (navId === 'insights') {
                    renderMobileInsights();
                } else if (navId === 'newsroom') {
                    renderMobileNewsroom();
                } else if (navId === 'company') {
                    renderMobileCompany();
                }
            });
        });

        // Show nav col, hide detail col on mobile
        if (state.isMobile) {
            elements.mobileNavCol.classList.remove('hidden');
            elements.mobileDetailCol.classList.remove('active');
        }
    }

    function renderMobileProducts() {
        const items = [
            { id: 'overview', label: 'Product Overview', type: 'text' },
            { id: 'hardware', label: 'Cryptographic Hardware IP Cores', hasChildren: true },
            { id: 'software', label: 'Cryptographic Software Libraries', type: 'cards' },
            { id: 'pqc-main', label: 'PQC – Post-Quantum Cryptography', type: 'cards' },
            { id: 'forti', label: 'Forti EDA Validation Studios', type: 'cards' },
            { id: 'security', label: 'Security Assurance', type: 'cards' }
        ];

        renderMobileDetailList(items, 'products');
    }

    function renderMobileDetailList(items, context) {
        let html = '<ul class="menu-list">';
        items.forEach(item => {
            html += `<li><button class="menu-btn" data-item="${item.id}" ${item.hasChildren ? 'data-has-children="true"' : ''} data-type="${item.type || 'text'}" data-context="${context}">${item.label}</button></li>`;
        });
        html += '</ul>';

        elements.mobileDetailCol.innerHTML = html;

        // Add event listeners
        const detailButtons = elements.mobileDetailCol.querySelectorAll('.menu-btn');
        detailButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.hasChildren) {
                    // Navigate deeper
                    navigateDeeper(btn.dataset.item, btn.textContent, context);
                } else {
                    // Show content (for text/cards types)
                    // This would typically link to a page
                }
            });
        });

        // On mobile, show detail col
        if (state.isMobile) {
            elements.mobileNavCol.classList.add('hidden');
            elements.mobileDetailCol.classList.add('active');
        }

        // Update breadcrumb
        updateBreadcrumb();
    }

    function navigateDeeper(itemId, itemLabel, parentContext) {
        // Push parent context first if stack is empty
        if (state.mobileNavStack.length === 0 && parentContext) {
            const labels = {
                products: 'Products', applications: 'Applications',
                insights: 'Insights', newsroom: 'Newsroom', company: 'Company'
            };
            state.mobileNavStack.push({
                id: parentContext,
                label: labels[parentContext] || parentContext
            });
        }

        state.mobileNavStack.push({ id: itemId, label: itemLabel, context: parentContext });

        if (itemId === 'hardware') {
            renderMobileCryptoTypes();
        }

        updateBreadcrumb();
    }

    function renderMobileCryptoTypes() {
        const cryptoTypes = [
            { id: 'pqc', label: 'PQC' },
            { id: 'aes', label: 'AES' },
            { id: 'hmac', label: 'HMAC SHA2' },
            { id: 'ecc', label: 'ECC/RSA' },
            { id: 'cryptoboxes', label: 'CryptoBoxes' },
            { id: 'roots', label: 'Roots of Trust' }
        ];

        // Render as left column
        let navHtml = '<ul class="menu-list">';
        cryptoTypes.forEach((type, index) => {
            navHtml += `<li><button class="menu-btn${index === 0 ? ' active' : ''}" data-crypto="${type.id}">${type.label}</button></li>`;
        });
        navHtml += '</ul>';

        elements.mobileNavCol.innerHTML = navHtml;

        // Show detail for first crypto type
        renderMobileCryptoDetail('pqc');

        // Add event listeners
        const cryptoButtons = elements.mobileNavCol.querySelectorAll('.menu-btn');
        cryptoButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const cryptoId = btn.dataset.crypto;
                
                cryptoButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                renderMobileCryptoDetail(cryptoId);
            });
        });

        // On mobile, show left col
        if (state.isMobile) {
            elements.mobileNavCol.classList.remove('hidden');
            elements.mobileDetailCol.classList.remove('active');
        }
    }

    function renderMobileCryptoDetail(cryptoId) {
        // Get accordion data for this crypto type
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

        elements.mobileDetailCol.innerHTML = html;

        // Setup accordion handlers
        const accHeaders = elements.mobileDetailCol.querySelectorAll('.acc-header');
        accHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const accordion = header.closest('.accordion');
                const isActive = accordion.classList.contains('active');

                // Close all
                const allAccordions = elements.mobileDetailCol.querySelectorAll('.accordion');
                allAccordions.forEach(acc => {
                    acc.classList.remove('active');
                    acc.querySelector('.acc-header').setAttribute('aria-expanded', 'false');
                });

                // Open if wasn't active
                if (!isActive) {
                    accordion.classList.add('active');
                    header.setAttribute('aria-expanded', 'true');
                }
            });
        });

        // On mobile, show detail col
        if (state.isMobile) {
            elements.mobileNavCol.classList.add('hidden');
            elements.mobileDetailCol.classList.add('active');
        }
    }

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

    function renderMobileApplications() {
        // Applications are simple links
        elements.mobileDetailCol.innerHTML = '<p style="padding: 20px;">Applications grid would be rendered here as a list of links.</p>';
    }

    function renderMobileInsights() {
        const items = [
            { id: 'academic', label: 'Academic Papers' },
            { id: 'white', label: 'White Papers' },
            { id: 'videos', label: 'Explanatory Videos' }
        ];
        renderMobileDetailList(items, 'insights');
    }

    function renderMobileNewsroom() {
        elements.mobileDetailCol.innerHTML = '<p style="padding: 20px;">Newsroom links would be rendered here.</p>';
    }

    function renderMobileCompany() {
        const items = [
            { id: 'about', label: 'About Us' },
            { id: 'services', label: 'Services' },
            { id: 'team', label: 'Our Team' },
            { id: 'careers', label: 'Careers' }
        ];
        renderMobileDetailList(items, 'company');
    }

    function updateBreadcrumb() {
        if (state.mobileNavStack.length === 0) {
            elements.mobileBreadcrumb.classList.remove('active');
            elements.mobileBreadcrumb.innerHTML = '';
            return;
        }

        elements.mobileBreadcrumb.classList.add('active');

        let html = '';
        state.mobileNavStack.forEach((item, index) => {
            if (index > 0) {
                html += '<svg class="breadcrumb-chevron" width="7" height="12" viewBox="0 0 7 12"><path d="M1 1l5 5-5 5" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>';
            }
            const isLast = index === state.mobileNavStack.length - 1;
            if (isLast) {
                html += `<span class="breadcrumb-current">${item.label}</span>`;
            } else {
                html += `<button data-level="${index}">${item.label}</button>`;
            }
        });

        elements.mobileBreadcrumb.innerHTML = html;

        // Add click handlers for breadcrumb navigation
        const breadcrumbBtns = elements.mobileBreadcrumb.querySelectorAll('button');
        breadcrumbBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const level = parseInt(btn.dataset.level);
                navigateToLevel(level);
            });
        });
    }

    function navigateToLevel(level) {
        const targetItem = state.mobileNavStack[level];

        // Check if target is a top-level menu
        const topLevelIds = ['products', 'applications', 'insights', 'newsroom', 'company'];

        if (topLevelIds.includes(targetItem.id)) {
            // Going back to top level — clear the stack and re-render level 1
            state.mobileNavStack = [];
            renderMobileLevel1();

            // Activate the correct nav item if not products (which is default)
            if (targetItem.id !== 'products') {
                const navButtons = elements.mobileNavCol.querySelectorAll('.menu-btn');
                navButtons.forEach(b => b.classList.remove('active'));
                const targetBtn = elements.mobileNavCol.querySelector(`[data-nav="${targetItem.id}"]`);
                if (targetBtn) targetBtn.classList.add('active');

                const renderers = {
                    applications: renderMobileApplications,
                    insights: renderMobileInsights,
                    newsroom: renderMobileNewsroom,
                    company: renderMobileCompany
                };
                if (renderers[targetItem.id]) renderers[targetItem.id]();
            }
        } else {
            // Navigate to a sub-level — keep stack up to this point
            state.mobileNavStack = state.mobileNavStack.slice(0, level + 1);

            if (targetItem.id === 'hardware') {
                renderMobileCryptoTypes();
            }
        }

        updateBreadcrumb();
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
            if (e.matches) {
                closeMegaMenu();
            }
        });

        mobileQuery.addEventListener('change', (e) => {
            state.isMobile = e.matches;
            if (e.matches) {
                closeMegaMenu();
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