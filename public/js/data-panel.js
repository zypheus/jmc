(function (global) {
    'use strict';

    const defaultOnHydrated = (panel) => {
        if (typeof bootstrap === 'undefined') {
            return;
        }

        panel.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((el) => {
            bootstrap.Dropdown.getOrCreateInstance(el);
        });
    };

    const resolveElement = (root, selector) => {
        if (!selector) {
            return null;
        }

        if (selector instanceof Element) {
            return selector;
        }

        if (typeof selector !== 'string') {
            return null;
        }

        if (selector.startsWith('#') || selector.startsWith('.')) {
            return document.querySelector(selector);
        }

        return root.querySelector(selector) || document.querySelector(selector);
    };

    const isPanelVisible = (panel) => {
        if (panel.classList.contains('hidden')) {
            return false;
        }

        if (panel.classList.contains('patron-dir__pending-panel')) {
            return panel.classList.contains('is-active');
        }

        return true;
    };

    const buildFormUrl = (form, panel) => {
        const url = new URL(form.action || window.location.href, window.location.origin);
        const formData = new FormData(form);

        url.search = '';

        formData.forEach((value, key) => {
            if (value !== '') {
                url.searchParams.set(key, value);
            }
        });

        return appendTabInput(url.toString(), panel);
    };

    const appendTabInput = (url, panel) => {
        const tabInputSelector = panel.dataset.tabInput;

        if (!tabInputSelector) {
            return url;
        }

        const tabInput = document.querySelector(tabInputSelector);

        if (!tabInput?.value) {
            return url;
        }

        const nextUrl = new URL(url, window.location.origin);
        nextUrl.searchParams.set('tab', tabInput.value);

        return nextUrl.toString();
    };

    const initPanel = (panel, options = {}) => {
        if (!panel || panel.dataset.hydratableBound === 'true') {
            return null;
        }

        const formSelector = panel.dataset.form;
        const skeletonSelector = panel.dataset.skeleton;
        const paginationSelector = panel.dataset.pagination || '.data-panel-pagination';
        const pathMatch = options.pathMatch || panel.dataset.pathMatch || window.location.pathname;
        const enabledWhenVisible = options.enabledWhenVisible ?? panel.dataset.enabledWhenVisible === 'true';
        const onHydrated = options.onHydrated || defaultOnHydrated;

        const form = resolveElement(panel, formSelector);
        const skeletonTemplate = resolveElement(panel, skeletonSelector);

        if (!form || !skeletonTemplate) {
            return null;
        }

        let activeController = null;

        const showSkeleton = () => {
            panel.dataset.loading = 'true';
            panel.innerHTML = skeletonTemplate.innerHTML;
        };

        const loadPanel = async (url, { pushState = true } = {}) => {
            if (enabledWhenVisible && !isPanelVisible(panel)) {
                return;
            }

            if (activeController) {
                activeController.abort();
            }

            activeController = new AbortController();
            showSkeleton();

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        Accept: 'text/html',
                    },
                    signal: activeController.signal,
                });

                if (!response.ok) {
                    throw new Error('Request failed');
                }

                panel.innerHTML = await response.text();
                panel.dataset.loading = 'false';
                onHydrated(panel);
                bindPerPageForms(panel, loadPanel);

                if (pushState) {
                    window.history.pushState({ hydratablePanel: panel.id || true }, '', url);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    return;
                }

                window.location.href = url;
            } finally {
                activeController = null;
            }
        };

        const onFormSubmit = (event) => {
            event.preventDefault();
            loadPanel(buildFormUrl(form, panel));
        };

        const onPanelClick = (event) => {
            const paginationLink = event.target.closest(`${paginationSelector} a`);

            if (!paginationLink || !panel.contains(paginationLink)) {
                return;
            }

            event.preventDefault();
            loadPanel(appendTabInput(paginationLink.href, panel));
        };

        form.addEventListener('submit', onFormSubmit);
        panel.addEventListener('click', onPanelClick);
        bindPerPageForms(panel, loadPanel);

        if (!global.__dataPanelPopstateBound) {
            global.__dataPanelPopstateBound = true;

            window.addEventListener('popstate', () => {
                document.querySelectorAll('[data-hydratable-panel]').forEach((boundPanel) => {
                    const match = boundPanel.dataset.pathMatch || boundPanel.__dataPanelPathMatch;
                    const visibleOnly = boundPanel.dataset.enabledWhenVisible === 'true';

                    if (!match || !window.location.pathname.includes(match)) {
                        return;
                    }

                    if (visibleOnly && !isPanelVisible(boundPanel)) {
                        return;
                    }

                    boundPanel.__dataPanelLoad?.(window.location.href, { pushState: false });
                });

                global.PendingTabs?.syncFromUrl?.();
            });
        }

        panel.__dataPanelPathMatch = pathMatch;
        panel.__dataPanelLoad = loadPanel;
        panel.dataset.hydratableBound = 'true';

        return { loadPanel };
    };

    const bindPerPageForms = (panel, loadPanel) => {
        panel.querySelectorAll('.per-page-form').forEach((perPageForm) => {
            const select = perPageForm.querySelector('select[name="per_page"]');

            if (!select || select.dataset.hydratableBound === 'true') {
                return;
            }

            select.dataset.hydratableBound = 'true';
            select.removeAttribute('onchange');

            select.addEventListener('change', (event) => {
                event.preventDefault();
                loadPanel(buildFormUrl(perPageForm, panel));
            });
        });
    };

    const initAll = () => {
        document.querySelectorAll('[data-hydratable-panel]').forEach((panel) => {
            panel.dataset.hydratableBound = 'false';
            initPanel(panel);
        });
    };

    global.DataPanel = {
        init: initPanel,
        initAll,
    };
})(window);
