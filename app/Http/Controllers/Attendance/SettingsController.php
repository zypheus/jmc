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

    public function showChangeVideo(): Response
    {
        return Inertia::render('Attendance/Settings/ChangeVideo');
    }

    public function uploadVideo(Request $request)
    {
        $request->validate([
            'video' => ['required', 'file', 'mimes:mp4', 'max:512000'],
        ]);

        $video = $request->file('video');
        $filename = 'area51_product_slideshow.mp4';
        $directory = base_path('videos');

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $video->move($directory, $filename);

        return redirect()->route('attendance.changeVideo')->with('success', 'Video uploaded successfully.');
    }
}
