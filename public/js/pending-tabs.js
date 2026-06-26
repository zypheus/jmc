(function (global) {
    'use strict';

    const getTabFromUrl = () => new URLSearchParams(window.location.search).get('tab') || 'students';

    const init = () => {
        const tabInput = document.getElementById('pendingTab');
        const tabs = document.querySelectorAll('[data-pending-tab]');

        if (!tabInput || tabs.length === 0) {
            return null;
        }

        const panels = {
            students: document.getElementById('pending-panel-students'),
            employees: document.getElementById('pending-panel-employees'),
        };

        const activate = (key, { updateUrl = false } = {}) => {
            const tabKey = key === 'employees' ? 'employees' : 'students';

            tabs.forEach((tab) => {
                const active = tab.getAttribute('data-pending-tab') === tabKey;
                tab.classList.toggle('active', active);
                tab.setAttribute('aria-selected', active ? 'true' : 'false');
            });

            Object.entries(panels).forEach(([name, panel]) => {
                panel?.classList.toggle('is-active', name === tabKey);
            });

            tabInput.value = tabKey;

            if (updateUrl) {
                const url = new URL(window.location.href);
                url.searchParams.set('tab', tabKey);
                window.history.replaceState(window.history.state, '', url);
            }
        };

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                activate(tab.getAttribute('data-pending-tab'), { updateUrl: true });
            });
        });

        activate(getTabFromUrl());

        return { activate, syncFromUrl: () => activate(getTabFromUrl()) };
    };

    let instance = null;

    global.PendingTabs = {
        init: () => {
            instance = init();
            return instance;
        },
        syncFromUrl: () => instance?.syncFromUrl?.(),
    };
})(window);
