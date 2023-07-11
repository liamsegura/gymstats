import cloudinary from "../middleware/cloudinary"
import User from "../models/User"
import PR from "../models/PR"
import Relationship from "../models/Relationship"
import Notification from "../models/Notification"
import Comment from "../models/Comments"



export default {


  
      
  createPR: async (req:any, res:any) => {
    console.log(req.file.mimetype)
    
      // Upload media to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'video',
      bit_rate: "550k",
      transformation: [
        {duration: "30.0"},
        {named: "e_thumb"},
      ],
      eager_async: true
      });

      const thumbnailUrl = result.eager && result.eager[0] && result.eager[0].secure_url;

   try{
    const post = await PR.create({
        media: {
          type: 'video',
          url: result.secure_url,
          thumbnailUrl: thumbnailUrl || result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
        },
        caption: req.body.caption,
        likes: [],
        user: req.user.id,
        category: req.body.category,
        bodyweight: req.body.bodyweight,
        weight: req.body.weight,
        reps: req.body.reps,
        cloudinaryId: result.public_id
      });

      // Create post notification for all followers
      const followers = await Relationship.find({ following: req.user.id }).populate("follower");
      const notificationPromises = followers.map(async (follower: { follower: { _id: string; }; }) => {
        if (follower.follower._id.toString() !== req.user.id) {
          await Notification.create({
            type: "post",
            generator: req.user._id,
            recipient: follower.follower._id,
            post: post._id,
          });
          await User.findByIdAndUpdate(follower.follower._id, { $inc: { unreadCount: 1 } });
        }
        return null;
      });
      
  
      console.log("Pr has been added!");
      res.redirect("/feed");
    } catch (err:any) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
 
  
  likePR: async (req:any, res:any) => {
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
        // Delete corresponding notification if exists

        const deletedNotification = await Notification.findOneAndDelete({
          type: "like",
          generator: userId,
          recipient: post.user,
          post: post._id,
        });
        console.log(deletedNotification)
        if (deletedNotification) {
          await User.findByIdAndUpdate(post.user, { $inc: { unreadCount: -1 } });
        }
      } else {
        // User has not yet liked the post, so add their like
        if(!req.user._id.equals(post.user)){

        
          const notification:any = new Notification({
            type: 'like',
            generator: userId,
            recipient: post.user,
            post: post._id,
            onModel: "PR"
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



  deletePR: async (req:any, res:any) => {
    try {
      // Find post by id
      let pr = await PR.findById({ _id: req.params.id });
      await Comment.deleteMany({ post: req.params.id });
      await Notification.deleteMany({ post: req.params.id })
      let user:any = await User.findById({ _id: pr.user });
      const notificationPromises = await Promise.all(user.followers.map(async (follower:{_id:string}) => {
        console.log("Processing follower: ", follower);
        if (follower && follower && follower._id.toString() !== req.user.id) {
          console.log(follower)
          await User.findByIdAndUpdate(follower._id, { $inc: { unreadCount: -1 } });
        }
        return Promise.resolve(null)
      
      }));
      
      
      console.log(notificationPromises)
  
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(pr.cloudinaryId, { resource_type:  'video' });
      // Delete post from db
      await PR.remove({ _id: req.params.id });
      console.log("Deleted Pr");
      
      await Promise.all(notificationPromises); // Wait for all notifications to be updated
      res.redirect("/feed");
    } catch (err) {
      res.redirect("/feed");
    }
  },
  
};
