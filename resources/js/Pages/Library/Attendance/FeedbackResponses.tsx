import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps, Paginated } from '@/types';

interface FeedbackStudent {
    id: number;
    firstname: string;
    lastname: string;
}

interface LibraryAttendanceFeedback {
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

interface FeedbackResponsesProps extends PageProps {
    feedbacks: Paginated<LibraryAttendanceFeedback>;
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

function ratingLabel(feedback: LibraryAttendanceFeedback): string {
    if (feedback.declined) {
        return 'Declined';
    }

    return feedback.rating ? feedback.rating.replace(/_/g, ' ') : '-';
}

export default function FeedbackResponses({ feedbacks, summary, filters }: FeedbackResponsesProps) {
    const [rating, setRating] = useState(filters.rating ?? '');

    function applyFilter(event: FormEvent) {
        event.preventDefault();
        router.get('/library/attendance/feedback-responses', { rating: rating || undefined }, { preserveState: true });
    }

    return (
        <LibraryLayout>
            <Head title="Attendance Feedback Responses" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Attendance Feedback Responses</h1>
                    <p className="text-muted-foreground">Student feedback collected from the attendance scanner.</p>
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
                                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
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
                                    onChange={(event) => setRating(event.target.value)}
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
                                    {feedbacks.data.map((feedback) => (
                                        <tr key={feedback.id} className="border-b last:border-0">
                                            <td className="py-3">
                                                {feedback.student
                                                    ? `${feedback.student.firstname} ${feedback.student.lastname}`
                                                    : '-'}
                                            </td>
                                            <td className="py-3 capitalize">{ratingLabel(feedback)}</td>
                                            <td className="py-3">{feedback.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={feedbacks.links} />
                    </CardContent>
                </Card>
            </div>
        </LibraryLayout>
    );
}
