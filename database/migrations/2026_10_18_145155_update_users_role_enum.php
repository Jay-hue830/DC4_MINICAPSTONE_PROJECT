<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin','senior','senior_citizen') NOT NULL DEFAULT 'senior_citizen'");
        DB::table('users')->where('role', 'senior')->update(['role' => 'senior_citizen']);
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin','senior_citizen') NOT NULL DEFAULT 'senior_citizen'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin','senior','senior_citizen') NOT NULL DEFAULT 'senior'");
        DB::table('users')->where('role', 'senior_citizen')->update(['role' => 'senior']);
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin','senior') NOT NULL DEFAULT 'senior'");
    }
};