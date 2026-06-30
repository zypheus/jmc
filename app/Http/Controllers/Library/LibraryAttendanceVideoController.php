<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\LibraryAttendanceVideo;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LibraryAttendanceVideoController extends Controller
{
    public function index(): Response
    {
        $video = LibraryAttendanceVideo::current();

        return Inertia::render('Library/Attendance/ChangeVideo', [
            'currentVideoUrl' => LibraryAttendanceVideo::currentUrl(),
            'currentVideoPath' => $video?->video_path,
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'video' => ['required', 'file', 'mimetypes:video/mp4,video/x-m4v,application/mp4', 'max:512000'],
        ]);

        $path = $request->file('video')->store('library-attendance/videos', 'public');

        LibraryAttendanceVideo::query()->create([
            'video_path' => $path,
        ]);

        return redirect()
            ->route('library.attendance.video')
            ->with('success', 'Attendance scanner video uploaded successfully.');
    }
}
