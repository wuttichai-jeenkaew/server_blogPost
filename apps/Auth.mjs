import supabase from "../utils/db.mjs";
import { Router } from "express";

const auth = Router();


auth.post("/signup", async (req, res) => {
    
    const { name, username, email, password } = req.body;

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ success: false, error: authError.message });
    }

    const { data, error } = await supabase.from("users").insert([
      {
        id: authData.user.id,
        name,
        username,
        password,
        email,
        created_at: new Date(),
      },
    ]);

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(201).json({ success: true, data: authData.user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
    

auth.post("/login", async (req, res) => {
    const { email, password } = req.body;

  try {
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      return res.status(400).json({ error: loginError.message });
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    res.status(200).json({ user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});         




export default auth;