export function submitLogout() {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
    const form = document.createElement('form');

    form.method = 'POST';
    form.action = route('logout');
    form.style.display = 'none';

    if (token) {
        const csrf = document.createElement('input');
        csrf.type = 'hidden';
        csrf.name = '_token';
        csrf.value = token;
        form.appendChild(csrf);
    }

    document.body.appendChild(form);
    form.submit();
}
