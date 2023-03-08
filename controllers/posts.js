const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const User = require("../models/User");



module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.params.id });
      const user = await User.findById( req.params.id )
      res.render("profile.ejs", { posts: posts, loggedUser: req.user, user: user});
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().populate("user").populate("media").sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts, loggedUser: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const user = await User.findById({_id: post.user});
      res.render("post.ejs", { post: post, loggedUser: req.user, user: user });
    } catch (err) {
      console.log(err);
    }
  },
  getPostMenu: async (req, res) => { 
    try{
      res.render("postmenu.ejs", {loggedUser: req.user})
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    console.log(req.file.mimetype)
    
      // Upload media to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, { resource_type: req.file.mimetype.startsWith('video') ? 'video' : 'image' });
   try{
      await Post.create({
        media: {
          type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
          url: result.secure_url,
        },
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
        cloudinaryId: result.public_id
      });
  console.log(req.file.mimetype)
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
 
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      console.log(post)
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId, { resource_type: post.media.type.startsWith('video') ? 'video' : 'image' });
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
