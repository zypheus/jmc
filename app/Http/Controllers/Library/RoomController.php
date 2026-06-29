<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryRoom;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function index(): Response
    {
        $rooms = LibraryRoom::all();

        return Inertia::render('Library/Rooms/Index', compact('rooms'));
    }

    public function create(): Response
    {
        return Inertia::render('Library/Rooms/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'required|integer|min:1',
        ]);

        $room = LibraryRoom::create($request->only('name', 'description', 'capacity'));

        AdminActivityLogger::staff(
            AdminActivity::TYPE_ROOM,
            'Room created',
            $room->name,
            route('library.rooms.edit', $room->id),
            'room',
            $room,
        );

        return redirect()->route('library.rooms.index')->with('success', 'Room added successfully!');
    }

    public function edit($id): Response
    {
        $room = LibraryRoom::findOrFail($id);

        return Inertia::render('Library/Rooms/Edit', compact('room'));
    }

    public function update(Request $request, $id)
    {
        $room = LibraryRoom::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'required|integer|min:1',
        ]);

        $room->update($request->only('name', 'description', 'capacity'));

        AdminActivityLogger::staff(
            AdminActivity::TYPE_ROOM,
            'Room updated',
            $room->name,
            route('library.rooms.edit', $room->id),
            'room',
            $room,
        );

        return redirect()->route('library.rooms.index')->with('success', 'Room updated successfully!');
    }

    public function destroy($id)
    {
        $room = LibraryRoom::findOrFail($id);
        $name = $room->name;
        $room->delete();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_ROOM,
            'Room deleted',
            $name,
            route('library.rooms.index'),
            'room',
        );

        return redirect()->route('library.rooms.index')->with('success', 'Room deleted successfully!');
    }
}
