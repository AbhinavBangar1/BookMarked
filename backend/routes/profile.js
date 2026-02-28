import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY 
);


router.post("/friends/request", async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({ error: "Missing user or friend ID" });
    }

    const { error } = await supabase
      .from("friends")
      .insert([{ user_id: userId, friend_id: friendId, status: "pending" }]);

    if (error) {

      if (error.code === '23505') {
        return res.status(400).json({ error: "Friend request already sent." });
      }
      throw error;
    }
    
    res.status(200).json({ message: "Friend request sent successfully!" });
  } catch (err) {
    console.error("Error sending friend request:", err);
    res.status(500).json({ error: "Failed to send request" });
  }
});

router.put("/friends/accept", async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({ error: "Missing user or friend ID" });
    }

    const { error } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("user_id", friendId)
      .eq("friend_id", userId);

    if (error) throw error;
    res.status(200).json({ message: "Friend request accepted!" });
  } catch (err) {
    console.error("Error accepting friend request:", err);
    res.status(500).json({ error: "Failed to accept request" });
  }
});


router.delete("/friends/reject", async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({ error: "Missing user or friend ID" });
    }

    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("user_id", friendId)
      .eq("friend_id", userId);

    if (error) throw error;
    res.status(200).json({ message: "Friend request rejected." });
  } catch (err) {
    console.error("Error rejecting friend request:", err);
    res.status(500).json({ error: "Failed to reject request" });
  }
});



router.get("/:userid", async (req, res) => {
  try {
    const { userid } = req.params;

    if (!userid) {
      return res.status(400).json({ error: "No user id provided" });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("userid, username, email, created_at")
      .eq("userid", userid)
      .maybeSingle();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }


    const { data: reviewsRaw, error: reviewError } = await supabase
      .from("reviews")
      .select(`
        reviewid,
        review,
        createdat,
        books:bookid (
          bookid,
          title,
          coverimage
        )
      `)
      .eq("userid", userid)
      .order("createdat", { ascending: false, nullsFirst: false });

    if (reviewError) {
      console.error("Reviews error:", reviewError);
    }

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
      console.error("Friends error:", friendsError);
    }

    const friends = (friendsRaw || []).map((row) => {
      return row.user_id === userid ? row.friend : row.user;
    });
    const { data: requestsRaw, error: requestError } = await supabase
      .from("friends")
      .select(`
        user_id,
        user:users!friends_user_id_fkey (userid, username)
      `)
      .eq("friend_id", userid)
      .eq("status", "pending");

    if (requestError) {
      console.error("Requests error:", requestError);
    }

    const requests = (requestsRaw || []).map((r) => r.user);

    const { data: shelfRaw, error: shelfError } = await supabase
      .from("shelf")
      .select(`
        status,
        books (
          bookid,
          title,
          coverimage
        )
      `)
      .eq("userid", userid);

    if (shelfError) {
      console.error("Shelf error:", shelfError);
    }
    res.json({
      user,
      reviews: reviewsRaw || [],
      friends,
      requests,
      shelf: shelfRaw || [],
    });

  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

export default router;