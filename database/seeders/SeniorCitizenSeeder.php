<?php

namespace Database\Seeders;

use App\Models\SeniorCitizen;
use App\Models\User;
use Illuminate\Database\Seeder;

class SeniorCitizenSeeder extends Seeder
{
    public function run(): void
    {
        $seniors = [
            // first_name, middle, last, birth_date, sex, address, barangay, contact, emergency name, emergency number, health notes, email
            ['Lolita', 'Dela Cruz', 'Santos', '1953-03-14', 'female', 'Purok 3, Rizal St.', 'San Roque', '09171234501', 'Maricel Santos', '09171234502', 'Maintenance medicine for hypertension', 'lolita.santos@seniorcare.test'],
            ['Rodolfo', 'Ramos', 'Villanueva', '1948-07-02', 'male', 'Zone 2, Mabini St.', 'Poblacion', '09181234503', 'Jonathan Villanueva', '09181234504', 'Diabetic, needs regular check-ups', 'rodolfo.villanueva@seniorcare.test'],
            ['Remedios', 'Pascual', 'Aquino', '1950-11-23', 'female', 'Purok 5, Bonifacio St.', 'Santa Cruz', '09191234505', 'Cherry Ann Aquino', '09191234506', 'Uses a cane when walking', 'remedios.aquino@seniorcare.test'],
            ['Ernesto', 'Flores', 'Bautista', '1945-01-30', 'male', 'Sitio Mabini', 'San Isidro', '09201234507', 'Mark Anthony Bautista', '09201234508', 'Poor eyesight, wears reading glasses', 'ernesto.bautista@seniorcare.test'],
            ['Corazon', 'Navarro', 'Mendoza', '1956-09-18', 'female', 'Purok 1, Luna St.', 'Bagong Silang', '09211234509', 'Rizza Mendoza', '09211234510', null, 'corazon.mendoza@seniorcare.test'],
            ['Fernando', 'Garcia', 'Castillo', '1951-05-06', 'male', 'Zone 4, Rizal St.', 'Poblacion', '09221234511', 'Alvin Castillo', '09221234512', 'History of mild stroke, limited mobility', 'fernando.castillo@seniorcare.test'],
            ['Felicidad', 'Cruz', 'Domingo', '1947-12-09', 'female', 'Purok 2, Mabini St.', 'San Roque', '09231234513', 'Michelle Domingo', '09231234514', 'Arthritis, difficulty climbing stairs', 'felicidad.domingo@seniorcare.test'],
            ['Domingo', 'Torres', 'Reyes', '1949-04-21', 'male', 'Sitio Riverside', 'Santa Cruz', '09241234515', 'Joel Reyes', '09241234516', null, 'domingo.reyes@seniorcare.test'],
            ['Natividad', 'Salazar', 'Panganiban', '1954-08-27', 'female', 'Purok 6, Luna St.', 'San Isidro', '09251234517', 'Kristine Panganiban', '09251234518', 'Maintenance medicine for diabetes', 'natividad.panganiban@seniorcare.test'],
            ['Alfredo', 'Lim', 'Hernandez', '1946-02-11', 'male', 'Zone 1, Bonifacio St.', 'Bagong Silang', '09261234519', 'Gemma Hernandez', '09261234520', 'Hard of hearing', 'alfredo.hernandez@seniorcare.test'],
            ['Consolacion', 'Abad', 'Magsaysay', '1952-06-15', 'female', 'Purok 4, Rizal St.', 'Poblacion', '09271234521', 'Ronnie Magsaysay', '09271234522', 'Wears reading glasses', 'consolacion.magsaysay@seniorcare.test'],
            ['Romeo', 'Tan', 'Gonzales', '1944-10-03', 'male', 'Sitio Mabini', 'San Roque', '09281234523', 'Lea Gonzales', '09281234524', 'Uses a wheelchair', 'romeo.gonzales@seniorcare.test'],
        ];

        foreach ($seniors as [$first, $middle, $last, $birth, $sex, $address, $barangay, $contact, $emName, $emNumber, $notes, $email]) {
            $user = User::factory()->senior()->create([
                'name' => "$first $last",
                'email' => $email,
                'password' => 'Senior#2026',
            ]);

            SeniorCitizen::factory()->create([
                'user_id' => $user->id,
                'first_name' => $first,
                'middle_name' => $middle,
                'last_name' => $last,
                'birth_date' => $birth,
                'sex' => $sex,
                'address' => $address,
                'barangay' => $barangay,
                'contact_number' => $contact,
                'emergency_contact_name' => $emName,
                'emergency_contact_number' => $emNumber,
                'health_notes' => $notes,
            ]);
        }
    }
}