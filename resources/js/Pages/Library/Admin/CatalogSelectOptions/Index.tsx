import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

import EmptyState from '@/components/library/EmptyState';
import PageHeader from '@/components/library/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps } from '@/types';

interface SectionDefinition {
    tag: string;
    subfield?: string | null;
    title?: string;
    book_column?: string | null;
}

interface MarcField {
    id: number;
    tag: string;
    subfield: string | null;
    label: string | null;
}

interface CatalogSelectSection {
    def: SectionDefinition;
    marc: MarcField;
    saved: string[];
    from_records: string[];
}

interface CatalogSelectOptionsIndexProps extends PageProps {
    sections: CatalogSelectSection[];
    activeField: string;
}

export default function Index({ sections, activeField }: CatalogSelectOptionsIndexProps) {
    const [newOptions, setNewOptions] = useState<Record<string, string>>({});

    const addOption = (section: CatalogSelectSection) => {
        const anchor = `${section.def.tag}${section.def.subfield ?? ''}`;
        const option = (newOptions[anchor] ?? '').trim();
        if (!option) {
            return;
        }

        router.post(
            '/admin/catalog-select-options',
            {
                tag: section.def.tag,
                subfield: section.def.subfield ?? '',
                option,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewOptions((prev) => ({ ...prev, [anchor]: '' }));
                },
            },
        );
    };

    const removeOption = (section: CatalogSelectSection, option: string) => {
        if (!window.confirm('Remove this option from the dropdown list?')) {
            return;
        }

        router.delete('/admin/catalog-select-options', {
            data: {
                tag: section.def.tag,
                subfield: section.def.subfield ?? '',
                option,
            },
            preserveScroll: true,
        });
    };

    return (
        <LibraryLayout>
            <Head title="Catalog Dropdown Options" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Library admin"
                    title="Catalog dropdown options"
                    description="Manage RDA select values for content, media, and carrier types used in Add/Edit book."
                    actions={
                        <>
                            <Link href="/admin/catalog-frameworks">
                                <Button variant="outline" size="sm">
                                    MARC frameworks
                                </Button>
                            </Link>
                            <Link href="/books">
                                <Button variant="outline" size="sm">
                                    Books
                                </Button>
                            </Link>
                        </>
                    }
                />

                {sections.length === 0 ? (
                    <EmptyState
                        title="No extensible fields found"
                        description="Run migrations and the MARC framework seeder to configure catalog dropdown fields."
                    />
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {sections.map((section) => {
                            const subfield = section.def.subfield ?? null;
                            const anchor = `${section.def.tag}${subfield ?? ''}`;
                            const isHighlighted = activeField === anchor;
                            const sectionTitle = section.def.title || section.marc.label || 'Dropdown options';
                            return (
                                <Card key={anchor} className={isHighlighted ? 'border-primary' : ''}>
                                    <CardHeader>
                                        <CardTitle>{sectionTitle}</CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            {section.marc.tag}
                                            {section.marc.subfield ? ` ‡${section.marc.subfield}` : ''} · maps to books.
                                            {section.def.book_column ?? '—'}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Saved options</p>
                                            {section.saved.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No saved options yet.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {section.saved.map((option) => (
                                                        <div
                                                            key={option}
                                                            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                                        >
                                                            <span>{option}</span>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                type="button"
                                                                onClick={() => removeOption(section, option)}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {section.from_records.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">On existing books only</p>
                                                <ul className="space-y-1 text-sm text-muted-foreground">
                                                    {section.from_records.map((option) => (
                                                        <li key={option}>{option}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Add option</p>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newOptions[anchor] ?? ''}
                                                    onChange={(event) =>
                                                        setNewOptions((prev) => ({
                                                            ...prev,
                                                            [anchor]: event.target.value,
                                                        }))
                                                    }
                                                    placeholder={`New ${sectionTitle.toLowerCase()}`}
                                                />
                                                <Button type="button" onClick={() => addOption(section)}>
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </LibraryLayout>
    );
}
