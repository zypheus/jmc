import { Head } from '@inertiajs/react';
import { useState } from 'react';

import PageHeader from '@/components/library/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps } from '@/types';

interface ProgramOption {
    id: number;
    program_name: string;
    program_code: string | null;
}

interface HoldingsProps extends PageProps {
    programs: ProgramOption[];
}

function csrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

export default function Holdings({ programs }: HoldingsProps) {
    const [programId, setProgramId] = useState('');
    const [programSuffix, setProgramSuffix] = useState('');
    const [dateAccomplished, setDateAccomplished] = useState('');

    return (
        <LibraryLayout>
            <Head title="Library Holdings Report" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Reports"
                    title="Library holdings report"
                    description="Generate CHED-style Report 1 and Report 2 from cataloged holdings."
                    backHref="/books"
                    backLabel="Back to catalog"
                />

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Report filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form method="POST" action="/reports/library-holdings" className="space-y-5">
                            <input type="hidden" name="_token" value={csrfToken()} />

                            <div className="space-y-2">
                                <Label htmlFor="program_id">Program</Label>
                                <select
                                    id="program_id"
                                    name="program_id"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    required
                                    value={programId}
                                    onChange={(event) => setProgramId(event.target.value)}
                                >
                                    <option value="">— Select program —</option>
                                    {programs.map((program) => (
                                        <option key={program.id} value={String(program.id)}>
                                            {program.program_name}
                                            {program.program_code ? ` (${program.program_code})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-muted-foreground">
                                    Report 1 includes titles per course; Report 2 summarizes holdings by classification.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="program_suffix">Program name suffix (optional)</Label>
                                <Input
                                    id="program_suffix"
                                    name="program_suffix"
                                    value={programSuffix}
                                    onChange={(event) => setProgramSuffix(event.target.value)}
                                    placeholder="e.g. MAJOR IN ENGLISH"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_accomplished">Date accomplished (optional)</Label>
                                <Input
                                    id="date_accomplished"
                                    name="date_accomplished"
                                    value={dateAccomplished}
                                    onChange={(event) => setDateAccomplished(event.target.value)}
                                    placeholder="Leave blank for a signature line"
                                />
                            </div>

                            <div className="rounded-md border bg-muted/40 p-3 text-sm">
                                <p className="font-medium">Download includes two Excel sheets:</p>
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                                    <li>Report 1 — program detail with per-course title and copy summaries</li>
                                    <li>Report 2 — holdings grouped by classification and format totals</li>
                                </ul>
                            </div>

                            <Button type="submit">Download Excel (Reports 1 & 2)</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </LibraryLayout>
    );
}
