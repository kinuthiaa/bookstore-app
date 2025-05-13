import express from "express";
import cloud from "../lib/cloudinary.js";
import Books from "../models/book.js";
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;
    if (!image || !title || !rating || !caption) return res.status(400).json({ message: "Please provide all fields" });

    //send image to cloudinary and mongodb
    const uploadres = await cloud.uploader.upload(image);
    const imgUrl = uploadres.secure_url
    //store to mongodb
    const newBook = new Books({
      title,
      caption,
      rating,
      image: imgUrl,
      user: req.user._id,
    });

    await newBook.save();

    return res.status(201).json(newBook);


  } catch (error) {
    console.error("Error creating books:", error.message);
    return res.status(500).json({ message: "It's not you it's me. Let's give it another go." });
  }
});


//get all books and pagination with infinite loading
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const books = await Books.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "username profileImg");

    const total = await Books.countDocuments();
    res.send({
      books,
      currentPage: page,
      totalBooks: total,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.error("Error in get books:", error.message);
    res.status(500).json({ message: "it's not you it's me, let's give it another shot" });
  }
});

router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Books.find({user: req.user._id}).sort({createdAt: -1});
    res.json(books);
  } catch (error) {
    console.error("Error getting recommended books", error.message);
    res.status(500).json({ message: "it's not you it's me, let's give it another shot" });
  }
})


//Delete book by Id
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Books.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if(book.user.toString() !== req.user._id.toString()) return res.status(401).json({message: "Unauthorized"});

    //del img from cloudinary ndio tusave space
    if(book.image && book.image.includes("cloudinary")){
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloud.uploader.destroy(publicId);
      } catch (delerror) {
        console.error("Error deleting book:", delError.message);
        return res.status(500).json({ message: "It's not you, it's me let's give it another shot" });
      }
    }

    await Books.deleteOne();

    res.json({message: "Book Successfully deleted!"});
  } catch (error) {
    console.error("Error Deleting book:", error.message);
    res.status(500).json({ message: "it's not you it's me, let's give it another shot" });
  }
});


export default router;