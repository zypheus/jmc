document.addEventListener('DOMContentLoaded', () => {
    const page = document.getElementById('prospectus-page');
    if (!page) return;

    const courseEditModalEl = document.getElementById('courseEditModal');
    const courseDeleteModalEl = document.getElementById('courseDeleteModal');
    const programEditModalEl = document.getElementById('programEditModal');
    const programDeleteModalEl = document.getElementById('programDeleteModal');

    const courseEditModal = courseEditModalEl ? bootstrap.Modal.getOrCreateInstance(courseEditModalEl) : null;
    const courseDeleteModal = courseDeleteModalEl ? bootstrap.Modal.getOrCreateInstance(courseDeleteModalEl) : null;
    const programEditModal = programEditModalEl ? bootstrap.Modal.getOrCreateInstance(programEditModalEl) : null;
    const programDeleteModal = programDeleteModalEl ? bootstrap.Modal.getOrCreateInstance(programDeleteModalEl) : null;

    const editForm = document.getElementById('editForm');
    const deleteForm = document.getElementById('deleteForm');
    const editProgramForm = document.getElementById('editProgramForm');
    const deleteProgramForm = document.getElementById('deleteProgramForm');

    function toggleLoading(button, loading) {
        if (!button) return;
        button.classList.toggle('is-loading', loading);
        button.disabled = loading;
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('prog-mgr-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `prog-mgr__toast prog-mgr__toast--${type}`;
        toast.innerHTML = `<span>${message}</span><button type="button" aria-label="Dismiss">&times;</button>`;
        toast.querySelector('button').addEventListener('click', () => toast.remove());
        container.appendChild(toast);

        setTimeout(() => toast.remove(), 3200);
    }

    function updateToggleLabels() {
        page.querySelectorAll('[data-action="toggle-program"]').forEach((btn) => {
            const programId = btn.getAttribute('data-program-id');
            const card = document.getElementById(`program-card-${programId}`);
            const label = btn.querySelector('[data-toggle-label]');
            if (label && card) {
                label.textContent = card.classList.contains('is-expanded') ? 'Collapse' : 'Expand';
            }
        });
    }

    function refreshYearCount(yearId) {
        const list = document.getElementById(`year-${yearId}`);
        const block = document.getElementById(`year-block-${yearId}`);
        if (!list || !block) return;

        const count = list.querySelectorAll('.prog-mgr__course').length;
        const badge = block.querySelector('.prog-mgr__year-count');
        if (badge) {
            badge.textContent = `${count} ${count === 1 ? 'course' : 'courses'}`;
        }
    }

    function refreshProgramMeta(programId) {
        const card = document.getElementById(`program-card-${programId}`);
        if (!card) return;

        const courseCount = card.querySelectorAll('.prog-mgr__course').length;
        const meta = card.querySelector('.prog-mgr__program-meta');
        const years = card.querySelectorAll('.prog-mgr__year').length;
        if (meta) {
            meta.textContent = `${years} ${years === 1 ? 'year' : 'years'} · ${courseCount} ${courseCount === 1 ? 'course' : 'courses'}`;
        }
    }

    page.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-action]');
        if (!btn || !page.contains(btn)) return;

        const action = btn.getAttribute('data-action');

        if (action === 'toggle-program') {
            const programId = btn.getAttribute('data-program-id');
            const card = document.getElementById(`program-card-${programId}`);
            if (card) {
                card.classList.toggle('is-expanded');
                updateToggleLabels();
            }
            return;
        }

        if (action === 'edit-course' && editForm && courseEditModal) {
            const courseId = btn.getAttribute('data-course-id');
            editForm.action = `/prospectus/course/${courseId}`;
            document.getElementById('editCourseCode').value = btn.getAttribute('data-course-code') || '';
            document.getElementById('editCourseName').value = btn.getAttribute('data-course-name') || '';
            courseEditModal.show();
            return;
        }

        if (action === 'delete-course' && deleteForm && courseDeleteModal) {
            const courseId = btn.getAttribute('data-course-id');
            const courseCode = btn.getAttribute('data-course-code') || 'this course';
            deleteForm.action = `/prospectus/course/${courseId}`;
            document.getElementById('deleteMessage').textContent =
                `Are you sure you want to delete "${courseCode}"?`;
            courseDeleteModal.show();
            return;
        }

        if (action === 'edit-program' && editProgramForm && programEditModal) {
            const programId = btn.getAttribute('data-program-id');
            editProgramForm.action = `/prospectus/program/${programId}`;
            document.getElementById('editProgramCode').value = btn.getAttribute('data-program-code') || '';
            document.getElementById('editProgramName').value = btn.getAttribute('data-program-name') || '';
            programEditModal.show();
            return;
        }

        if (action === 'delete-program' && deleteProgramForm && programDeleteModal) {
            const programId = btn.getAttribute('data-program-id');
            const programCode = btn.getAttribute('data-program-code') || 'this program';
            deleteProgramForm.action = `/prospectus/program/${programId}`;
            document.getElementById('deleteProgramCode').textContent = programCode;
            programDeleteModal.show();
        }
    });

    updateToggleLabels();

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('editBtn');
            toggleLoading(btn, true);

            const response = await fetch(editForm.action, {
                method: 'POST',
                body: new FormData(editForm),
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            toggleLoading(btn, false);

            if (response.ok) {
                const updatedItem = await response.text();
                const courseId = editForm.action.split('/').pop();
                const row = document.getElementById(`course-${courseId}`);
                if (row) {
                    const yearList = row.closest('.prog-mgr__course-list');
                    row.outerHTML = updatedItem;
                    if (yearList) {
                        refreshYearCount(yearList.getAttribute('data-year-id'));
                        const programCard = yearList.closest('.prog-mgr__program');
                        if (programCard) {
                            refreshProgramMeta(programCard.id.replace('program-card-', ''));
                        }
                    }
                }
                courseEditModal?.hide();
                showToast('Course updated');
            } else {
                showToast('Could not update course', 'error');
            }
        });
    }

    if (deleteForm) {
        deleteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('deleteBtn');
            toggleLoading(btn, true);

            const response = await fetch(deleteForm.action, {
                method: 'POST',
                body: new FormData(deleteForm),
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            toggleLoading(btn, false);

            if (response.ok) {
                const courseId = deleteForm.action.split('/').pop();
                const row = document.getElementById(`course-${courseId}`);
                if (row) {
                    const yearList = row.closest('.prog-mgr__course-list');
                    const yearId = yearList?.getAttribute('data-year-id');
                    row.remove();

                    if (yearList && !yearList.querySelector('.prog-mgr__course')) {
                        const empty = document.createElement('li');
                        empty.className = 'prog-mgr__course-empty';
                        empty.setAttribute('data-empty-row', '');
                        empty.textContent = 'No courses yet.';
                        yearList.appendChild(empty);
                    }

                    if (yearId) {
                        refreshYearCount(yearId);
                        const programCard = yearList?.closest('.prog-mgr__program');
                        if (programCard) {
                            refreshProgramMeta(programCard.id.replace('program-card-', ''));
                        }
                    }
                }
                courseDeleteModal?.hide();
                showToast('Course deleted');
            } else {
                showToast('Could not delete course', 'error');
            }
        });
    }

    page.querySelectorAll('.add-course-form').forEach((form) => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            toggleLoading(btn, true);

            const yearId = form.dataset.year;
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            toggleLoading(btn, false);

            if (response.ok) {
                const newItem = await response.text();
                const list = document.getElementById(`year-${yearId}`);
                if (list) {
                    const emptyMsg = list.querySelector('[data-empty-row]');
                    if (emptyMsg) emptyMsg.remove();
                    list.insertAdjacentHTML('beforeend', newItem);
                    refreshYearCount(yearId);
                    const programCard = list.closest('.prog-mgr__program');
                    if (programCard) {
                        refreshProgramMeta(programCard.id.replace('program-card-', ''));
                    }
                }
                form.reset();
                showToast('Course added');
            } else {
                showToast('Could not add course', 'error');
            }
        });
    });

    if (editProgramForm) {
        editProgramForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('editProgramBtn');
            toggleLoading(btn, true);

            const response = await fetch(editProgramForm.action, {
                method: 'POST',
                body: new FormData(editProgramForm),
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            toggleLoading(btn, false);

            if (response.ok) {
                const data = await response.json();
                const codeEl = document.getElementById(`program-code-${data.id}`);
                const nameEl = document.getElementById(`program-name-${data.id}`);
                if (codeEl) codeEl.textContent = data.program_code;
                if (nameEl) nameEl.textContent = data.program_name;

                const editBtn = page.querySelector(`[data-action="edit-program"][data-program-id="${data.id}"]`);
                if (editBtn) {
                    editBtn.setAttribute('data-program-code', data.program_code);
                    editBtn.setAttribute('data-program-name', data.program_name);
                }

                programEditModal?.hide();
                showToast('Program updated');
            } else {
                showToast('Could not update program', 'error');
            }
        });
    }

    if (deleteProgramForm) {
        deleteProgramForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('deleteProgramBtn');
            toggleLoading(btn, true);

            const response = await fetch(deleteProgramForm.action, {
                method: 'POST',
                body: new FormData(deleteProgramForm),
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            toggleLoading(btn, false);

            if (response.ok) {
                const data = await response.json();
                const card = document.getElementById(`program-card-${data.id}`);
                if (card) card.remove();
                programDeleteModal?.hide();
                showToast('Program deleted');

                if (!page.querySelector('.prog-mgr__program')) {
                    const list = page.querySelector('.prog-mgr__programs');
                    if (list) {
                        list.innerHTML = '<div class="prog-mgr__empty"><p class="mb-0">No programs yet. Add your first program above.</p></div>';
                    }
                }
            } else {
                showToast('Could not delete program', 'error');
            }
        });
    }
});
