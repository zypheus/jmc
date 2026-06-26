<?php

namespace App\Providers;

use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibraryCatalogFramework;
use App\Domain\Library\Models\LibraryProgram;
use App\Domain\Library\Models\LibraryProgramCourse;
use App\Support\LibraryViewAliases;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Route::model('book', LibraryBook::class);
        Route::model('bookLog', LibraryBookLog::class);
        Route::model('catalog_framework', LibraryCatalogFramework::class);
        Route::model('program', LibraryProgram::class);
        Route::model('course', LibraryProgramCourse::class);

        View::composer([
            'books.*',
            'students.*',
            'employees.*',
            'ebooks.*',
            'pending.*',
            'reports.*',
            'catalog.*',
            'prospectus.*',
        ], function ($view): void {
            $view->with(LibraryViewAliases::apply($view->getData()));
        });
    }
}
