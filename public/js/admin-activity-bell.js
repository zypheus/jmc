(function () {
    const markBtn = document.getElementById('adminNotifMarkRead');
    const badge = document.getElementById('adminNotifBadge');
    const list = document.getElementById('adminNotifList');
    const markUrl = document.body.dataset.adminActivityMarkUrl;
    const recentUrl = document.body.dataset.adminActivityRecentUrl;

    if (!markUrl) {
        return;
    }

    function setUnreadCount(count) {
        if (!badge) return;
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : String(count);
            badge.classList.remove('d-none');
        } else {
            badge.classList.add('d-none');
        }
    }

    function renderList(activities) {
        if (!list) return;
        if (!activities.length) {
            list.innerHTML = '<p class="admin-notif-empty text-muted small mb-0">No patron notifications yet.</p>';
            return;
        }
        list.innerHTML = activities.map(function (a) {
            const unread = a.is_unread ? ' is-unread' : '';
            const body = a.body ? '<span class="admin-notif-item__body">' + escapeHtml(a.body) + '</span>' : '';
            const href = a.action_url || '#';
            return '<a href="' + escapeHtml(href) + '" class="admin-notif-item' + unread + '">' +
                '<span class="admin-notif-item__title">' + escapeHtml(a.title) + '</span>' +
                body +
                '<span class="admin-notif-item__time">' + escapeHtml(a.created_at || '') + '</span>' +
                '</a>';
        }).join('');
    }

    function escapeHtml(s) {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    if (markBtn) {
        markBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            fetch(markUrl, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
                        || document.querySelector('input[name="_token"]')?.value
                        || '',
                    Accept: 'application/json',
                },
            })
                .then(function (res) { return res.json(); })
                .then(function () {
                    setUnreadCount(0);
                    list?.querySelectorAll('.admin-notif-item').forEach(function (el) {
                        el.classList.remove('is-unread');
                    });
                })
                .catch(function () {});
        });
    }

    if (recentUrl) {
        setInterval(function () {
            fetch(recentUrl, { headers: { Accept: 'application/json' } })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    setUnreadCount(data.unread_count || 0);
                    if (data.activities) {
                        renderList(data.activities);
                    }
                })
                .catch(function () {});
        }, 60000);
    }
})();
