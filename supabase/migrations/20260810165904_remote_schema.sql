drop extension if exists "pg_net";

grant delete on table "public"."accounts" to "service_role";

grant insert on table "public"."accounts" to "service_role";

grant select on table "public"."accounts" to "service_role";

grant update on table "public"."accounts" to "service_role";

grant delete on table "public"."addresses" to "service_role";

grant insert on table "public"."addresses" to "service_role";

grant select on table "public"."addresses" to "service_role";

grant update on table "public"."addresses" to "service_role";

grant delete on table "public"."contact_submission_replies" to "service_role";

grant insert on table "public"."contact_submission_replies" to "service_role";

grant select on table "public"."contact_submission_replies" to "service_role";

grant update on table "public"."contact_submission_replies" to "service_role";

grant delete on table "public"."contact_submissions" to "service_role";

grant insert on table "public"."contact_submissions" to "service_role";

grant select on table "public"."contact_submissions" to "service_role";

grant update on table "public"."contact_submissions" to "service_role";

grant delete on table "public"."customer_addresses" to "service_role";

grant insert on table "public"."customer_addresses" to "service_role";

grant select on table "public"."customer_addresses" to "service_role";

grant update on table "public"."customer_addresses" to "service_role";

grant delete on table "public"."customers" to "service_role";

grant insert on table "public"."customers" to "service_role";

grant select on table "public"."customers" to "service_role";

grant update on table "public"."customers" to "service_role";

grant delete on table "public"."feedback_issue_replies" to "service_role";

grant insert on table "public"."feedback_issue_replies" to "service_role";

grant select on table "public"."feedback_issue_replies" to "service_role";

grant update on table "public"."feedback_issue_replies" to "service_role";

grant delete on table "public"."feedback_issues" to "service_role";

grant insert on table "public"."feedback_issues" to "service_role";

grant select on table "public"."feedback_issues" to "service_role";

grant update on table "public"."feedback_issues" to "service_role";

grant delete on table "public"."files" to "service_role";

grant insert on table "public"."files" to "service_role";

grant select on table "public"."files" to "service_role";

grant update on table "public"."files" to "service_role";

grant delete on table "public"."invitations" to "service_role";

grant insert on table "public"."invitations" to "service_role";

grant select on table "public"."invitations" to "service_role";

grant update on table "public"."invitations" to "service_role";

grant delete on table "public"."job_addresses" to "service_role";

grant insert on table "public"."job_addresses" to "service_role";

grant select on table "public"."job_addresses" to "service_role";

grant update on table "public"."job_addresses" to "service_role";

grant delete on table "public"."job_categories" to "service_role";

grant insert on table "public"."job_categories" to "service_role";

grant select on table "public"."job_categories" to "service_role";

grant update on table "public"."job_categories" to "service_role";

grant delete on table "public"."job_category_joins" to "service_role";

grant insert on table "public"."job_category_joins" to "service_role";

grant select on table "public"."job_category_joins" to "service_role";

grant update on table "public"."job_category_joins" to "service_role";

grant delete on table "public"."job_materials" to "service_role";

grant insert on table "public"."job_materials" to "service_role";

grant select on table "public"."job_materials" to "service_role";

grant update on table "public"."job_materials" to "service_role";

grant delete on table "public"."job_schedule_assignments" to "service_role";

grant insert on table "public"."job_schedule_assignments" to "service_role";

grant select on table "public"."job_schedule_assignments" to "service_role";

grant update on table "public"."job_schedule_assignments" to "service_role";

grant delete on table "public"."job_schedules" to "service_role";

grant insert on table "public"."job_schedules" to "service_role";

grant select on table "public"."job_schedules" to "service_role";

grant update on table "public"."job_schedules" to "service_role";

grant delete on table "public"."job_time_entries" to "service_role";

grant insert on table "public"."job_time_entries" to "service_role";

grant select on table "public"."job_time_entries" to "service_role";

grant update on table "public"."job_time_entries" to "service_role";

grant delete on table "public"."jobs" to "service_role";

grant insert on table "public"."jobs" to "service_role";

grant select on table "public"."jobs" to "service_role";

grant update on table "public"."jobs" to "service_role";

grant delete on table "public"."lead_addresses" to "service_role";

grant insert on table "public"."lead_addresses" to "service_role";

grant select on table "public"."lead_addresses" to "service_role";

grant update on table "public"."lead_addresses" to "service_role";

grant delete on table "public"."lead_attachments" to "service_role";

grant insert on table "public"."lead_attachments" to "service_role";

grant select on table "public"."lead_attachments" to "service_role";

grant update on table "public"."lead_attachments" to "service_role";

grant delete on table "public"."lead_categories" to "service_role";

grant insert on table "public"."lead_categories" to "service_role";

grant select on table "public"."lead_categories" to "service_role";

grant update on table "public"."lead_categories" to "service_role";

grant delete on table "public"."lead_category_joins" to "service_role";

grant insert on table "public"."lead_category_joins" to "service_role";

grant select on table "public"."lead_category_joins" to "service_role";

grant update on table "public"."lead_category_joins" to "service_role";

grant delete on table "public"."lead_estimate_materials" to "service_role";

grant insert on table "public"."lead_estimate_materials" to "service_role";

grant select on table "public"."lead_estimate_materials" to "service_role";

grant update on table "public"."lead_estimate_materials" to "service_role";

grant delete on table "public"."lead_estimates" to "service_role";

grant insert on table "public"."lead_estimates" to "service_role";

grant select on table "public"."lead_estimates" to "service_role";

