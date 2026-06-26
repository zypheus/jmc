<?php

/**
 * One-shot port of USM library domain into jmc structure.
 * Run from jmc/: php scripts/port-library-domain.php
 */
$jmcRoot = dirname(__DIR__);
$usmRoot = dirname($jmcRoot).DIRECTORY_SEPARATOR.'usm';

$modelMap = [
    'Book' => 'LibraryBook',
    'BookLog' => 'LibraryBookLog',
    'BookMarcField' => 'LibraryBookMarcField',
    'BookReservation' => 'LibraryBookReservation',
    'Student' => 'LibraryStudent',
    'Employee' => 'LibraryEmployee',
    'PendingStudent' => 'LibraryPendingStudent',
    'PendingEmployee' => 'LibraryPendingEmployee',
    'Program' => 'LibraryProgram',
    'ProgramCourse' => 'LibraryProgramCourse',
    'ProgramYear' => 'LibraryProgramCourse',
    'Prospectus' => 'LibraryProspectus',
    'Setting' => 'LibrarySetting',
    'FineSetting' => 'LibraryFineSetting',
    'Holiday' => 'LibraryHoliday',
    'Ebook' => 'LibraryEbook',
    'Room' => 'LibraryRoom',
    'RoomReservation' => 'LibraryRoomReservation',
    'CatalogFramework' => 'LibraryCatalogFramework',
    'CatalogFrameworkField' => 'LibraryCatalogFrameworkField',
    'MarcField' => 'LibraryMarcField',
    'AdminActivity' => 'AdminActivity',
    'StudentEditRequest' => 'LibraryStudentEditRequest',
    'Role' => 'LibraryRole',
    'Feedback' => 'LibraryFeedback',
];

$tableMap = [
    'book_logs' => 'library_book_logs',
    'book_marc_fields' => 'library_book_marc_fields',
    'book_reservations' => 'library_book_reservations',
    'book_program' => 'library_book_program',
    'pending_students' => 'library_pending_students',
    'pending_employees' => 'library_pending_employees',
    'program_courses' => 'library_program_courses',
    'program_years' => 'library_program_courses',
    'student_edit_requests' => 'library_student_edit_requests',
    'catalog_frameworks' => 'library_catalog_frameworks',
    'catalog_framework_fields' => 'library_catalog_framework_fields',
    'marc_fields' => 'library_marc_fields',
    'room_reservations' => 'library_room_reservations',
    'fine_settings' => 'library_fine_settings',
    'books' => 'library_books',
    'students' => 'library_students',
    'employees' => 'library_employees',
    'programs' => 'library_programs',
    'prospectuses' => 'library_prospectuses',
    'settings' => 'library_settings',
    'holidays' => 'library_holidays',
    'ebooks' => 'library_ebooks',
    'rooms' => 'library_rooms',
    'roles' => 'library_roles',
    'feedback' => 'library_feedback',
];

$modelTableMap = [
    'LibraryBook' => 'library_books',
    'LibraryBookLog' => 'library_book_logs',
    'LibraryBookMarcField' => 'library_book_marc_fields',
    'LibraryBookReservation' => 'library_book_reservations',
    'LibraryStudent' => 'library_students',
    'LibraryEmployee' => 'library_employees',
    'LibraryPendingStudent' => 'library_pending_students',
    'LibraryPendingEmployee' => 'library_pending_employees',
    'LibraryProgram' => 'library_programs',
    'LibraryProgramCourse' => 'library_program_courses',
    'LibraryProspectus' => 'library_prospectuses',
    'LibrarySetting' => 'library_settings',
    'LibraryFineSetting' => 'library_fine_settings',
    'LibraryHoliday' => 'library_holidays',
    'LibraryEbook' => 'library_ebooks',
    'LibraryRoom' => 'library_rooms',
    'LibraryRoomReservation' => 'library_room_reservations',
    'LibraryCatalogFramework' => 'library_catalog_frameworks',
    'LibraryCatalogFrameworkField' => 'library_catalog_framework_fields',
    'LibraryMarcField' => 'library_marc_fields',
    'AdminActivity' => 'admin_activities',
    'LibraryStudentEditRequest' => 'library_student_edit_requests',
    'LibraryRole' => 'library_roles',
    'LibraryFeedback' => 'library_feedback',
];

function ensureDir(string $path): void
{
    if (! is_dir($path)) {
        mkdir($path, 0755, true);
    }
}

