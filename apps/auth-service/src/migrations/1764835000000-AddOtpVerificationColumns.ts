import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOtpVerificationColumns1764835000000 implements MigrationInterface {
    name = 'AddOtpVerificationColumns1764835000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp_codes" ADD "is_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "otp_codes" ADD "verified_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "otp_codes" ADD "verification_token" character varying(128)`);
        await queryRunner.query(`CREATE INDEX "IDX_otp_verification_token" ON "otp_codes" ("verification_token")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_otp_verification_token"`);
        await queryRunner.query(`ALTER TABLE "otp_codes" DROP COLUMN "verification_token"`);
        await queryRunner.query(`ALTER TABLE "otp_codes" DROP COLUMN "verified_at"`);
        await queryRunner.query(`ALTER TABLE "otp_codes" DROP COLUMN "is_verified"`);
    }

}
