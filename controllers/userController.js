const User = require('../models/User');
const Relationship = require('../models/Relationship');
const cloudinary = require("../middleware/cloudinary");


exports.saveProfile = async (req, res) => {
  try {
    console.log(req.file)
    // Check if the new username already exists in the database
    const user = await User.findOne({ userName: req.body.userName });
    if (user && user._id.toString() !== req.params.id) {
      req.flash("errors", {
        msg: "Account with that username already exists.",
      });
      // If the username exists and belongs to a different user, don't update
      console.log(`Username "${req.body.userName}" already exists`);
      res.redirect(`/editProfile/${req.params.id}`);
      return;
    }

    // Update the user document
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          userName: req.body.userName,
          bodyweight: req.body.bodyweight,
        },
      },
      { new: true }
    );
    console.log("User Updated");
    res.redirect(`/profile/${req.params.id}`);
  } catch (err) {
    console.log(err);
  }
};


exports.saveProfilePic = async (req, res) => {
  try {
    console.log(req.file)
      const user = await User.findById(req.params.id)
      console.log(user)

      if(user.cloudinaryId){
      await cloudinary.uploader.destroy(user.cloudinaryId, { resource_type: "image" })
      }
      
      result = await cloudinary.uploader.upload(req.file.path, {
        transformation: [
         { width: 200, height: 200, crop: "fill" }
        ]})

    // Update the user document
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          profilePic: {
            url: result.secure_url,
            type: req.file ? req.file.mimetype : user.profilePic.type
          },
          cloudinaryId: result.public_id
        },
      },
      { new: true }
    );
    console.log("User Updated");
    res.redirect(`/profile/${req.params.id}`);
  } catch (err) {
    console.log(err);
  }
};



exports.followUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userToFollowId = req.params.userToFollowId;



    if (userId === userToFollowId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const [user, userToFollow] = await Promise.all([
      User.findById(userId),
      User.findById(userToFollowId)
    ]);

   

    if (!user || !userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const relationship = await Relationship.findOneAndUpdate(
      { follower: userId, following: userToFollowId },
      { follower: userId, following: userToFollowId },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(userId, { $addToSet: { following: userToFollowId } });
    await User.findByIdAndUpdate(userToFollowId, { $addToSet: { followers: userId } });

    res.redirect(`/profile/${userToFollowId}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userToUnfollowId = req.params.userToUnfollowId;

    console.log('userId:', userId);
    console.log('userToUnfollowId:', userToUnfollowId);

    if (userId === userToUnfollowId) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const [user, userToUnfollow] = await Promise.all([
      User.findById(userId),
      User.findById(userToUnfollowId)
    ]);

    console.log('user:', user);
    console.log('userToUnfollow:', userToUnfollow);

    if (!user || !userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Relationship.findOneAndDelete({ follower: userId, following: userToUnfollowId });
    await User.findByIdAndUpdate(userId, { $pull: { following: userToUnfollowId } });
    await User.findByIdAndUpdate(userToUnfollowId, { $pull: { followers: userId } });

    res.redirect(`/profile/${userToUnfollowId}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


