import { Head, Link } from '@inertiajs/react';

import CatalogBookForm, { type CatalogProgram, type FrameworkField, type MarcValues } from '@/components/library/CatalogBookForm';
import { Button } from '@/components/ui/button';
import LibraryLayout from '@/Layouts/LibraryLayout';

interface RecordData { title_statement?: string; main_author?: string; cover_image?: string }

export default function Review({ record, programs, frameworkFields, marcValues, isbnQuery, catalogSource, curriculumOptions }: { record: RecordData; programs: CatalogProgram[]; frameworkFields: FrameworkField[]; marcValues: MarcValues; isbnQuery: string; catalogSource: 'openlibrary' | 'googlebooks'; curriculumOptions: Record<string, string> }) {
    return <LibraryLayout><Head title="Review Catalog Record" /><div className="space-y-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-sm font-medium uppercase tracking-wide text-primary">{catalogSource}</p><h1 className="text-2xl font-semibold">Review Imported Record</h1><p className="text-muted-foreground">{record.title_statement ?? isbnQuery}{record.main_author ? ` — ${record.main_author}` : ''}</p></div><Button asChild variant="outline"><Link href={`/catalog/copy/openlibrary?isbn=${encodeURIComponent(isbnQuery)}`}>New search</Link></Button></div><CatalogBookForm mode="create" endpoint="/book" programs={programs} frameworkFields={frameworkFields} marcValues={marcValues} curriculumOptions={curriculumOptions} catalogSource={catalogSource} returnIsbn={isbnQuery} externalCoverUrl={record.cover_image} /></div></LibraryLayout>;
}
