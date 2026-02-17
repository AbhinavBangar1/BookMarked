import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://foiwfddafifouftjaiyu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvaXdmZGRhZmlmb3VmdGphaXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTg5ODEsImV4cCI6MjA4NjA5NDk4MX0.UhlTG3i5qZeJ8ntDPC5L8nwbAcQO4kQ8keOMdMH_M5E"
);
