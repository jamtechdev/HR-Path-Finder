<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class HqLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hqLocations = [
            'Seoul',
            'Busan',
            'Incheon',
            'Daegu',
            'Daejeon',
            'Gwangju',
            'Suwon',
            'Ulsan',
            'Changwon',
            'Goyang',
            'Seongnam',
            'Yongin',
            'Bucheon',
            'Ansan',
            'Anyang',
            'Jeonju',
            'Cheonan',
            'Namyangju',
            'Hwaseong',
            'Gimhae',
        ];

        Setting::updateOrCreate(
            ['key' => 'hq_locations'],
            ['value' => json_encode($hqLocations)]
        );

        $this->command->info('HQ Locations seeded successfully!');
        $this->command->info('Total locations: ' . count($hqLocations));
    }
}
