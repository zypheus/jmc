<script>
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.catalog-picker--datetime[data-default-now="1"]').forEach(function (el) {
        if (!el.value) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            el.value = now.toISOString().slice(0, 16);
        }
    });

    document.getElementById('marcEditor')?.addEventListener('click', function (e) {
        const btn = e.target.closest('.marc-add-value');
        if (!btn) return;
        const field = btn.closest('.marc-field');
        const wrap = field?.querySelector('.marc-values');
        const last = wrap?.querySelector('.catalog-picker--datetime[data-default-now="1"]');
        if (last && !last.value) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            last.value = now.toISOString().slice(0, 16);
        }
    });
});
</script>
