const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const User = require("../models/User");
const PR = require("../models/PR");
const Comment = require("../models/Comments");
const browser = require('browser-detect');


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



      const result = browser(req.headers['user-agent'])


      const posts = await Post.find().populate("user").populate("media").lean();
      const PRs = await PR.find().populate("user").populate("media").lean();
      const mergedArray = [...posts, ...PRs];
      mergedArray.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      res.render("feed.ejs", { mergedArray, loggedUser: req.user, browser: result });
    } catch (err) {
      console.log(err);
    }
  },

  getPost: async (req, res) => {
    try {

        const result = browser(req.headers['user-agent'])
        const postId = req.params.id;
        const comments = await Comment.find({post: req.params.id}).populate({ path: 'user', model: 'User', select: 'userName' }).sort({ createdAt: "desc" }).lean();
        console.log(comments)

        // Search for the post in the Post collection
        let post = await Post.findOne({ _id: postId }).populate({
          path: 'user',
          model: 'User'
        }).populate("media").lean();
        

        // If a post with the given ID is not found in the Post collection, search for it in the PR collection
        if (!post) {
            const pr = await PR.findOne({ _id: postId }).populate("user").populate("media").lean();
            if (pr) {
                // If a PR with the given ID is found, assign it to the post variable
                post = pr;
            }
        }

        if (!post) {
            // If neither a post nor a PR with the given ID is found, return a 404 error
            return res.status(404).render("404.ejs");
        }

        // If a post or PR with the given ID is found, render the post.ejs template with the post and user objects
        const user = await User.findById(post.user);

        res.render("post.ejs", { post: post, loggedUser: req.user, user: user, browser: result, comments: comments });

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
  console.log(req.file.mimetype);
  
  try {
    // Upload media to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      bit_rate: "550k",
      transformation: [
        {duration: "30.0"},
        {named: "e_thumb"},
      ]
    });
    
    const thumbnailUrl = result.eager && result.eager[0] && result.eager[0].secure_url;
    
    await Post.create({
      media: {
        type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
        url: result.secure_url,
        thumbnailUrl: thumbnailUrl || result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
      },
      caption: req.body.caption,
      likes: 0,
      user: req.user.id,
      cloudinaryId: result.public_id
    });

    console.log("Post has been added!");
    res.redirect("/feed");
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
      res.redirect("/feed");
    } catch (err) {
      res.redirect("/feed");
    }
  },
};
