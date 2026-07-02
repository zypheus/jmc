import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormErrorSummary, FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import LibraryLayout from '@/Layouts/LibraryLayout';

interface Course { id: number; year_level: number; course_code: string; course_name: string }
interface Program { id: number; program_code: string; program_name: string; total_years: number; courses: Course[] }

export default function Index({ programs, stats, search }: {
    programs: Program[];
    stats: { programs: number; courses: number };
    search?: string;
}) {
    const [query, setQuery] = useState(search ?? '');
    const program = useForm({ program_code: '', program_name: '', total_years: 4 });
    const course = useForm({ program_id: programs[0]?.id ?? 0, year_level: 1, course_code: '', course_name: '' });

    const filter = (event: FormEvent) => {
        event.preventDefault();
        router.get('/prospectus', { search: query }, { preserveState: true });
    };
    const addProgram = (event: FormEvent) => {
        event.preventDefault();
        program.post('/prospectus/store-program', { onSuccess: () => program.reset() });
    };
    const addCourse = (event: FormEvent) => {
        event.preventDefault();
        course.post(`/prospectus/${course.data.program_id}/course`, { onSuccess: () => course.reset('course_code', 'course_name') });
    };

    return (
        <LibraryLayout>
            <Head title="Prospectus Manager" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Prospectus Manager</h1>
                    <p className="text-muted-foreground">Maintain library programs and course discovery data.</p>
                </div>

                <dl className="flex flex-wrap gap-x-8 gap-y-3 border-y py-4">
                    <div><dt className="text-sm text-muted-foreground">Programs</dt><dd className="text-xl font-semibold">{stats.programs}</dd></div>
                    <div><dt className="text-sm text-muted-foreground">Courses</dt><dd className="text-xl font-semibold">{stats.courses}</dd></div>
                </dl>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Add Program</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={addProgram} className="space-y-4">
                                <FormErrorSummary errors={program.errors} />
                                <FormField id="program-code" label="Program code" error={program.errors.program_code} required>
                                    {(props) => <Input {...props} value={program.data.program_code} onChange={(event) => program.setData('program_code', event.target.value)} />}
                                </FormField>
                                <FormField id="program-name" label="Program name" error={program.errors.program_name} required>
                                    {(props) => <Input {...props} value={program.data.program_name} onChange={(event) => program.setData('program_name', event.target.value)} />}
                                </FormField>
                                <FormField id="program-years" label="Total years" error={program.errors.total_years} required>
                                    {(props) => <Input {...props} type="number" min={1} max={6} value={program.data.total_years} onChange={(event) => program.setData('total_years', Number(event.target.value))} />}
                                </FormField>
                                <Button disabled={program.processing}>Add program</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Add Course</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={addCourse} className="space-y-4">
                                <FormErrorSummary errors={course.errors} />
                                <FormField id="course-program" label="Program" error={course.errors.program_id} required>
                                    {(props) => (
                                        <select {...props} className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={course.data.program_id} onChange={(event) => course.setData('program_id', Number(event.target.value))}>
                                            {programs.map((item) => <option key={item.id} value={item.id}>{item.program_code}</option>)}
                                        </select>
                                    )}
                                </FormField>
                                <FormField id="course-year" label="Year level" error={course.errors.year_level} required>
                                    {(props) => <Input {...props} type="number" min={1} max={6} value={course.data.year_level} onChange={(event) => course.setData('year_level', Number(event.target.value))} />}
                                </FormField>
                                <FormField id="course-code" label="Course code" error={course.errors.course_code} required>
                                    {(props) => <Input {...props} value={course.data.course_code} onChange={(event) => course.setData('course_code', event.target.value)} />}
                                </FormField>
                                <FormField id="course-name" label="Course name" error={course.errors.course_name} required>
                                    {(props) => <Input {...props} value={course.data.course_name} onChange={(event) => course.setData('course_name', event.target.value)} />}
                                </FormField>
                                <Button disabled={course.processing || !course.data.program_id}>Add course</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Programs and Courses</CardTitle>
                        <CardDescription>Search and maintain the current prospectus.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={filter} className="flex flex-col gap-2 sm:flex-row">
                            <FormField id="prospectus-search" label="Search programs or courses" className="flex-1">
                                {(props) => <Input {...props} value={query} onChange={(event) => setQuery(event.target.value)} />}
                            </FormField>
                            <Button className="sm:self-end">Search</Button>
                        </form>
                        {programs.map((item) => (
                            <section key={item.id} className="rounded-lg border p-4" aria-labelledby={`program-${item.id}`}>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 id={`program-${item.id}`} className="font-semibold">{item.program_code} — {item.program_name}</h2>
                                        <p className="text-sm text-muted-foreground">{item.total_years} year(s)</p>
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={() => confirm(`Delete ${item.program_code}?`) && router.delete(`/prospectus/program/${item.id}`)}>Delete</Button>
                                </div>
                                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {item.courses.map((entry) => (
                                        <li key={entry.id} className="rounded-lg bg-muted/40 p-3 text-sm">
                                            <strong>{entry.course_code}</strong> — {entry.course_name}{' '}
                                            <span className="text-muted-foreground">(Year {entry.year_level})</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </LibraryLayout>
    );
}
