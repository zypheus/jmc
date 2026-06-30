<?php

namespace App\Http\Controllers\Attendance;

use App\Domain\Attendance\Models\AttendanceSetting;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\UpdateFeedbackSettingsRequest;
use App\Http\Requests\Attendance\UpdateSectionSettingsRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function sectionSettings(): Response
    {
        return Inertia::render('Attendance/Settings/SectionPicker', [
            'enabled' => AttendanceSetting::sectionPickerEnabled(),
            'sections' => AttendanceSetting::attendanceSections(),
        ]);
    }

    public function updateSectionSettings(UpdateSectionSettingsRequest $request)
    {
        $sections = array_values(array_unique(array_filter(array_map(
            fn ($name) => trim((string) $name),
            $request->input('sections', [])
        ))));

        AttendanceSetting::setSectionPickerEnabled($request->validated('enabled') === '1');
        AttendanceSetting::setAttendanceSections($sections);

        $pickerOn = $request->validated('enabled') === '1';

        return back()->with(
            'success',
            $pickerOn
                ? 'Section picker enabled with '.count($sections).' section(s) on the scanner.'
                : 'Section picker disabled. '.count($sections).' section(s) saved for logs and filters.'
        );
    }

    public function feedbackSettings(): Response
    {
        return Inertia::render('Attendance/Settings/Feedback', [
            'enabled' => AttendanceSetting::logoutFeedbackEnabled(),
        ]);
    }

    public function updateFeedbackSettings(UpdateFeedbackSettingsRequest $request)
    {
        AttendanceSetting::setLogoutFeedbackEnabled($request->validated('enabled') === '1');

        return back()->with(
            'success',
            $request->validated('enabled') === '1'
                ? 'Logout feedback is now enabled on the attendance scanner.'
                : 'Logout feedback is now disabled on the attendance scanner.'
        );
    }

    public function changeVideo(): Response
    {
        return Inertia::render('Attendance/Settings/ChangeVideo');
    }

    public function uploadVideo(Request $request)
    {
        $validated = $request->validate([
            'video' => ['required', 'file', 'mimetypes:video/mp4', 'max:512000'],
        ]);

        $file = $validated['video'];
        $directory = public_path('videos');

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $filename = 'attendance-scanner-'.time().'.mp4';
        $file->move($directory, $filename);

        AttendanceSetting::setAttendanceVideoPath('/videos/'.$filename);

        return back()->with('success', 'Attendance scanner video uploaded successfully.');
    }
}
