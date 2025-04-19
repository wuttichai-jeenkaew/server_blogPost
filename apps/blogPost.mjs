import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const blogPost = Router();

blogPost.post("/", async (req, res) => {
  const newPost = req.body;

  if(!newPost.title || !newPost.image || !newPost.category_id || !newPost.content) {
    return res.status(400).json({ message: "Server could not create post because there are missing data from client" });
  }
  try {
    await connectionPool.query(
      "INSERT INTO posts (title, image, category_id, description, content, status_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        newPost.title,
        newPost.image,
        newPost.category_id,
        newPost.description,
        newPost.content,
        newPost.status_id,
      ]
    );
    return res.status(201).json({ message: "Created post sucessfully" });
  } catch (error) {
    console.error("Error creating post:", error);
    res
      .status(500)
      .json({
        message: "Server could not create post because database connection",
      });
  }
});

blogPost.get("/:postId", async (req, res) => {
    const postId = req.params.postId;
    
  try {
    
    const result = await connectionPool.query(
      "SELECT * FROM posts WHERE id = $1",
      [postId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Server could not find a requested post" });
    }
   
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res
      .status(500)
      .json({ message: "Server could not fetch posts because database connection" });
  }
});

blogPost.put("/:postId", async (req, res) => {
  const postId = req.params.postId;
  const updatedPost = req.body;

  if(!updatedPost.title || !updatedPost.image || !updatedPost.category_id, !updatedPost.content) {
    return res.status(400).json({ message: "Server could not update post because there are missing data from client" });
  }
  try {
    const result = await connectionPool.query(
      "UPDATE posts SET title = $1, image = $2, category_id = $3, description = $4, content = $5, status_id = $6 WHERE id = $7",
      [
        updatedPost.title,
        updatedPost.image,
        updatedPost.category_id,
        updatedPost.description,
        updatedPost.content,
        updatedPost.status_id,
        postId
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Server could not find a requested post" });
    }
    return res.status(200).json({ message: "Server could not find a requested post to update" });
  } catch (error) {
    console.error("Error updating post:", error);
    res
      .status(500)
      .json({
        message: "Server could not update post because database connection",
      });
  }
});

blogPost.delete("/:postId", async (req, res) => {
  const postId = req.params.postId;

  try {
    const result = await connectionPool.query(
      "DELETE FROM posts WHERE id = $1",
      [postId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Server could not find a requested post to delete" });
    }
    return res.status(200).json({ message: "Deleted post sucessfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .json({
        message: "Server could not delete post because database connection",
      });
  }
});

blogPost.get("/", async (req, res) => {
    try {
        const category = req.query.category;
        const keyword = req.query.keyword;
        const limit = parseInt(req.query.limit) || 6;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM posts";
        let countQuery = "SELECT COUNT(*) FROM posts";
        let values = [];
        let conditions = [];

        if (category) {
            conditions.push("category_id = $" + (values.length + 1));
            values.push(category);
        }
        if (keyword) {
            const keywordCondition = `
                (title ILIKE $${values.length + 1} OR 
                description ILIKE $${values.length + 1} OR 
                content ILIKE $${values.length + 1})`;
            conditions.push(keywordCondition);
            values.push(`%${keyword}%`);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
            countQuery += " WHERE " + conditions.join(" AND ");
        }

        query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limit, offset);

        const [result, countResult] = await Promise.all([
            connectionPool.query(query, values),
            connectionPool.query(countQuery, values.slice(0, values.length - 2)),
        ]);

        const totalPosts = parseInt(countResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalPosts / limit);

        return res.json({
            totalPosts,
            totalPages,
            currentPage: page,
            limit,
            posts: result.rows,
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