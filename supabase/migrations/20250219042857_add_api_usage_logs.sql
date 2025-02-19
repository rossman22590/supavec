create table "public"."api_usage_logs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "endpoint" text not null,
    "user_id" uuid,
    "success" boolean not null,
    "error" text
);


alter table "public"."api_usage_logs" enable row level security;

CREATE UNIQUE INDEX api_usage_logs_pkey ON public.api_usage_logs USING btree (id);

alter table "public"."api_usage_logs" add constraint "api_usage_logs_pkey" PRIMARY KEY using index "api_usage_logs_pkey";

alter table "public"."api_usage_logs" add constraint "api_usage_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) not valid;

alter table "public"."api_usage_logs" validate constraint "api_usage_logs_user_id_fkey";

grant delete on table "public"."api_usage_logs" to "anon";

grant insert on table "public"."api_usage_logs" to "anon";

grant references on table "public"."api_usage_logs" to "anon";

grant select on table "public"."api_usage_logs" to "anon";

grant trigger on table "public"."api_usage_logs" to "anon";

grant truncate on table "public"."api_usage_logs" to "anon";

grant update on table "public"."api_usage_logs" to "anon";

grant delete on table "public"."api_usage_logs" to "authenticated";

grant insert on table "public"."api_usage_logs" to "authenticated";

grant references on table "public"."api_usage_logs" to "authenticated";

grant select on table "public"."api_usage_logs" to "authenticated";

grant trigger on table "public"."api_usage_logs" to "authenticated";

grant truncate on table "public"."api_usage_logs" to "authenticated";

grant update on table "public"."api_usage_logs" to "authenticated";

grant delete on table "public"."api_usage_logs" to "service_role";

grant insert on table "public"."api_usage_logs" to "service_role";

grant references on table "public"."api_usage_logs" to "service_role";

grant select on table "public"."api_usage_logs" to "service_role";

grant trigger on table "public"."api_usage_logs" to "service_role";

grant truncate on table "public"."api_usage_logs" to "service_role";

grant update on table "public"."api_usage_logs" to "service_role";

