<div class="modal fade prog-mgr__modal" id="courseEditModal" tabindex="-1" aria-labelledby="courseEditTitle" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="courseEditTitle">Edit course</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="editForm" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="editCourseCode" class="form-label">Course code</label>
                        <input type="text" id="editCourseCode" name="course_code" class="form-control" required maxlength="50">
                    </div>
                    <div class="mb-0">
                        <label for="editCourseName" class="form-label">Course name</label>
                        <input type="text" id="editCourseName" name="course_name" class="form-control" required maxlength="255">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="prog-mgr__btn prog-mgr__btn--outline" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" id="editBtn" class="prog-mgr__btn prog-mgr__btn--primary">
                        <span class="prog-mgr__btn-text">Save changes</span>
                        <span class="prog-mgr__spinner" aria-hidden="true"></span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade prog-mgr__modal" id="courseDeleteModal" tabindex="-1" aria-labelledby="courseDeleteTitle" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="courseDeleteTitle">Delete course</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="deleteForm" method="POST">
                @csrf
                @method('DELETE')
                <div class="modal-body">
                    <p id="deleteMessage" class="mb-0 text-secondary"></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="prog-mgr__btn prog-mgr__btn--outline" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" id="deleteBtn" class="prog-mgr__btn prog-mgr__btn--danger">
                        <span class="prog-mgr__btn-text">Delete</span>
                        <span class="prog-mgr__spinner" aria-hidden="true"></span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade prog-mgr__modal" id="programEditModal" tabindex="-1" aria-labelledby="programEditTitle" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="programEditTitle">Edit program</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="editProgramForm" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="editProgramCode" class="form-label">Program code</label>
                        <input type="text" name="program_code" id="editProgramCode" class="form-control" required maxlength="50">
                    </div>
                    <div class="mb-0">
                        <label for="editProgramName" class="form-label">Program name</label>
                        <input type="text" name="program_name" id="editProgramName" class="form-control" required maxlength="255">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="prog-mgr__btn prog-mgr__btn--outline" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" id="editProgramBtn" class="prog-mgr__btn prog-mgr__btn--primary">
                        <span class="prog-mgr__btn-text">Save changes</span>
                        <span class="prog-mgr__spinner" aria-hidden="true"></span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade prog-mgr__modal" id="programDeleteModal" tabindex="-1" aria-labelledby="programDeleteTitle" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="programDeleteTitle">Delete program</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="deleteProgramForm" method="POST">
                @csrf
                @method('DELETE')
                <div class="modal-body">
                    <p class="mb-0 text-secondary">
                        Delete <strong id="deleteProgramCode"></strong> and all of its year levels and courses? This cannot be undone.
                    </p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="prog-mgr__btn prog-mgr__btn--outline" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" id="deleteProgramBtn" class="prog-mgr__btn prog-mgr__btn--danger">
                        <span class="prog-mgr__btn-text">Delete program</span>
                        <span class="prog-mgr__spinner" aria-hidden="true"></span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
