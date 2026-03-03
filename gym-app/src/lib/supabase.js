import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ukjiziehqfkebmuuckyj.supabase.co";
const supabaseKey =
  "sb_publishable_NfFL4BzXWJQ5MaJYP8hX5A_Tmy-24Qy";

export const supabase = createClient(supabaseUrl, supabaseKey);
