import express from "express";
import blogPost from "./apps/blogPost.mjs";
import cors from "cors";
import auth from "./apps/Auth.mjs";


const app = express();
const port = 4000;
app.use(express.json());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use("/posts", blogPost);
app.use("/auth", auth);
app.get("/test", (req, res) => {
    return res.json("Server API is working 🚀")
});




app.listen(port, () =>{
    console.log(`Server is running at http://localhost:${port}`);
});