<?php

namespace App\Domain\Library\Exports;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class FeedbackExport implements FromCollection, WithHeadings
{
    public function __construct(
        protected Collection $feedbacks
    ) {}

    public function collection()
    {
        return $this->feedbacks->map(function ($feedback) {
            $isAnonymous = blank($feedback->name) && blank($feedback->email);
            $submitted = $feedback->created_at
                ? Carbon::parse($feedback->created_at)->timezone('Asia/Manila')->format('Y-m-d h:i A')
                : '—';

            return [
                'name' => $feedback->name ?: 'Anonymous',
                'email' => $feedback->email ?: '—',
                'contact_type' => $isAnonymous ? 'Anonymous' : 'Identified',
                'comments' => $feedback->comments,
                'submitted_at' => $submitted,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Name',
            'Email',
            'Contact type',
            'Comments',
            'Submitted at',
        ];
    }
}
