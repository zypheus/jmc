import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { PageProps, Paginated } from '@/types';

interface FeedbackStudent {
    id: number;
    firstname: string;
    lastname: string;
}

interface AttendanceFeedback {
    id: number;
    rating: string | null;
    declined: boolean;
    created_at: string;
    student: FeedbackStudent | null;
}

interface FeedbackSummary {
    total: number;
    excellent: number;
    good: number;
    medium: number;
    poor: number;
    very_bad: number;
    declined: number;
}

interface IndexProps extends PageProps {
    feedbacks: Paginated<AttendanceFeedback>;
    summary: FeedbackSummary;
    filters: {
        rating?: string;
    };
}

function Pagination({ links }: { links: Paginated<unknown>['links'] }) {
    return (
        <div className="mt-4 flex flex-wrap gap-1">
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={index}
                        href={link.url}
                        className={`rounded border px-3 py-1 text-sm ${
                            link.active ? 'border-primary bg-primary text-primary-foreground' : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={index}
                        className="px-3 py-1 text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </div>
    );
}

function ratingLabel(feedback: AttendanceFeedback): string {
    if (feedback.declined) {
        return 'Declined';
    }
    if (!feedback.rating) {
        return '—';
    }
    return feedback.rating.replace(/_/g, ' ');
}

export default function Index({ feedbacks, summary, filters }: IndexProps) {
    const [rating, setRating] = useState(filters.rating ?? '');

    function applyFilter(event: FormEvent) {
        event.preventDefault();
        router.get('/attendance/feedbacks', { rating: rating || undefined }, { preserveState: true });
    }

    return (
        <AttendanceLayout>
            <Head title="Attendance Feedback Report" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Attendance Feedback Report</h1>
                    <p className="text-muted-foreground">Student feedback collected at the attendance kiosk.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {(
                        [
                            ['Total', summary.total],
                            ['Excellent', summary.excellent],
                            ['Good', summary.good],
                            ['Medium', summary.medium],
                            ['Poor', summary.poor],
                            ['Very Bad', summary.very_bad],
                            ['Declined', summary.declined],
                        ] as const
                    ).map(([label, count]) => (
                        <Card key={label}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold">{count}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rating">Rating</Label>
                                <select
                                    id="rating"
                                    className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="medium">Medium</option>
                                    <option value="poor">Poor</option>
                                    <option value="very_bad">Very Bad</option>
                                    <option value="declined">Declined</option>
                                </select>
                            </div>
                            <Button type="submit">Apply</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{feedbacks.total} feedback entr{feedbacks.total === 1 ? 'y' : 'ies'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-2 font-medium">Student</th>
                                        <th className="pb-2 font-medium">Rating</th>
                                        <th className="pb-2 font-medium">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedbacks.data.length > 0 ? (
                                        feedbacks.data.map((feedback) => (
                                            <tr key={feedback.id} className="border-b last:border-0">
                                                <td className="py-3">
                                                    {feedback.student
                                                        ? `${feedback.student.firstname} ${feedback.student.lastname}`
                                                        : '—'}
                                                </td>
                                                <td className="py-3 capitalize">{ratingLabel(feedback)}</td>
                                                <td className="py-3">{feedback.created_at}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-10 text-center text-muted-foreground">
                                                No attendance feedback matches the selected rating.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={feedbacks.links} />
                    </CardContent>
                </Card>
            </div>
        </AttendanceLayout>
    );
}
