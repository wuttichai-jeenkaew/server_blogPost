import { Router } from "express";
import validatePost from "../middleware/validatePost.js";
import supabase  from "../utils/db.mjs";

const blogPost = Router();

blogPost.post("/", [validatePost], async (req, res) => {
  const newPost = req.body;

  if (!newPost.title || !newPost.image || !newPost.category_id || !newPost.content || !newPost.status_id || !newPost.description) {
    return res.status(400).json({ message: "Server could not create post because there are missing data from client" });
  }

  try {
    const { error } = await supabase
      .from("posts")
      .insert([newPost]);

    if (error) throw error;

    return res.status(201).json({ message: "Created post successfully" });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server could not create post because of a database error" });
  }
});

blogPost.get("/:postId", async (req, res) => {
  const postId = req.params.postId;

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: "Server could not find the requested post" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server could not fetch post because of a database error" });
  }
});

blogPost.put("/:postId", [validatePost], async (req, res) => {
  const postId = req.params.postId;
  const updatedPost = req.body;

  if (!updatedPost.title || !updatedPost.image || !updatedPost.category_id || !updatedPost.content) {
    return res.status(400).json({ message: "Server could not update post because there are missing data from client" });
  }

  try {
    const { error } = await supabase
      .from("posts")
      .update(updatedPost)
      .eq("id", postId);

    if (error) throw error;

    return res.status(200).json({ message: "Updated post successfully" });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server could not update post because of a database error" });
  }
});

blogPost.delete("/:postId", async (req, res) => {
  const postId = req.params.postId;

  try {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) throw error;

    return res.status(200).json({ message: "Deleted post successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server could not delete post because of a database error" });
  }
});

blogPost.get("/", async (req, res) => {
  try {
    const category = req.query.category;
    const keyword = req.query.keyword;
    const limit = parseInt(req.query.limit) || 6;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    let query = supabase.from("posts").select("*", { count: "exact" });

    if (category) {
      query = query.eq("category_id", category);
    }

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    const totalPages = Math.ceil(count / limit);

    return res.json({
      totalPosts: count,
      totalPages,
      currentPage: page,
      limit,
      posts: data,
      nextPage: page < totalPages ? page + 1 : null,
    });
  } catch (e) {
    console.error("Error fetching posts:", e);
    return res.status(500).json({
      message: "Server could not fetch posts due to a database error",
    });
  }
});

export default blogPost;
