<?php

namespace Database\Seeders;

use App\Models\IndustryCategory;
use App\Models\IndustrySubCategory;
use Illuminate\Database\Seeder;

class IndustrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $industries = [
            [
                'name' => 'Technology',
                'order' => 1,
                'sub_categories' => [
                    ['name' => 'Software Development', 'order' => 1],
                    ['name' => 'IT Services', 'order' => 2],
                    ['name' => 'Hardware Manufacturing', 'order' => 3],
                    ['name' => 'Telecommunications', 'order' => 4],
                    ['name' => 'E-commerce', 'order' => 5],
                ],
            ],
            [
                'name' => 'Manufacturing',
                'order' => 2,
                'sub_categories' => [
                    ['name' => 'Electronics', 'order' => 1],
                    ['name' => 'Automotive', 'order' => 2],
                    ['name' => 'Semiconductors', 'order' => 3],
                    ['name' => 'Textiles', 'order' => 4],
                    ['name' => 'Food & Beverage', 'order' => 5],
                ],
            ],
            [
                'name' => 'Healthcare',
                'order' => 3,
                'sub_categories' => [
                    ['name' => 'Hospitals', 'order' => 1],
                    ['name' => 'Pharmaceuticals', 'order' => 2],
                    ['name' => 'Medical Devices', 'order' => 3],
                    ['name' => 'Biotechnology', 'order' => 4],
                ],
            ],
            [
                'name' => 'Finance',
                'order' => 4,
                'sub_categories' => [
                    ['name' => 'Banking', 'order' => 1],
                    ['name' => 'Insurance', 'order' => 2],
                    ['name' => 'Investment Services', 'order' => 3],
                    ['name' => 'Fintech', 'order' => 4],
                ],
            ],
            [
                'name' => 'Retail',
                'order' => 5,
                'sub_categories' => [
                    ['name' => 'Department Stores', 'order' => 1],
                    ['name' => 'Specialty Retail', 'order' => 2],
                    ['name' => 'Online Retail', 'order' => 3],
                ],
            ],
            [
                'name' => 'Consulting',
                'order' => 6,
                'sub_categories' => [
                    ['name' => 'Management Consulting', 'order' => 1],
                    ['name' => 'IT Consulting', 'order' => 2],
                    ['name' => 'HR Consulting', 'order' => 3],
                ],
            ],
            [
                'name' => 'Education',
                'order' => 7,
                'sub_categories' => [
                    ['name' => 'K-12 Education', 'order' => 1],
                    ['name' => 'Higher Education', 'order' => 2],
                    ['name' => 'Vocational Training', 'order' => 3],
                ],
            ],
            [
                'name' => 'Real Estate',
                'order' => 8,
                'sub_categories' => [
                    ['name' => 'Residential', 'order' => 1],
                    ['name' => 'Commercial', 'order' => 2],
                    ['name' => 'Property Management', 'order' => 3],
                ],
            ],
            [
                'name' => 'Services',
                'order' => 9,
                'sub_categories' => [
                    ['name' => 'Professional Services', 'order' => 1],
                    ['name' => 'Customer Service', 'order' => 2],
                    ['name' => 'Maintenance Services', 'order' => 3],
                    ['name' => 'Logistics Services', 'order' => 4],
                ],
            ],
        ];

        foreach ($industries as $industryData) {
            $subCategories = $industryData['sub_categories'];
            unset($industryData['sub_categories']);

            $category = IndustryCategory::create($industryData);

            foreach ($subCategories as $subCategoryData) {
                IndustrySubCategory::create([
                    'industry_category_id' => $category->id,
                    'name' => $subCategoryData['name'],
                    'order' => $subCategoryData['order'],
                ]);
            }
        }
    }
}
