<?php

namespace Database\Seeders;

use App\Models\AssistanceRequest;
use App\Models\AssistanceType;
use App\Models\SeniorCitizen;
use App\Models\User;
use Illuminate\Database\Seeder;

class AssistanceRequestSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->firstOrFail();
        $seniors = SeniorCitizen::orderBy('id')->get();
        $types = AssistanceType::pluck('id', 'name');

        // senior index, type name, title, description, days from today for date_needed, status, admin remarks
        $requests = [
            [0, 'Medicine Purchase Assistance', 'Monthly maintenance medicine for hypertension', 'I can no longer afford my monthly amlodipine and losartan because my pension has already been used for utilities.', 7, 'approved', 'Approved. Medicine voucher to be claimed at the municipal health office.'],
            [0, 'Medical Check-up Assistance', 'Blood pressure check-up at the health center', 'I need a schedule for my quarterly blood pressure monitoring and consultation.', 14, 'pending', null],
            [0, 'Food Pack Assistance', 'Food pack for the month of October', 'My household has run out of rice and canned goods until the next pension release.', 5, 'completed', 'Food pack delivered by barangay volunteers.'],
            [1, 'Medical Check-up Assistance', 'Diabetes follow-up check-up', 'My doctor advised a blood sugar test and consultation but I have no one to bring me to the clinic.', 10, 'in_progress', 'Schedule confirmed with the rural health unit.'],
            [1, 'Transportation Assistance', 'Tricycle service to the district hospital', 'I need transportation to the district hospital for my laboratory results.', 12, 'approved', 'Tricycle service arranged through the barangay.'],
            [2, 'Mobility Aid Assistance', 'Request for a walker', 'My cane is no longer enough because my knees are weak and I almost fell last week.', 20, 'pending', null],
            [2, 'Home Visit and Wellness Check', 'Weekly wellness check', 'I live alone and would like a barangay health worker to check on me every week.', 8, 'approved', 'Assigned to the barangay health worker for weekly visits.'],
            [3, 'Eyeglasses Assistance', 'Reading glasses replacement', 'My reading glasses broke and I can no longer read the labels on my medicine.', 18, 'approved', 'Referred to the partner optical clinic for an eye exam.'],
            [3, 'Social Pension Application Help', 'Help completing social pension requirements', 'I need help with the forms and documents for the DSWD social pension.', 9, 'pending', null],
            [4, 'Senior Citizen ID Processing', 'New senior citizen ID application', 'I recently turned 60 and need help applying for my OSCA ID.', 6, 'completed', 'ID processed and released at the OSCA office.'],
            [4, 'Food Pack Assistance', 'Food pack for the household', 'My husband and I rely on a small pension and need help with basic groceries.', 15, 'rejected', 'Household already received a food pack this month. Please apply again next month.'],
            [5, 'Home Repair Assistance', 'Repair of leaking roof', 'The roof above my bedroom leaks whenever it rains and the floor stays wet.', 30, 'pending', null],
            [5, 'Mobility Aid Assistance', 'Wheelchair loan after stroke', 'I need a wheelchair for short trips outside the house while I recover.', 11, 'approved', 'Wheelchair loan approved. Please claim at the barangay hall.'],
            [6, 'Home Repair Assistance', 'Handrail for the stairs', 'Because of my arthritis, I need a handrail on the stairs of my house.', 25, 'in_progress', 'Materials purchased. Repair scheduled with barangay maintenance staff.'],
            [6, 'Medicine Purchase Assistance', 'Pain relief and arthritis medicine', 'I need help buying my arthritis medicine this month.', 4, 'approved', 'Approved. Medicine to be released by the health center.'],
            [7, 'Transportation Assistance', 'Transport to the pension office', 'I need transportation to claim my social pension at the municipal hall.', 3, 'completed', 'Transport provided on the requested date.'],
            [7, 'Medical Check-up Assistance', 'General check-up request', 'I have been feeling dizzy lately and would like a check-up.', 13, 'pending', null],
            [8, 'Medicine Purchase Assistance', 'Insulin and diabetes supplies', 'I need help paying for insulin and test strips for this month.', 6, 'approved', 'Approved. Please bring your prescription when claiming.'],
            [8, 'Home Visit and Wellness Check', 'Home visit for blood sugar monitoring', 'I would like a health worker to check my blood sugar at home twice a month.', 16, 'pending', null],
            [9, 'Mobility Aid Assistance', 'Hearing and mobility support evaluation', 'I have difficulty hearing and moving around and would like to be assessed for any available support.', 22, 'cancelled', 'Cancelled at the request of the senior citizen.'],
            [9, 'Social Pension Application Help', 'Social pension document assistance', 'I do not have a birth certificate on hand and need help getting a copy for my application.', 17, 'rejected', 'Incomplete requirements. Please submit a barangay certificate of indigency and reapply.'],
            [10, 'Eyeglasses Assistance', 'Eye check-up and new glasses', 'My vision has become blurry and I cannot read the Bible anymore.', 19, 'pending', null],
            [11, 'Mobility Aid Assistance', 'Wheelchair repair', 'The wheel of my wheelchair is loose and the brake no longer works.', 9, 'in_progress', 'Referred to the municipal engineering office for repair.'],
            [11, 'Food Pack Assistance', 'Food pack and hygiene kit', 'I live with my son who has no regular income and we need help with basic supplies.', 7, 'approved', 'Approved for delivery this week.'],
        ];

        foreach ($requests as [$index, $typeName, $title, $description, $days, $status, $remarks]) {
            $reviewed = in_array($status, ['approved', 'rejected', 'in_progress', 'completed', 'cancelled'], true) && $remarks !== null;

            AssistanceRequest::factory()->create([
                'senior_citizen_id' => $seniors[$index]->id,
                'assistance_type_id' => $types[$typeName],
                'title' => $title,
                'description' => $description,
                'date_needed' => now()->addDays($days)->toDateString(),
                'status' => $status,
                'reviewed_by' => $reviewed ? $admin->id : null,
                'reviewed_at' => $reviewed ? now()->subDays(rand(1, 5)) : null,
                'admin_remarks' => $remarks,
            ]);
        }
    }
}