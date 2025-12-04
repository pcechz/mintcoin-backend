import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1764832618166 implements MigrationInterface {
    name = 'InitialSchema1764832618166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types for user status, lifecycle, and KYC
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('pending_setup', 'active', 'verified_creator', 'payout_enabled', 'suspended', 'banned')`);
        await queryRunner.query(`CREATE TYPE "public"."users_lifecycle_state_enum" AS ENUM('new_user', 'warm_user', 'engaged', 'creator', 'high_value_spender', 'dormant', 'churned')`);
        await queryRunner.query(`CREATE TYPE "public"."users_kyc_status_enum" AS ENUM('not_started', 'pending', 'under_review', 'verified', 'failed', 'rejected')`);
        await queryRunner.query(`CREATE TYPE "public"."users_kyc_tier_enum" AS ENUM('tier_0', 'tier_1', 'tier_2')`);

        // Create users table with all fields
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL DEFAULT '1', "phone" character varying(20), "email" character varying(255), "phone_verified" boolean NOT NULL DEFAULT false, "email_verified" boolean NOT NULL DEFAULT false, "username" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "avatar_url" text, "bio" text, "gender" character varying(20), "age_bracket" character varying(20), "date_of_birth" date, "location" character varying(255), "interests" json, "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending_setup', "lifecycle_state" "public"."users_lifecycle_state_enum" NOT NULL DEFAULT 'new_user', "is_creator" boolean NOT NULL DEFAULT false, "is_suspended" boolean NOT NULL DEFAULT false, "is_banned" boolean NOT NULL DEFAULT false, "suspended_at" TIMESTAMP, "suspended_until" TIMESTAMP, "suspended_reason" text, "banned_at" TIMESTAMP, "banned_reason" text, "kyc_status" "public"."users_kyc_status_enum" NOT NULL DEFAULT 'not_started', "kyc_tier" "public"."users_kyc_tier_enum" NOT NULL DEFAULT 'tier_0', "kyc_verified_at" TIMESTAMP, "can_earn" boolean NOT NULL DEFAULT false, "can_withdraw" boolean NOT NULL DEFAULT false, "referral_code" character varying(20) NOT NULL, "referred_by_code" character varying(20), "referred_by_user_id" uuid, "last_active_at" TIMESTAMP, "last_login_at" TIMESTAMP, "login_count" integer NOT NULL DEFAULT '0', "profile_completion_percent" integer NOT NULL DEFAULT '0', "device_id" character varying(255), "ip_address" character varying(45), "registration_source" character varying(50), "metadata" json, CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_ba10055f9ef9690e77cf6445cba" UNIQUE ("referral_code"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);

        // Create indexes for frequently queried fields (removing duplicates)
        await queryRunner.query(`CREATE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `);
        await queryRunner.query(`CREATE INDEX "IDX_ba10055f9ef9690e77cf6445cb" ON "users" ("referral_code") `);
        await queryRunner.query(`CREATE INDEX "IDX_3676155292d72c67cd4e090514" ON "users" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_a000cca60bcf04454e72769949" ON "users" ("phone") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes (in reverse order)
        await queryRunner.query(`DROP INDEX "public"."IDX_a000cca60bcf04454e72769949"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3676155292d72c67cd4e090514"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ba10055f9ef9690e77cf6445cb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"`);

        // Drop users table
        await queryRunner.query(`DROP TABLE "users"`);

        // Drop enum types
        await queryRunner.query(`DROP TYPE "public"."users_kyc_tier_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_kyc_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_lifecycle_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    }

}
