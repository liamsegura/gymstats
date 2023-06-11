const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const User = require("../models/User");
const PR = require("../models/PR");
const Comment = require("../models/Comments");
const browser = require('browser-detect');
const Relationship = require("../models/Relationship");
const Notification = require("../models/Notification");
const moment = require('moment');


module.exports = {

  getProfile: async (req, res) => {
    try {
      const userId = req.params.id;
      const posts = await Post.find({ user: userId });
      const user = await User.findById(userId);
      const isFollowing = user.followers.includes(req.user._id);
      const prs = await PR.find({ user: userId })


        res.render("profile.ejs", {
          pageTitle: user.userName,
          posts,
          prs,
          loggedUser: req.user,
          user,
          isFollowing,
          onNotificationsPage: false
        });
      } catch (err) {
        console.log(err);
      }
  },

  editProfile: async (req, res) => {
    try {
      const userId = req.params.id;
      const posts = await Post.find({ user: userId });
      const user = await User.findById(userId);
      const isFollowing = user.followers.includes(req.user._id);
      const prs = await PR.find({ user: userId })
      
      res.render("editprofile.ejs", {
        pageTitle: 'edit profile',
        posts,
        prs,
        loggedUser: req.user,
        user,
        isFollowing,
        onNotificationsPage: false
      });
    } catch (err) {
      console.log(err);
    }
  },


  getFeed: async (req, res) => {
    try {
      
      const result = browser(req.headers['user-agent']);
  
      const posts = await Post.find().populate("user").populate("media").lean();
      const PRs = await PR.find().populate("user").populate("media").lean();
      const mergedArray = [...posts, ...PRs];
  
      // Fetch the number of comments for each post
      const promises = mergedArray.map(async post => {
        const numComments = await Comment.countDocuments({ post: post._id });
        post.numComments = numComments;
        return post;
      });
  
      const postsWithComments = await Promise.all(promises);
  
      // Sort the merged array by the creation date of each post
      postsWithComments.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  
      // Format the createdAt date of each post
      postsWithComments.forEach(post => {
        const elapsedTime = moment(post.createdAt).fromNow(true);
        let elapsedTimeString;
  
        if (elapsedTime.startsWith('a few seconds')) {
          elapsedTimeString = 'Just now';
        } else if (elapsedTime.startsWith('a minute')) {
          elapsedTimeString = '1m';
        } else if (elapsedTime.startsWith('an hour')) {
          elapsedTimeString = '1h';
        } else if (elapsedTime.startsWith('a day')) {
          elapsedTimeString = '1d';
        } else {
          elapsedTimeString = elapsedTime.replace('minutes', 'm').replace('hours', 'h').replace('days', 'd');
        }
  
        post.formattedElapsedTime = elapsedTimeString.replace(/\s+/g, '');
      });
  
      res.render("feed.ejs", { pageTitle: 'gymstats', mergedArray: postsWithComments, loggedUser: req.user, browser: result, onNotificationsPage: false });
    } catch (err) {
      console.log(err);
    }
  },
  

  getPost: async (req, res) => {
    try {
        

        const result = browser(req.headers['user-agent'])
        const postId = req.params.id;
        const comments = await Comment.find({post: req.params.id}).populate({ path: 'user', model: 'User'}) .populate({
          path: 'replies',
          populate: {
            path: 'user',
            model: 'User'
          }
        }).sort({ createdAt: "desc" }).lean();
        
        if(req.query.notificationId){
           const notificationId = req.query.notificationId

        // Update the read property of the notification with the given _id
        await Notification.findByIdAndUpdate(notificationId, { read: true });
        }
    

        // Search for the post in the Post collection
        let post = await Post.findOne({ _id: postId }).populate({
          path: 'user',
          model: 'User'
        }).populate("media").lean();
        

        // If a post with the given ID is not found in the Post collection, search for it in the PR collection
        if (!post) {
            const pr = await PR.findOne({ _id: postId }).populate({
              path: 'user',
              model: 'User'
            }).populate("media").lean();
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

          // Calculate the elapsed time
          const elapsedTime = moment(post.createdAt).fromNow(true);

          // Format the elapsed time string
          let elapsedTimeString;
          if (elapsedTime.startsWith('a few seconds')) {
            elapsedTimeString = 'Just now';
          } else if (elapsedTime.startsWith('a minute')) {
            elapsedTimeString = '1m';
          } else if (elapsedTime.startsWith('an hour')) {
            elapsedTimeString = '1h';
          } else if (elapsedTime.startsWith('a day')) {
            elapsedTimeString = '1d';
          } else {
            elapsedTimeString = elapsedTime.replace('minutes', 'm').replace('hours', 'h').replace('days', 'd');
          }

          // Set the formatted elapsed time string on the notification object
          post.formattedElapsedTime = elapsedTimeString.replace(/\s+/g, '');

        res.render("post.ejs", { pageTitle: 'gymstats', post: post, loggedUser: req.user, user: user, browser: result, comments: comments, onNotificationsPage: false });

    } catch (err) {
        console.log(err);
    }
},

getLikes: async (req, res) => {
  try {

    const postId = req.params.id;
     // Search for the post in the Post collection
     let post = await Post.findOne({ _id: postId }).populate({
      path: 'likes',
      model: 'User'
    }).lean();
    

    // If a post with the given ID is not found in the Post collection, search for it in the PR collection
    if (!post) {
        const pr = await PR.findOne({ _id: postId }).populate({
          path: 'likes',
          model: 'User'
        }).lean();
        if (pr) {
            // If a PR with the given ID is found, assign it to the post variable
            post = pr;
        }
    }

    if (!post) {
        // If neither a post nor a PR with the given ID is found, return a 404 error
        return res.status(404).render("404.ejs");
    }
    
    res.render("likes.ejs", {
      pageTitle: 'likes',
      loggedUser: req.user,
      post,
      onNotificationsPage: false

    });
  } catch (err) {
    console.log(err);
  }
},


  getPostMenu: async (req, res) => { 
    try{
      res.render("postmenu.ejs", {pageTitle: 'menu', loggedUser: req.user, onNotificationsPage: false})
    } catch (err) {
      console.log(err);
    }
  },

  createPost: async (req, res) => {
    try {
      // Upload media to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
        bit_rate: "550k",
        transformation: [
          {duration: "30.0"},
          {named: "e_thumb"},
        ],
        eager_async: true
      });
      const mongoose = require('mongoose');
      const thumbnailUrl = result.eager && result.eager[0] && result.eager[0].secure_url;
      const isValidObjectId = mongoose.Types.ObjectId.isValid(req.user._id);
      if (!isValidObjectId) {
        console.log('not valid');
      }else{
        console.log('valid')
      }

      const post = await Post.create({
        media: {
          type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
          url: result.secure_url,
          thumbnailUrl: thumbnailUrl || result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
        },
        caption: req.body.caption,
        likes: [],
        user: req.user.id,
        cloudinaryId: result.public_id
      });
        
      console.log("Post has been added!");
      res.redirect("/feed");
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  
  
likePost: async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const likes = post.likes;
    const userIndex = likes.indexOf(userId);
    if (userIndex > -1) {
      // User has already liked the post, so remove their like
      likes.splice(userIndex, 1);
      // Delete corresponding notification if exists

      const deletedNotification = await Notification.deleteMany({
        type: "like",
        generator: userId,
        recipient: post.user,
        post: post._id,
        onModel: "Post"
      });
      console.log(deletedNotification)
      if (deletedNotification) {
        await User.findByIdAndUpdate(post.user, { $inc: { unreadCount: -1 } });
      }
    } else {
      // User has not yet liked the post, so add their like
      if(!req.user._id.equals(post.user)){
        const notification = new Notification({
          type: 'like',
          generator: userId,
          recipient: post.user,
          post: post._id,
          onModel: "Post"
        });
        await notification.save();
        await User.findByIdAndUpdate(notification.recipient, { $inc: { unreadCount: 1 } });
      }
      likes.push(userId);
    }
    
    post.likes = likes;
    const updatedPost = await post.save();
    res.redirect("/post/" + req.params.id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
},  





  deletePost: async (req, res) => {
 
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      console.log(post)
      await Comment.deleteMany({ post: req.params.id });
      await Notification.deleteMany({ post: req.params.id })
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