function transform(string $content, array $modelMap, array $tableMap, bool $isModel = false): string
{
    $content = str_replace('namespace App\Models;', 'namespace App\\Domain\\Library\\Models;', $content);
    $content = str_replace('namespace App\\Services;', 'namespace App\\Domain\\Library\\Services;', $content);
    $content = str_replace('namespace App\\Support;', 'namespace App\\Domain\\Library\\Support;', $content);
    $content = str_replace('namespace App\\Exports;', 'namespace App\\Domain\\Library\\Exports;', $content);
    $content = str_replace('namespace App\\Mail;', 'namespace App\\Domain\\Library\\Mail;', $content);
    $content = str_replace('namespace App\\Http\\Controllers\\Concerns;', 'namespace App\\Http\\Controllers\\Library\\Concerns;', $content);
    $content = str_replace('namespace App\\Http\\Controllers;', 'namespace App\\Http\\Controllers\\Library;', $content);

    foreach ($modelMap as $old => $new) {
        $content = preg_replace('/use App\\\\Models\\\\'.$old.';/', 'use App\\Domain\\Library\\Models\\'.$new.';', $content);
        $content = preg_replace('/use App\\\\Services\\\\/', 'use App\\Domain\\Library\\Services\\', $content);
        $content = preg_replace('/use App\\\\Support\\\\/', 'use App\\Domain\\Library\\Support\\', $content);
        $content = preg_replace('/use App\\\\Exports\\\\/', 'use App\\Domain\\Library\\Exports\\', $content);
        $content = preg_replace('/use App\\\\Mail\\\\/', 'use App\\Domain\\Library\\Mail\\', $content);
        $content = preg_replace('/\b'.$old.'::/', $new.'::', $content);
        $content = preg_replace('/\b'.$old.'\$/', $new.'$', $content);
        $content = preg_replace('/\('.$old.' /', '('.$new.' ', $content);
        $content = preg_replace('/\?'.$old.' /', '?'.$new.' ', $content);
        $content = preg_replace('/\|'.$old.' /', '|'.$new.' ', $content);
    }

    foreach ($modelMap as $old => $new) {
        $content = preg_replace('/class '.$old.' extends/', 'class '.$new.' extends', $content);
    }

    foreach ($tableMap as $old => $new) {
        $content = str_replace("'{$old}'", "'{$new}'", $content);
        $content = str_replace('"'.$old.'"', '"'.$new.'"', $content);
    }

    $content = str_replace("extends Controller\n{", "extends \\App\\Http\\Controllers\\Controller\n{", $content);
    $content = str_replace('$user->role', '$user->getRoleNames()->first()', $content);
    $content = str_replace("in_array(auth()->user()->role, ['admin', 'staff'], true)", "auth()->user()?->hasAnyRole(['library_admin', 'library_staff'])", $content);
    $content = str_replace("in_array(\$user->getRoleNames()->first(), ['admin', 'staff'], true)", '$user->hasAnyRole([\'library_admin\', \'library_staff\'])', $content);
    $content = str_replace("['admin', 'staff']", "['library_admin', 'library_staff']", $content);
    $content = str_replace("'admin'", "'library_admin'", $content);
    $content = str_replace("'staff'", "'library_staff'", $content);

    return $content;
}

function addTableProperty(string $content, string $class, string $table): string
{
    if (str_contains($content, 'protected $table')) {
        return $content;
    }

    return preg_replace(
        '/(class '.$class.' extends Model\s*\{)/',
        "$1\n    protected \$table = '{$table}';\n",
        $content,
        1
    );
}

// Port models
$modelSources = [
    'Book.php', 'BookLog.php', 'BookMarcField.php', 'BookReservation.php',
    'Student.php', 'Employee.php', 'PendingStudent.php', 'PendingEmployee.php',
    'Program.php', 'ProgramCourse.php', 'Prospectus.php', 'Setting.php',
    'FineSetting.php', 'Holiday.php', 'Ebook.php', 'Room.php', 'RoomReservation.php',
    'CatalogFramework.php', 'CatalogFrameworkField.php', 'MarcField.php',
    'AdminActivity.php', 'StudentEditRequest.php', 'Role.php', 'Feedback.php',
];

$modelsDir = $jmcRoot.'/app/Domain/Library/Models';
ensureDir($modelsDir);

foreach ($modelSources as $file) {
    $src = $usmRoot.'/app/Models/'.$file;
    if (! file_exists($src)) {
        echo "Skip missing model: {$file}\n";

        continue;
    }
    $oldClass = basename($file, '.php');
    $newClass = $modelMap[$oldClass] ?? $oldClass;
    $content = file_get_contents($src);
    $content = transform($content, $modelMap, $tableMap, true);
    if (isset($modelTableMap[$newClass])) {
        $content = addTableProperty($content, $newClass, $modelTableMap[$newClass]);
    }
    file_put_contents($modelsDir.'/'.$newClass.'.php', $content);
    echo "Model: {$newClass}\n";
}

