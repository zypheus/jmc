<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Mail\ReservationApprovedMail;
use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryReservationLog;
use App\Domain\Library\Models\LibraryReservationStudent;
use App\Domain\Library\Models\LibraryRoom;
use App\Domain\Library\Models\LibraryRoomReservation;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Domain\Library\Support\PerPage;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class RoomReservationController extends Controller
{
    /**
     * Show booking page
     */
    public function create()
    {
        $rooms = LibraryRoom::all();

        // Predefined 2-hour intervals between 8AM and 6PM
        $timeSlots = [
            '08:00-10:00' => '8:00 AM - 10:00 AM',
            '10:00-12:00' => '10:00 AM - 12:00 PM',
            '12:00-14:00' => '12:00 PM - 2:00 PM',
            '14:00-16:00' => '2:00 PM - 4:00 PM',
            '16:00-18:00' => '4:00 PM - 6:00 PM',
        ];

        return view('rooms.book', compact('rooms', 'timeSlots'));
    }

    public function destroy($id)
    {
        $reservation = LibraryRoomReservation::with('room')->findOrFail($id);
        $label = ($reservation->room->name ?? 'Room').' on '.$reservation->date;
        $reservation->delete();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_ROOM,
            'Room reservation removed',
            $label,
            route('library.rooms.logs'),
            'room',
        );

        return redirect()->back()->with('success', 'Reservation removed successfully.');
    }

    /**
     * Store booking request
     */
    public function store(Request $request)
    {
        // ðŸ§© Validate form inputs
        $validated = $request->validate([
            'room_id' => 'required|exists:library_rooms,id',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|string',
            'start_ampm' => 'required|string|in:AM,PM',
            'end_time' => 'required|string',
            'end_ampm' => 'required|string|in:AM,PM',
            'patron_email' => 'required|email',
            'number_of_students' => 'required|integer|min:1|max:20',
            'student_names' => 'required|array|min:1|max:20',
            'student_names.*' => 'required|string|max:255',
        ]);

        // ðŸ•’ Convert 12-hour time to 24-hour format for MySQL TIME type
        $startTime = Carbon::createFromFormat('g:i A', $request->start_time.' '.$request->start_ampm)->format('H:i:s');
        $endTime = Carbon::createFromFormat('g:i A', $request->end_time.' '.$request->end_ampm)->format('H:i:s');

        // ðŸ§­ Prevent double booking (same room/date/timeslot)
        $exists = LibraryRoomReservation::where('room_id', $request->room_id)
            ->where('date', $request->date)
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                    ->orWhereBetween('end_time', [$startTime, $endTime]);
            })
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'That room and time slot is already booked.');
        }

        // âœ… Insert data safely
        $reservation = null;
        \DB::transaction(function () use ($request, $startTime, $endTime, &$reservation) {
            $reservation = LibraryRoomReservation::create([
                'room_id' => $request->room_id,
                'date' => $request->date,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'patron_email' => $request->patron_email,
                'number_of_students' => $request->number_of_students,
                'status' => 'pending',
            ]);

            foreach ($request->student_names as $name) {
                LibraryReservationStudent::create([
                    'reservation_id' => $reservation->id,
                    'name' => $name,
                ]);
            }

            LibraryReservationLog::create([
                'reservation_id' => $reservation->id,
                'user_id' => Auth::id(),
                'action' => 'created',
                'meta' => $request->all(),
            ]);
        });

        $reservation?->load('room');
        if ($reservation) {
            AdminActivityLogger::roomReservationPending(
                $reservation,
                $reservation->room?->name ?? 'Room',
                $reservation->date?->format('M j, Y') ?? (string) $request->date,
            );
        }

        return back()->with('success', 'Reservation submitted and pending approval.');
    }

    /**
     * Admin view of pending reservations
     */
    public function pending()
    {
        $pending = LibraryRoomReservation::with('room', 'students')->where('status', 'pending')->latest()->get();

        return Inertia::render('Library/Rooms/Pending', [
            'reservations' => $pending,
        ]);
    }

    /**
     * Approve a reservation
     */
    public function approve($id)
    {
        $reservation = LibraryRoomReservation::findOrFail($id);

        $reservation->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        LibraryReservationLog::create([
            'reservation_id' => $reservation->id,
            'user_id' => Auth::id(),
            'action' => 'approved',
        ]);

        $flash = ['success' => 'Reservation approved successfully.'];

        AdminActivityLogger::staff(
            AdminActivity::TYPE_ROOM,
            'Room reservation approved',
            ($reservation->room->name ?? 'Room').' on '.$reservation->date,
            route('library.rooms.pending'),
            'room',
            $reservation,
        );

        if (filled($reservation->patron_email)) {
            try {
                Mail::to($reservation->patron_email)->send(new ReservationApprovedMail($reservation));
            } catch (\Throwable $e) {
                report($e);
                $flash['warning'] = 'The confirmation email could not be sent. Check SMTP settings for support@pantas.org.';
            }
        }

        return back()->with($flash);
    }

    /**
     * Schedule view (all reservations)
     */
    public function schedule()
    {
        $reservations = LibraryRoomReservation::with('room')->orderBy('date')->get();
        $rooms = LibraryRoom::all();

        return Inertia::render('Public/Rooms/Schedule', compact('reservations', 'rooms'));
    }

    /**
     * Show reservation details
     */
    public function show($id)
    {
        $reservation = LibraryRoomReservation::with(['room', 'students', 'logs'])->findOrFail($id);

        return Inertia::render('Public/Rooms/Show', compact('reservation'));
    }

    public function checkAvailability(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:library_rooms,id',
            'date' => 'required|date',
        ]);

        $bookedSlots = LibraryRoomReservation::where('room_id', $request->room_id)
            ->where('date', $request->date)
            ->whereIn('status', ['pending', 'approved'])
            ->pluck('time_slot');

        return response()->json($bookedSlots);
    }

    public function logs(Request $request)
    {
        $logs = LibraryReservationLog::with(['reservation.room', 'user'])
            ->latest()
            ->paginate(PerPage::resolve($request, 20))
            ->withQueryString();

        return Inertia::render('Library/Rooms/Logs', [
            'logs' => $logs,
        ]);
    }

    public function reject($id)
    {
        $reservation = LibraryRoomReservation::with('room')->findOrFail($id);
        $reservation->status = 'rejected';
        $reservation->save();

        // (Optional) Log the rejection
        LibraryReservationLog::create([
            'reservation_id' => $reservation->id,
            'user_id' => auth()->id(),
            'action' => 'rejected',
        ]);

        AdminActivityLogger::staff(
            AdminActivity::TYPE_ROOM,
            'Room reservation rejected',
            ($reservation->room->name ?? 'Room').' on '.$reservation->date,
            route('library.rooms.pending'),
            'room',
            $reservation,
        );

        return redirect()->back()->with('success', 'Reservation rejected successfully.');
    }
}
