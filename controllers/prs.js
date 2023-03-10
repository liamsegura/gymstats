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
        likes: 0,
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
    try {
      await PR.findOneAndUpdate(
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
