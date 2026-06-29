<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;
use Tests\TestCase;

class RouteCanonicalizationTest extends TestCase
{
    public function test_canonical_module_routes_exist(): void
    {
        foreach ([
            'attendance.dashboard.admin',
            'attendance.dashboard.staff',
            'attendance.students.index',
            'library.dashboard.admin',
            'library.dashboard.staff',
            'library.students.index',
            'library.books.index',
            'library.rooms.index',
            'super-admin.dashboard',
        ] as $routeName) {
            $this->assertTrue(Route::has($routeName), "Route [{$routeName}] is missing.");
        }
    }

    public function test_all_configured_navigation_route_names_exist(): void
    {
        $files = [
            resource_path('js/config/libraryNavigation.ts'),
            resource_path('js/config/attendanceNavigation.ts'),
            resource_path('js/config/superAdminNavigation.ts'),
        ];

        foreach ($files as $file) {
            preg_match_all("/routeName:\\s*['\"]([^'\"]+)['\"]/", file_get_contents($file), $matches);

            foreach ($matches[1] as $routeName) {
                $this->assertTrue(Route::has($routeName), "Navigation route [{$routeName}] in [{$file}] is missing.");
            }
        }
    }

    public function test_routes_do_not_expose_an_empty_module_name(): void
    {
        $this->assertFalse(Route::has('library.'));
        $this->assertFalse(Route::has('attendance.'));
    }

    public function test_no_http_method_and_uri_pair_is_registered_twice(): void
    {
        $seen = [];

        foreach (Route::getRoutes() as $route) {
            foreach (array_diff($route->methods(), ['HEAD']) as $method) {
                $key = $method.' '.$route->uri();
                $existingName = $seen[$key] ?? 'unknown';
                $routeName = $route->getName() ?? 'unnamed';

                $this->assertArrayNotHasKey(
                    $key,
                    $seen,
                    "Route [{$key}] is registered by both [{$existingName}] and [{$routeName}]."
                );

                $seen[$key] = $routeName;
            }
        }
    }

    public function test_literal_route_references_in_active_php_code_resolve(): void
    {
        $files = [];

        foreach ([app_path(), base_path('routes')] as $directory) {
            $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));

            foreach ($iterator as $file) {
                if ($file instanceof SplFileInfo && $file->isFile() && $file->getExtension() === 'php') {
                    $files[] = $file->getPathname();
                }
            }
        }

        foreach ($files as $file) {
            preg_match_all("/(?<!->)\\broute\\(\\s*['\"]([^'\"]+)['\"]/", file_get_contents($file), $matches);

            foreach ($matches[1] as $routeName) {
                $this->assertTrue(Route::has($routeName), "Active route reference [{$routeName}] in [{$file}] is missing.");
            }
        }
    }
}
