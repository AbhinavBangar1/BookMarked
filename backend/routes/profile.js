import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY 
);

router.get("/:userid", async (req, res) => {
  try {
    const { userid } = req.params;

    if (!userid) {
      return res.status(400).json({ error: "No user id provided" });
    }

    // USER
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("userid, username, email, created_at")
      .eq("userid", userid)
      .maybeSingle();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // REVIEWS
    const { data: reviews, error: reviewError } = await supabase
      .from("reviews")
      .select(`
        reviewid,
        review,
        createdat,
        books:bookid (
          title,
          coverimage
        )
      `)
      .eq("userid", userid)
      .order("createdat", { ascending: false, nullsFirst: false });

    if (reviewError) {
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }

    //FRIENDS (accepted only, return OTHER user)
    const { data: friendsRaw, error: friendsError } = await supabase
      .from("friends")
      .select(`
        user_id,
        friend_id,
        status,
        user:users!friends_user_id_fkey (userid, username),
        friend:users!friends_friend_id_fkey (userid, username)
      `)
      .or(`user_id.eq.${userid},friend_id.eq.${userid}`)
      .eq("status", "accepted");

    if (friendsError) {
      return res.status(500).json({ error: "Failed to fetch friends" });
    }

    const friends = friendsRaw.map((row) => {
      return row.user.userid === userid ? row.friend : row.user;
    });

    //FRIEND REQUESTS (PENDING, NOT "requested")
    const { data: requestsRaw, error: requestError } = await supabase
      .from("friends")
      .select(`
        user_id,
        user:users!friends_user_id_fkey (userid, username)
      `)
      .eq("friend_id", userid)
      .eq("status", "pending");


    const { data: shelf, error: shelfError } = await supabase
      .from("shelf")
      .select(`
        status,
        books:bookid (
          bookid,
          title,
          coverimage
        )
      `)
      .eq("userid", userid);

    if (shelfError) {
      console.error("Shelf error:", shelfError);
      return res.status(500).json({ error: "Failed to fetch shelf" });
}

    if (requestError) {
      return res.status(500).json({ error: "Failed to fetch requests" });
    }

    const requests = requestsRaw.map((r) => r.user);

    res.json({
      user,
      reviews: reviews || [],
      friends,
      requests,
      shelf,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

export default router;