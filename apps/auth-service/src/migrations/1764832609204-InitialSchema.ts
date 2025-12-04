import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1764832609204 implements MigrationInterface {
    name = 'InitialSchema1764832609204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL DEFAULT '1', "user_id" uuid NOT NULL, "device_id" character varying(255) NOT NULL, "refresh_token" text NOT NULL, "access_token" text NOT NULL, "ip_address" character varying(45), "user_agent" text, "is_active" boolean NOT NULL DEFAULT true, "expires_at" TIMESTAMP NOT NULL, "last_activity_at" TIMESTAMP NOT NULL DEFAULT now(), "revoked_at" TIMESTAMP, "revoke_reason" character varying(100), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_085d540d9f418cfbdc7bd55bb1" ON "sessions" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_97207844c19e5c27d33a07f67c" ON "sessions" ("device_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_988b9e434a536256a4fee3ad68" ON "sessions" ("user_id", "is_active") `);
        await queryRunner.query(`CREATE TABLE "otp_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL DEFAULT '1', "identifier" character varying(100) NOT NULL, "identifier_type" character varying(20) NOT NULL, "code" character varying(10) NOT NULL, "purpose" character varying(50) NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "used_at" TIMESTAMP, "expires_at" TIMESTAMP NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "max_attempts" integer NOT NULL DEFAULT '3', "ip_address" character varying(45), "device_id" character varying(255), CONSTRAINT "PK_9d0487965ac1837d57fec4d6a26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_84d7e405419825d034a7ef8dd3" ON "otp_codes" ("identifier") `);
        await queryRunner.query(`CREATE INDEX "IDX_aadae2308743356080b6eb601f" ON "otp_codes" ("identifier", "is_used", "expires_at") `);
        await queryRunner.query(`CREATE TABLE "device_info" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL DEFAULT '1', "user_id" uuid NOT NULL, "device_id" character varying(255) NOT NULL, "device_name" character varying(255), "device_type" character varying(50), "os" character varying(100), "os_version" character varying(50), "browser" character varying(100), "browser_version" character varying(50), "user_agent" text, "ip_address" character varying(45) NOT NULL, "fingerprint" character varying(64) NOT NULL, "is_trusted" boolean NOT NULL DEFAULT false, "is_blocked" boolean NOT NULL DEFAULT false, "first_seen_at" TIMESTAMP NOT NULL DEFAULT now(), "last_seen_at" TIMESTAMP NOT NULL DEFAULT now(), "login_count" integer NOT NULL DEFAULT '0', "blocked_reason" text, CONSTRAINT "UQ_dc4c35ccb907ba491f3c63b7943" UNIQUE ("device_id"), CONSTRAINT "PK_b1c15a80b0a4e5f4eebadbdd92c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_40046da05ce30934e24c0f0cb0" ON "device_info" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_14f2b6ccd22b3365b3776aaa43" ON "device_info" ("fingerprint") `);
        await queryRunner.query(`CREATE INDEX "IDX_dc4c35ccb907ba491f3c63b794" ON "device_info" ("device_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1b0dff85b051fce174e0f646e5" ON "device_info" ("user_id", "is_trusted") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_1b0dff85b051fce174e0f646e5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dc4c35ccb907ba491f3c63b794"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_14f2b6ccd22b3365b3776aaa43"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_40046da05ce30934e24c0f0cb0"`);
        await queryRunner.query(`DROP TABLE "device_info"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aadae2308743356080b6eb601f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_84d7e405419825d034a7ef8dd3"`);
        await queryRunner.query(`DROP TABLE "otp_codes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_988b9e434a536256a4fee3ad68"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97207844c19e5c27d33a07f67c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_085d540d9f418cfbdc7bd55bb1"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
    }

}
