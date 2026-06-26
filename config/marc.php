<?php

return [

    'group_titles' => [
        '0' => 'Identification',
        '1' => 'Authors',
        '2' => 'Title',
        '3' => 'Physical',
        '4' => 'Series',
        '5' => 'Notes',
        '6' => 'Subjects',
        '7' => 'Access',
        '8' => 'Digital',
        '9' => 'Local',
    ],

    'group_titles_long' => [
        '0' => 'Identification & codes',
        '1' => 'Authors & contributors',
        '2' => 'Title & edition',
        '3' => 'Physical description',
        '4' => 'Series',
        '5' => 'Notes',
        '6' => 'Subjects & classification',
        '7' => 'Additional access points',
        '8' => 'Digital location',
        '9' => 'Local data',
    ],

    /*
    | Cataloging tab fields (Programs) — shown on read-only views when not in the framework.
    */
    'program_tab_fields' => [
        ['book_column' => 'year', 'tag' => '996', 'label' => 'Year level'],
        ['book_column' => 'course', 'tag' => '650', 'label' => 'Course'],
        ['book_column' => 'curriculum', 'tag' => '—', 'label' => 'Curriculum'],
    ],

];
