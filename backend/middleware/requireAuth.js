import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export async function requireAuth(req, res, next) {
    const authheader = req.headers.authorization;
    
    if (!authheader) {
        return res.status(401).json({ error: "No token provided" });
    }

    // ✅ FIXED: "Bearer " (not "Beared"), with space, and trim the result
    const token = authheader.replace("Bearer ", "").trim();

    try {
        // ✅ FIXED: "error" not "auth"
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data || !data.user) {
            console.error("Auth error:", error);
            return res.status(401).json({ error: "Not Authorized" });
        }

        // ✅ FIXED: "req.user" not "res.user"
        req.user = data.user;
        next();
    } catch (err) {
        console.error("requireAuth failed:", err);
        return res.status(500).json({ error: "Authentication failed" });
    }
}