import express from "express";
import blogPost from "./apps/blogpost.mjs";

const app = express();
const port = 4000;
app.use(express.json());


app.use("/posts", blogPost);
app.get("/", (req, res) => {
    return res.json("Server API is working 🚀")
});


app.get("/profiles", (req, res) =>{
    return res.status(200).json({
        "data":  {
            "name": "john",
            "age": 20
        }
    })
});

app.listen(port, () =>{
    console.log(`Server is running at http://localhost:${port}`);
});