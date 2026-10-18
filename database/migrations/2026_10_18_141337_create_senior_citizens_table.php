<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('senior_citizens', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
        $table->string('first_name');
        $table->string('middle_name')->nullable();
        $table->string('last_name');
        $table->date('birth_date');
        $table->enum('sex', ['male', 'female'])->nullable();
        $table->string('contact_number', 20)->nullable();
        $table->string('address');
        $table->string('barangay')->nullable()->index();
        $table->string('emergency_contact_name')->nullable();
        $table->string('emergency_contact_number', 20)->nullable();
        $table->text('health_notes')->nullable();
        $table->timestamps();

        $table->index(['last_name', 'first_name']);
    });
}

public function down(): void
{
    Schema::dropIfExists('senior_citizens');
}
};