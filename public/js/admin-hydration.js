(function (global) {
    'use strict';

    const boot = () => {
        global.DataPanel?.initAll();
        global.PendingTabs?.init();
    };

    document.addEventListener('admin-shell:content-ready', boot);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.querySelector('[data-hydratable-panel]') && !document.getElementById('admin-blade-content')) {
                boot();
            }
        });
    } else if (document.querySelector('[data-hydratable-panel]') && !document.getElementById('admin-blade-content')) {
        boot();
    }
})(window);
