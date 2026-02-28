import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function storeBookIfNotExists(book) {
  if (!book?.bookid) return;

  const { data, error } = await supabase
    .from("books")
    .select("bookid")
    .eq("bookid", book.bookid);

  if (error) {
    console.error("Select error:", error);
    return;
  }

  if (data.length > 0) return;

  const { error: insertError } = await supabase
    .from("books")
    .insert([book]);

  if (insertError) {
    console.error("Insert failed:", insertError);
  } else {
    console.log("Book inserted:", book.bookid);
  }
}