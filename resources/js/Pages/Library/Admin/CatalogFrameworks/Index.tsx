import { Head, Link } from '@inertiajs/react';

import EmptyState from '@/components/library/EmptyState';
import PageHeader from '@/components/library/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps } from '@/types';

interface FrameworkRow {
    id: number;
    name: string;
}

interface CatalogFrameworkIndexProps extends PageProps {
    frameworks: FrameworkRow[];
}

export default function Index({ frameworks }: CatalogFrameworkIndexProps) {
    return (
        <LibraryLayout>
            <Head title="MARC Frameworks" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Library admin"
                    title="MARC catalog frameworks"
                    description="Control which tags appear on Add/Edit book, with visibility, ordering, and optional book-column mapping."
                    actions={
                        <>
                            <Link href="/admin/catalog-select-options">
                                <Button variant="outline" size="sm">
                                    Dropdown options
                                </Button>
                            </Link>
                            <Link href="/books">
                                <Button variant="outline" size="sm">
                                    Back to books
                                </Button>
                            </Link>
                        </>
                    }
                />

                <Card>
                    <CardContent className="space-y-2 pt-6">
                        {frameworks.length === 0 ? (
                            <EmptyState
                                title="No frameworks found"
                                description="Run `php artisan db:seed --class=MarcFrameworkSeeder` to populate catalog frameworks."
                            />
                        ) : (
                            frameworks.map((framework) => (
                                <Link
                                    key={framework.id}
                                    href={`/admin/catalog-frameworks/${framework.id}/edit`}
                                    className="flex items-center justify-between rounded-md border px-4 py-3 text-sm hover:bg-muted"
                                >
                                    <span className="font-medium">{framework.name}</span>
                                    <span className="text-muted-foreground">Edit</span>
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </LibraryLayout>
    );
}
