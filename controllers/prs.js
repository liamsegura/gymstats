const cloudinary = require("../middleware/cloudinary");
const User = require("../models/User");
const PR = require("../models/PR")



module.exports = {

  createPR: async (req, res) => {
    console.log(req.file.mimetype)
    
      // Upload media to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'video',
      bit_rate: "550k",
      transformation: [
        {duration: "30.0"},
        {named: "e_thumb"},
      ]
      });

      const thumbnailUrl = result.eager && result.eager[0] && result.eager[0].secure_url;

   try{
      await PR.create({
        media: {
          type: 'video',
          url: result.secure_url,
          thumbnailUrl: thumbnailUrl || result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
        },
        caption: req.body.caption,
        likes: [],
        user: req.user.id,
        category: req.body.category,
        bodyweight: req.user.bodyweight,
        weight: req.body.weight,
        cloudinaryId: result.public_id
      });
  console.log(req.file.mimetype)
      console.log("Post has been added!");
      res.redirect("/feed");
    } catch (err) {
      console.log(err);
    }
  },
  
  likePR: async (req, res) => {
    const postId = req.params.id;
    const userId = req.user._id;
    try {
      const post = await PR.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      const likes = post.likes;
      const userIndex = likes.indexOf(userId);
      if (userIndex > -1) {
        // User has already liked the post, so remove their like
        likes.splice(userIndex, 1);
      } else {
        // User has not yet liked the post, so add their like
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


  deletePR: async (req, res) => {
 
    try {
      // Find post by id
      let pr = await PR.findById({ _id: req.params.id });
      console.log(pr)
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(pr.cloudinaryId, { resource_type:  'video' });
      // Delete post from db
      await PR.remove({ _id: req.params.id });
      console.log("Deleted Pr");
      res.redirect("/feed");
    } catch (err) {
      res.redirect("/feed");
    }
  },
};
