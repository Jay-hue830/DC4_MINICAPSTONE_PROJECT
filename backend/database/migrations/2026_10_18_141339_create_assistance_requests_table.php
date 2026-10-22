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
    Schema::create('assistance_requests', function (Blueprint $table) {
        $table->id();
        $table->foreignId('senior_citizen_id')->constrained('senior_citizens')->cascadeOnDelete();
        $table->foreignId('assistance_type_id')->constrained('assistance_types')->restrictOnDelete();
        $table->string('title');
        $table->text('description');
        $table->date('date_needed')->nullable();
        $table->enum('status', [
            'pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled',
        ])->default('pending')->index();
        $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
        $table->timestamp('reviewed_at')->nullable();
        $table->text('admin_remarks')->nullable();
        $table->timestamps();

        $table->index(['senior_citizen_id', 'status']);
        $table->index('date_needed');
    });
}

public function down(): void
{
    Schema::dropIfExists('assistance_requests');
}
};