// Port services
$serviceFiles = glob($usmRoot.'/app/Services/*.php');
$servicesDir = $jmcRoot.'/app/Domain/Library/Services';
ensureDir($servicesDir);
$skipServices = ['PatronAttendanceReportService.php', 'AttendanceSessionService.php'];

foreach ($serviceFiles as $src) {
    $base = basename($src);
    if (in_array($base, $skipServices, true)) {
        continue;
    }
    $content = transform(file_get_contents($src), $modelMap, $tableMap);
    file_put_contents($servicesDir.'/'.$base, $content);
    echo "Service: {$base}\n";
}

// Port support
$supportDir = $jmcRoot.'/app/Domain/Library/Support';
ensureDir($supportDir);
foreach (glob($usmRoot.'/app/Support/*.php') as $src) {
    $base = basename($src);
    $content = transform(file_get_contents($src), $modelMap, $tableMap);
    file_put_contents($supportDir.'/'.$base, $content);
    echo "Support: {$base}\n";
}

// Port exports
$exportsDir = $jmcRoot.'/app/Domain/Library/Exports';
ensureDir($exportsDir);
foreach (glob($usmRoot.'/app/Exports/*.php') as $src) {
    $base = basename($src);
    if ($base === 'AttendanceLogsExport.php') {
        continue;
    }
    $content = transform(file_get_contents($src), $modelMap, $tableMap);
    file_put_contents($exportsDir.'/'.$base, $content);
    echo "Export: {$base}\n";
}

// Port mail
$mailDir = $jmcRoot.'/app/Domain/Library/Mail';
ensureDir($mailDir);
foreach (glob($usmRoot.'/app/Mail/*.php') as $src) {
    $content = transform(file_get_contents($src), $modelMap, $tableMap);
    file_put_contents($mailDir.'/'.basename($src), $content);
    echo 'Mail: '.basename($src)."\n";
}

// Port controllers
$controllerNames = [
    'BookController.php', 'BookLogController.php', 'CheckoutController.php',
    'PendingStudentController.php', 'PendingEmployeeController.php',
    'StudentController.php', 'EmployeeController.php',
    'CirculationPolicyController.php', 'FineClearanceController.php',
    'BookReservationController.php', 'RoomController.php', 'RoomReservationController.php',
    'EbookController.php', 'RFIDScanController.php', 'ExportController.php',
    'LibraryHoldingsReportController.php', 'CatalogFrameworkAdminController.php',
    'OpenLibraryCopyCatalogController.php', 'HolidayController.php', 'SMSController.php',
    'ProspectusController.php', 'IdCardController.php', 'EmployeeIdCardController.php',
    'BookImportController.php', 'FeedbackController.php', 'AdminActivityController.php',
    'AccountController.php',
];

$controllersDir = $jmcRoot.'/app/Http/Controllers/Library';
ensureDir($controllersDir);
ensureDir($controllersDir.'/Concerns');

foreach ($controllerNames as $file) {
    $src = $usmRoot.'/app/Http/Controllers/'.$file;
    if (! file_exists($src)) {
        echo "Skip missing controller: {$file}\n";

        continue;
    }
    $content = transform(file_get_contents($src), $modelMap, $tableMap);
    $content = str_replace('use App\\Http\\Controllers\\Concerns\\', 'use App\\Http\\Controllers\\Library\\Concerns\\', $content);
    file_put_contents($controllersDir.'/'.$file, $content);
    echo "Controller: {$file}\n";
}

$concernSrc = $usmRoot.'/app/Http/Controllers/Concerns/ComposesLibraryIdCard.php';
if (file_exists($concernSrc)) {
    $content = transform(file_get_contents($concernSrc), $modelMap, $tableMap);
    file_put_contents($controllersDir.'/Concerns/ComposesLibraryIdCard.php', $content);
    echo "Concern: ComposesLibraryIdCard\n";
}

// Copy config
foreach (['catalog.php', 'marc.php', 'reports.php', 'branding.php'] as $cfg) {
    $src = $usmRoot.'/config/'.$cfg;
    $dst = $jmcRoot.'/config/'.$cfg;
    if (file_exists($src) && ! file_exists($dst)) {
        copy($src, $dst);
        echo "Config: {$cfg}\n";
    }
}

echo "\nPort complete.\n";