grant update on table "public"."lead_estimates" to "service_role";

grant delete on table "public"."lead_notes" to "service_role";

grant insert on table "public"."lead_notes" to "service_role";

grant select on table "public"."lead_notes" to "service_role";

grant update on table "public"."lead_notes" to "service_role";

grant delete on table "public"."lead_revenue_history" to "service_role";

grant insert on table "public"."lead_revenue_history" to "service_role";

grant select on table "public"."lead_revenue_history" to "service_role";

grant update on table "public"."lead_revenue_history" to "service_role";

grant delete on table "public"."leads" to "service_role";

grant insert on table "public"."leads" to "service_role";

grant select on table "public"."leads" to "service_role";

grant update on table "public"."leads" to "service_role";

grant delete on table "public"."material_files" to "service_role";

grant insert on table "public"."material_files" to "service_role";

grant select on table "public"."material_files" to "service_role";

grant update on table "public"."material_files" to "service_role";

grant delete on table "public"."materials" to "service_role";

grant insert on table "public"."materials" to "service_role";

grant select on table "public"."materials" to "service_role";

grant update on table "public"."materials" to "service_role";

grant delete on table "public"."notification_settings" to "service_role";

grant insert on table "public"."notification_settings" to "service_role";

grant select on table "public"."notification_settings" to "service_role";

grant update on table "public"."notification_settings" to "service_role";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."org_addresses" to "service_role";

grant insert on table "public"."org_addresses" to "service_role";

grant select on table "public"."org_addresses" to "service_role";

grant update on table "public"."org_addresses" to "service_role";

grant delete on table "public"."org_member_roles" to "service_role";

grant insert on table "public"."org_member_roles" to "service_role";

grant select on table "public"."org_member_roles" to "service_role";

grant update on table "public"."org_member_roles" to "service_role";

grant delete on table "public"."org_role_members" to "service_role";

grant insert on table "public"."org_role_members" to "service_role";

grant select on table "public"."org_role_members" to "service_role";

grant update on table "public"."org_role_members" to "service_role";

grant delete on table "public"."org_role_permissions" to "service_role";

grant insert on table "public"."org_role_permissions" to "service_role";

grant select on table "public"."org_role_permissions" to "service_role";

grant update on table "public"."org_role_permissions" to "service_role";

grant delete on table "public"."org_roles" to "service_role";

grant insert on table "public"."org_roles" to "service_role";

grant select on table "public"."org_roles" to "service_role";

grant update on table "public"."org_roles" to "service_role";

grant delete on table "public"."org_tasks" to "service_role";

grant insert on table "public"."org_tasks" to "service_role";

grant select on table "public"."org_tasks" to "service_role";

grant update on table "public"."org_tasks" to "service_role";

grant delete on table "public"."org_team_members" to "service_role";

grant insert on table "public"."org_team_members" to "service_role";

grant select on table "public"."org_team_members" to "service_role";

grant update on table "public"."org_team_members" to "service_role";

grant delete on table "public"."org_teams" to "service_role";

grant insert on table "public"."org_teams" to "service_role";

grant select on table "public"."org_teams" to "service_role";

grant update on table "public"."org_teams" to "service_role";

grant delete on table "public"."organization_members" to "service_role";

grant insert on table "public"."organization_members" to "service_role";

grant select on table "public"."organization_members" to "service_role";

grant update on table "public"."organization_members" to "service_role";

grant delete on table "public"."organizations" to "service_role";

grant insert on table "public"."organizations" to "service_role";

grant select on table "public"."organizations" to "service_role";

grant update on table "public"."organizations" to "service_role";

grant delete on table "public"."permissions" to "service_role";

grant insert on table "public"."permissions" to "service_role";

grant select on table "public"."permissions" to "service_role";

grant update on table "public"."permissions" to "service_role";

grant delete on table "public"."push_subscriptions" to "service_role";

grant insert on table "public"."push_subscriptions" to "service_role";

grant select on table "public"."push_subscriptions" to "service_role";

grant update on table "public"."push_subscriptions" to "service_role";

grant delete on table "public"."role_permissions" to "service_role";

grant insert on table "public"."role_permissions" to "service_role";

grant select on table "public"."role_permissions" to "service_role";

grant update on table "public"."role_permissions" to "service_role";

grant delete on table "public"."roles" to "service_role";

grant insert on table "public"."roles" to "service_role";

grant select on table "public"."roles" to "service_role";

grant update on table "public"."roles" to "service_role";

grant delete on table "public"."sessions" to "service_role";

grant insert on table "public"."sessions" to "service_role";

grant select on table "public"."sessions" to "service_role";

grant update on table "public"."sessions" to "service_role";

grant delete on table "public"."tasks" to "service_role";

grant insert on table "public"."tasks" to "service_role";

grant select on table "public"."tasks" to "service_role";

grant update on table "public"."tasks" to "service_role";

grant delete on table "public"."user_activities" to "service_role";

grant insert on table "public"."user_activities" to "service_role";

grant select on table "public"."user_activities" to "service_role";

grant update on table "public"."user_activities" to "service_role";

grant delete on table "public"."user_addresses" to "service_role";

grant insert on table "public"."user_addresses" to "service_role";

grant select on table "public"."user_addresses" to "service_role";

grant update on table "public"."user_addresses" to "service_role";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."verifications" to "service_role";

grant insert on table "public"."verifications" to "service_role";

grant select on table "public"."verifications" to "service_role";

grant update on table "public"."verifications" to "service_role";


