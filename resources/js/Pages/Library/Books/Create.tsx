import { Head } from '@inertiajs/react';

import CatalogBookForm, { type CatalogProgram, type FrameworkField } from '@/components/library/CatalogBookForm';
import LibraryLayout from '@/Layouts/LibraryLayout';

export default function Create({ programs, frameworkFields, curriculumOptions }: { programs: CatalogProgram[]; frameworkFields: FrameworkField[]; curriculumOptions: Record<string, string> }) {
    return <LibraryLayout><Head title="Add Book" /><div className="space-y-6"><div><h1 className="text-2xl font-semibold">Add Book</h1><p className="text-muted-foreground">Create a MARC-based catalog record and copy.</p></div><CatalogBookForm mode="create" endpoint="/book" programs={programs} frameworkFields={frameworkFields} curriculumOptions={curriculumOptions} /></div></LibraryLayout>;
}
