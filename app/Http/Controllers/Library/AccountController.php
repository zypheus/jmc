<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Library/Account/Edit', [
            'account' => [
                'fname' => $user->fname,
                'lname' => $user->lname,
                'email' => $user->email,
                'avatarUrl' => $user->profile_picture ? asset($user->profile_picture) : null,
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'fname' => 'required|string|max:255',
            'lname' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'remove_profile_picture' => 'nullable|boolean',
        ]);

        $user->fname = $validated['fname'];
        $user->lname = $validated['lname'];
        $user->email = $validated['email'];

        if ($request->boolean('remove_profile_picture') && $user->profile_picture) {
            $this->deleteProfilePicture($user->profile_picture);
            $user->profile_picture = null;
        }

        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture) {
                $this->deleteProfilePicture($user->profile_picture);
            }

            $file = $request->file('profile_picture');
            $filename = time().'_user_'.Str::slug($user->id.'-'.$file->getClientOriginalName()).'.'.$file->getClientOriginalExtension();
            $dest = public_path('images/user_profiles');
            if (! is_dir($dest)) {
                mkdir($dest, 0755, true);
            }
            $file->move($dest, $filename);
            $user->profile_picture = 'images/user_profiles/'.$filename;
        }

        $user->save();

        return back()->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => $validated['password'],
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    private function deleteProfilePicture(string $path): void
    {
        $full = public_path($path);
        if (is_file($full)) {
            unlink($full);
        }
    }
}
