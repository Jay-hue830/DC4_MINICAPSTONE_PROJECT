<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin','senior','senior_citizen') NOT NULL DEFAULT 'senior_citizen'");
        }

        DB::table('users')->where('role', 'senior')->update(['role' => 'senior_citizen']);

        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin','senior_citizen') NOT NULL DEFAULT 'senior_citizen'");
        }
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin','senior','senior_citizen') NOT NULL DEFAULT 'senior'");
        }

        DB::table('users')->where('role', 'senior_citizen')->update(['role' => 'senior']);

        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin','senior') NOT NULL DEFAULT 'senior'");
        }
    }
};
