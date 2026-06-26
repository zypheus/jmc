<li id="course-{{ $course->id }}" class="prog-mgr__course">
    <div class="prog-mgr__course-info">
        <span class="prog-mgr__course-code">{{ $course->course_code }}</span>
        <span class="prog-mgr__course-name">{{ $course->course_name }}</span>
    </div>
    <div class="prog-mgr__course-actions">
        <button type="button"
                class="prog-mgr__icon-btn prog-mgr__icon-btn--edit"
                data-action="edit-course"
                data-course-id="{{ $course->id }}"
                data-course-code="{{ $course->course_code }}"
                data-course-name="{{ $course->course_name }}">
            Edit
        </button>
        <button type="button"
                class="prog-mgr__icon-btn prog-mgr__icon-btn--delete"
                data-action="delete-course"
                data-course-id="{{ $course->id }}"
                data-course-code="{{ $course->course_code }}">
            Delete
        </button>
    </div>
</li>
