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

interface EbookFormRow {
    id: number;
    title: string;
    author: string;
    publication_year: string | null;
    publisher: string | null;
    source: string | null;
    link: string | null;
    program_id: number | null;
    course_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

interface EditEbookProps extends PageProps {
    ebook: EbookFormRow;
    programs: ProgramOption[];
    courses: CourseOption[];
}

export default function Edit({ ebook, programs, courses }: EditEbookProps) {
    const [courseOptions, setCourseOptions] = useState<CourseOption[]>(courses);
    const { data, setData, put, processing, errors } = useForm({
        title: ebook.title ?? '',
        author: ebook.author ?? '',
        publication_year: ebook.publication_year ?? '',
        publisher: ebook.publisher ?? '',
        source: ebook.source ?? '',
        link: ebook.link ?? '',
        program_id: ebook.program_id ? String(ebook.program_id) : '',
        course_id: ebook.course_id ? String(ebook.course_id) : '',
    });

    useEffect(() => {
        const selectedProgram = data.program_id.trim();
        if (selectedProgram === '') {
            setCourseOptions(courses);
            return;
        }

        fetch(`/ebooks/get-courses/${selectedProgram}`, {
            headers: { Accept: 'application/json' },
        })
            .then((response) => response.json() as Promise<Array<{ id: number; name: string }>>)
            .then((payload) => {
                const mapped = payload.map((course) => ({ id: course.id, course_name: course.name }));
                setCourseOptions(mapped);

                if (data.course_id && !mapped.some((course) => String(course.id) === data.course_id)) {
                    setData('course_id', '');
                }
            })
            .catch(() => {
                setCourseOptions([]);
            });
    }, [courses, data.program_id, setData]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(`/ebooks/${ebook.id}`);
    };

    return (
        <LibraryLayout>
            <Head title="Edit E-Resource" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Digital library"
                    title="Edit e-resource"
                    description={ebook.title}
                    backHref="/ebooks"
                    backLabel="Collection"
                    actions={
                        ebook.link ? (
                            <a href={ebook.link} target="_blank" rel="noreferrer">
                                <Button variant="outline" size="sm">
                                    Open link
                                </Button>
                            </a>
                        ) : null
                    }
                />

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <Card>
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
                                        {errors.publisher && (
                                            <p className="text-sm text-destructive">{errors.publisher}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="source">Source</Label>
                                        <Input
                                            id="source"
                                            value={data.source}
                                            onChange={(event) => setData('source', event.target.value)}
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
                                        {errors.program_id && (
                                            <p className="text-sm text-destructive">{errors.program_id}</p>
                                        )}
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
                                        {processing ? 'Saving...' : 'Save changes'}
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Record info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p>
                                <span className="font-semibold">ID:</span> #{ebook.id}
                            </p>
                            <p>
                                <span className="font-semibold">Added:</span>{' '}
                                {ebook.created_at ? new Date(ebook.created_at).toLocaleString('en-PH') : '—'}
                            </p>
                            <p>
                                <span className="font-semibold">Updated:</span>{' '}
                                {ebook.updated_at ? new Date(ebook.updated_at).toLocaleString('en-PH') : '—'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </LibraryLayout>
    );
}
