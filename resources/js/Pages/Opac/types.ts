import type { Paginated } from '@/types';

export interface OpacProgram {
    id: number;
    program_name: string;
    program_code: string | null;
}

export interface OpacBookSummary {
    id: number;
    title_statement: string;
    main_author: string | null;
    pub_year: string | number | null;
    copies?: number;
    is_available?: number | boolean;
    content_type?: string | null;
    call_number?: string | null;
    general_note?: string | null;
    cover_image?: string | null;
    library_name?: string | null;
    course?: string | null;
}

export interface OpacEbook {
    id: number;
    title: string;
    author: string | null;
    publisher?: string | null;
    publication_year: string | null;
    source: string | null;
    link: string | null;
    cover_image?: string | null;
}

export interface OpacCopy {
    id: number;
    accession_no: string | null;
    call_number: string | null;
    volume: string | null;
    copy_no: string | null;
    collection: string | null;
    shelving_location: string | null;
    circulation_type: string | null;
    circulation_status: string | null;
    availability: string;
    reserved: boolean;
    patron_hold: boolean;
    patron_hold_status: 'pending' | 'ready' | null;
    barcode: string | null;
    rfid: string | null;
    created_at?: string | null;
}

export interface OpacDescription {
    main_author: string | null;
    title: string;
    format: string | null;
    edition: string | null;
    published: string | null;
    isbn: string | null;
    general_note: string | null;
    physical_description: string | null;
    bibliography: string | null;
    subject_topic: string | null;
    subject_form: string | null;
    genre: string | null;
    series: string | null;
}

export interface OpacDetailPayload {
    group: {
        title: string;
        author: string | null;
        year: string | number | null;
    };
    description: OpacDescription;
    copies: OpacCopy[];
    marc_view_rows: Array<{ label: string; value: string }>;
}

export interface CartItem {
    id: number;
    title: string;
    author: string;
}

export interface OpacFilters {
    subjectTopics: string[];
    genres: string[];
    sections: string[];
    courses: string[];
    contentTypes: string[];
    search: string;
    viewMode: 'books' | 'ebooks';
    searchActive: boolean;
    course: string;
    subjectTopic: string;
    genre: string;
    section: string;
    contentType: string;
}

export interface LandingPayload {
    programs: OpacProgram[];
    carouselBooks: OpacBookSummary[];
    carouselMeta: Record<number, { copies: number; is_available: boolean }>;
    libraryBooks: Paginated<OpacBookSummary>;
    libraryEbooks: Paginated<OpacEbook> | null;
    filters: OpacFilters;
}

export function coverUrl(path?: string | null): string {
    if (!path) {
        return '/images/defaultBook.png';
    }

    if (/^https?:\/\//i.test(path) || path.startsWith('/')) {
        return path;
    }

    return `/storage/${path}`;
}
