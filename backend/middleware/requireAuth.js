import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export async function requireAuth(req , res , next){
    const authheader = req.headers.authorization;
    if (!authheader){
        res.status(401).json({error : "No tokens provided"});
    }

    const token = authheader.replace("Beared" , "");

    const {data , auth} = await supabase.auth.getUser(token);

    if (error || !data){
        res.status(401).json({error : "Not Authorized"});
    }

    res.user = data.user ;
    next();
}