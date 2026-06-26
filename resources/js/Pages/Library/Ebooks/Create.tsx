import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

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
}

interface CourseOption {
    id: number;
    course_name: string;
}

interface CreateEbookProps extends PageProps {
    programs: ProgramOption[];
    courses: CourseOption[];
}

export default function Create({ programs, courses }: CreateEbookProps) {
    const [courseOptions, setCourseOptions] = useState<CourseOption[]>(courses);
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        author: '',
        publication_year: '',
        publisher: '',
        source: '',
        link: '',
        program_id: '',
        course_id: '',
    });

    useEffect(() => {
        const selectedProgram = data.program_id.trim();
        if (selectedProgram === '') {
            setCourseOptions(courses);
            setData('course_id', '');
            return;
        }

        fetch(`/ebooks/get-courses/${selectedProgram}`, {
            headers: { Accept: 'application/json' },
        })
            .then((response) => response.json() as Promise<Array<{ id: number; name: string }>>)
            .then((payload) => {
                setCourseOptions(payload.map((course) => ({ id: course.id, course_name: course.name })));
                setData('course_id', '');
            })
            .catch(() => {
                setCourseOptions([]);
                setData('course_id', '');
            });
    }, [courses, data.program_id, setData]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/ebooks');
    };

    return (
        <LibraryLayout>
            <Head title="Add E-Resource" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Digital library"
                    title="Add e-resource"
                    description="Catalog a journal, e-book, or online material with optional program assignment."
                    backHref="/ebooks"
                    backLabel="Collection"
                />

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Bibliographic details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={submit}>
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(event) => setData('title', event.target.value)}
                                    required
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="author">Author</Label>
                                    <Input
                                        id="author"
                                        value={data.author}
                                        onChange={(event) => setData('author', event.target.value)}
                                        required
                                    />
                                    {errors.author && <p className="text-sm text-destructive">{errors.author}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="publication_year">Publication year</Label>
                                    <Input
                                        id="publication_year"
                                        value={data.publication_year}
                                        onChange={(event) => setData('publication_year', event.target.value)}
                                    />
                                    {errors.publication_year && (
                                        <p className="text-sm text-destructive">{errors.publication_year}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="publisher">Publisher</Label>
                                    <Input
                                        id="publisher"
                                        value={data.publisher}
                                        onChange={(event) => setData('publisher', event.target.value)}
                                    />
                                    {errors.publisher && <p className="text-sm text-destructive">{errors.publisher}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="source">Source</Label>
                                    <Input
                                        id="source"
                                        value={data.source}
                                        onChange={(event) => setData('source', event.target.value)}
                                        placeholder="e.g. ProQuest, Open Library"
                                    />
                                    {errors.source && <p className="text-sm text-destructive">{errors.source}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="link">Resource link (URL)</Label>
                                <Input
                                    id="link"
                                    type="url"
                                    value={data.link}
                                    onChange={(event) => setData('link', event.target.value)}
                                    placeholder="https://"
                                />
                                {errors.link && <p className="text-sm text-destructive">{errors.link}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="program_id">Program</Label>
                                    <select
                                        id="program_id"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={data.program_id}
                                        onChange={(event) => setData('program_id', event.target.value)}
                                    >
                                        <option value="">All programs</option>
                                        {programs.map((program) => (
                                            <option key={program.id} value={String(program.id)}>
                                                {program.program_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.program_id && <p className="text-sm text-destructive">{errors.program_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="course_id">Subject / course</Label>
                                    <select
                                        id="course_id"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={data.course_id}
                                        onChange={(event) => setData('course_id', event.target.value)}
                                    >
                                        <option value="">All subjects</option>
                                        {courseOptions.map((course) => (
                                            <option key={course.id} value={String(course.id)}>
                                                {course.course_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.course_id && <p className="text-sm text-destructive">{errors.course_id}</p>}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save e-resource'}
                                </Button>
                                <Link href="/ebooks">
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </LibraryLayout>
    );
}
