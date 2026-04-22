<?php

use App\Models\User;
use App\Services\TranslationService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

function makeAdminUser(): User
{
    Role::findOrCreate('admin', 'web');

    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

test('admin can export translations csv when search filter is missing', function () {
    $this->mock(TranslationService::class, function ($mock): void {
        $mock->shouldReceive('getFlatTranslations')
            ->once()
            ->with('en', 'all')
            ->andReturn([
                'admin_ui.header.app_name' => 'HR Path-Finder',
            ]);

        $mock->shouldReceive('getFlatTranslations')
            ->once()
            ->with('ko', 'all')
            ->andReturn([
                'admin_ui.header.app_name' => 'HR 패스파인더',
            ]);
    });

    $admin = makeAdminUser();

    $response = $this
        ->actingAs($admin)
        ->get('/admin/translations/export?page=all&role=all&searchMode=contains&status=all');

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    expect($response->streamedContent())->toContain('key,en,ko');
    expect($response->streamedContent())->toContain('admin_ui.header.app_name');
});

test('admin can import csv with utf8 bom header', function () {
    Storage::fake('local');

    $this->mock(TranslationService::class, function ($mock): void {
        $mock->shouldReceive('getTranslations')
            ->once()
            ->with('en')
            ->andReturn([]);

        $mock->shouldReceive('getTranslations')
            ->once()
            ->with('ko')
            ->andReturn([]);

        $mock->shouldReceive('saveTranslations')
            ->once()
            ->withArgs(function (string $locale, array $translations): bool {
                return $locale === 'en'
                    && data_get($translations, 'admin.sample') === 'Hello';
            })
            ->andReturn(true);

        $mock->shouldReceive('saveTranslations')
            ->once()
            ->withArgs(function (string $locale, array $translations): bool {
                return $locale === 'ko'
                    && data_get($translations, 'admin.sample') === '안녕하세요';
            })
            ->andReturn(true);
    });

    $admin = makeAdminUser();
    $csv = "\xEF\xBB\xBFkey,en,ko\nadmin.sample,Hello,안녕하세요\n";
    $file = UploadedFile::fake()->createWithContent('translations.csv', $csv);

    $response = $this
        ->actingAs($admin)
        ->from('/admin/translations')
        ->post('/admin/translations/import', [
            'file' => $file,
        ]);

    $response->assertRedirect('/admin/translations');
    $response->assertSessionHas('success', 'Imported 1 translation rows successfully.');
});
