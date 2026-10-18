<?php

namespace Database\Seeders;

use App\Models\AssistanceType;
use Illuminate\Database\Seeder;

class AssistanceTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['Medical Check-up Assistance', 'Help with scheduling and attending check-ups at the barangay or municipal health center.'],
            ['Medicine Purchase Assistance', 'Financial or in-kind help for maintenance medicines such as those for hypertension and diabetes.'],
            ['Food Pack Assistance', 'Delivery of rice, canned goods and other basic food items to senior citizen households.'],
            ['Transportation Assistance', 'Tricycle or vehicle service to hospitals, pension offices and government agencies.'],
            ['Home Repair Assistance', 'Minor repairs for leaking roofs, damaged doors, broken stairs and similar problems.'],
            ['Eyeglasses Assistance', 'Eye check-up and reading glasses for seniors with poor eyesight.'],
            ['Social Pension Application Help', 'Assistance in preparing requirements for the DSWD social pension.'],
            ['Senior Citizen ID Processing', 'Help with OSCA application, photo and documentary requirements.'],
            ['Mobility Aid Assistance', 'Loan or donation of walkers, canes and wheelchairs.'],
            ['Home Visit and Wellness Check', 'Scheduled visit by a barangay health worker or volunteer.'],
        ];

        foreach ($types as [$name, $description]) {
            AssistanceType::factory()->create([
                'name' => $name,
                'description' => $description,
                'is_active' => true,
            ]);
        }
    }
}