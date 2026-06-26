<?php

namespace Database\Seeders;

use App\Domain\Library\Models\LibraryCatalogFramework;
use App\Domain\Library\Models\LibraryCatalogFrameworkField;
use App\Domain\Library\Models\LibraryMarcField;
use Illuminate\Database\Seeder;

class MarcFrameworkSeeder extends Seeder
{
    public function run(): void
    {
        $framework = LibraryCatalogFramework::firstOrCreate(['name' => 'Books']);

        $defs = [
            ['tag' => '001', 'subfield' => null, 'label' => 'Control No.', 'book_column' => 'control_no'],
            ['tag' => '005', 'subfield' => null, 'label' => 'Date & Time Stamp', 'input_type' => 'datetime', 'book_column' => 'date_time_stamp'],
            ['tag' => '008', 'subfield' => null, 'label' => 'Fixed-Length Data / Form', 'input_type' => 'select', 'options' => ['Printed', 'Electronic', 'CD', 'Maps'], 'book_column' => 'fixed_length_data'],

            ['tag' => '020', 'subfield' => 'a', 'label' => 'ISBN', 'book_column' => 'isbn'],
            ['tag' => '020', 'subfield' => 'c', 'label' => 'Price', 'book_column' => 'price'],

            ['tag' => '040', 'subfield' => 'a', 'label' => 'Cataloging Source', 'book_column' => 'cataloging_source_a'],
            ['tag' => '040', 'subfield' => 'b', 'label' => 'Language', 'book_column' => 'cataloging_source_b'],
            ['tag' => '040', 'subfield' => 'e', 'label' => 'Description Conventions', 'book_column' => 'cataloging_source_e', 'default_value' => 'rda'],

            ['tag' => '100', 'subfield' => 'a', 'label' => 'Main Author', 'book_column' => 'main_author'],
            ['tag' => '245', 'subfield' => 'a', 'label' => 'Title', 'book_column' => 'title_statement'],
            ['tag' => '245', 'subfield' => 'c', 'label' => 'Title Responsibility', 'book_column' => 'title_author'],
            ['tag' => '250', 'subfield' => 'a', 'label' => 'Edition', 'book_column' => 'edition'],

            ['tag' => '264', 'subfield' => 'a', 'label' => 'Publication Place', 'book_column' => 'pub_place'],
            ['tag' => '264', 'subfield' => 'b', 'label' => 'Publisher', 'book_column' => 'publisher'],
            ['tag' => '264', 'subfield' => 'c', 'label' => 'Publication Year', 'book_column' => 'pub_year'],

            ['tag' => '300', 'subfield' => 'a', 'label' => 'Pages', 'book_column' => 'pages'],
            ['tag' => '300', 'subfield' => 'b', 'label' => 'Illustrations', 'book_column' => 'illustrations'],
            ['tag' => '300', 'subfield' => 'c', 'label' => 'Size', 'book_column' => 'size'],
            ['tag' => '300', 'subfield' => 'f', 'label' => 'Type of unit (e.g. volumes, pages)', 'book_column' => 'volume'],

            ['tag' => '336', 'subfield' => 'a', 'label' => 'Content Type', 'input_type' => 'select',
                'options' => ['Manual', 'Journal', 'Magazine', 'Yearbook', 'Almanac', 'Gazetteer', 'Dictionary'],
                'book_column' => 'content_type'],
            ['tag' => '337', 'subfield' => 'a', 'label' => 'Media Type', 'input_type' => 'select',
                'options' => ['Unmediated', 'Audio', 'Computer', 'Microform', 'Video', 'Other'],
                'book_column' => 'media_type'],
            ['tag' => '338', 'subfield' => 'a', 'label' => 'Carrier Type', 'input_type' => 'select',
                'options' => ['Volume', 'Online resource', 'Audio disc', 'CD-ROM', 'Sheet', 'Object'],
                'book_column' => 'carrier_type'],

            ['tag' => '490', 'subfield' => 'a', 'label' => 'Series Title', 'book_column' => 'series_title'],
            ['tag' => '500', 'subfield' => 'a', 'label' => 'General Note', 'input_type' => 'textarea', 'book_column' => 'general_note'],
            ['tag' => '504', 'subfield' => 'a', 'label' => 'Bibliography Note', 'input_type' => 'textarea', 'book_column' => 'bibliography_note'],

            ['tag' => '541', 'subfield' => 'a', 'label' => 'Immediate source of acquisition', 'book_column' => 'source_vendor'],
            ['tag' => '541', 'subfield' => 'd', 'label' => 'Date of acquisition', 'input_type' => 'date', 'book_column' => 'source_date'],

            ['tag' => '650', 'subfield' => 'a', 'label' => 'Subject', 'repeatable' => true, 'book_column' => 'subject_topic'],
            ['tag' => '650', 'subfield' => 'v', 'label' => 'Form', 'book_column' => 'subject_form'],
            ['tag' => '655', 'subfield' => 'a', 'label' => 'Genre', 'book_column' => 'genre'],

            ['tag' => '852', 'subfield' => 'b', 'label' => 'Library Name', 'input_type' => 'select', 'options' => ['Basic Education', 'Academic Library'], 'book_column' => 'library_name'],
            ['tag' => '852', 'subfield' => 'c', 'label' => 'Sublocation / shelving (local)', 'book_column' => 'section'],
            ['tag' => '852', 'subfield' => 'h', 'label' => 'Call Number', 'book_column' => 'call_number'],

            ['tag' => '949', 'subfield' => null, 'label' => 'Accession No.', 'book_column' => 'accession_no'],
            ['tag' => '876', 'subfield' => 'p', 'label' => 'Barcode', 'book_column' => 'barcode'],
            ['tag' => '999', 'subfield' => 'r', 'label' => 'RFID', 'book_column' => 'rfid'],
        ];

        $order = 0;
        foreach ($defs as $d) {
            $marc = LibraryMarcField::updateOrCreate(
                ['tag' => $d['tag'], 'subfield' => $d['subfield'] ?? null],
                [
                    'label' => $d['label'] ?? null,
                    'repeatable' => (bool) ($d['repeatable'] ?? false),
                    'input_type' => $d['input_type'] ?? 'text',
                    'options' => $d['options'] ?? null,
                ]
            );

            LibraryCatalogFrameworkField::updateOrCreate(
                ['framework_id' => $framework->id, 'marc_field_id' => $marc->id],
                [
                    'visible' => true,
                    'required' => false,
                    'sort_order' => $order++,
                    'book_column' => $d['book_column'] ?? null,
                    'default_value' => $d['default_value'] ?? null,
                ]
            );
        }
    }
}
