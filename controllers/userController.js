const User = require('../models/User');
const Relationship = require('../models/Relationship');
const Notification = require("../models/Notification");
const cloudinary = require("../middleware/cloudinary");
const moment = require('moment');


exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
  
    // Find all notifications for the current user
    const notifications = await Notification.find({ recipient: userId })
      .populate({ path: 'generator', model: 'User'})
      .populate({path: 'post'})
      .sort({ read: 1, createdAt: 'desc' });
    
  
    await User.findByIdAndUpdate(userId, { unreadCount: 0 });

    notifications.forEach(notification => {
      if (notification.read) {
        setTimeout(async () => {
          await Notification.deleteOne({_id: notification._id});
        }, 24 * 60 * 60 * 1000); // delete after 24/hrs
      }
    })
    
    
    // Format the createdAt date of each notification
notifications.forEach(notification => {
  // Calculate the elapsed time
  const elapsedTime = moment(notification.createdAt).fromNow(true);

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
  notification.formattedElapsedTime = elapsedTimeString.replace(/\s+/g, '');
});

res.render('notifications.ejs', {
  notifications,
  loggedUser: req.user,
  onNotificationsPage: true
});

    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.saveProfile = async (req, res) => {
  try {
    console.log(req.file)
    console.log(req.body)
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

exports.getFollowers = async (req, res) => {
  try {

    const userId = req.params.userId;
    const user = await User.findById(userId).populate({ path: 'followers', model: 'User'}).populate({ path: 'following', model: 'User'})
    res.render("followers.ejs", {

      loggedUser: req.user,
      user,
      onNotificationsPage: false

    });
  } catch (err) {
    console.log(err);
  }
},

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

      // Create notification for the user being followed
      const notification = new Notification({
        type: 'follow',
        generator: userId,
        recipient: userToFollowId
      });
      await notification.save();
      await User.findByIdAndUpdate(notification.recipient, { $inc: { unreadCount: 1 } });

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
    const notification = await Notification.findOne({
      type: 'follow',
      generator: userId,
      recipient: userToUnfollowId,
    });
    if (notification) {
      const notificationId = notification._id;
      await Notification.findByIdAndDelete(notificationId);
      await User.findByIdAndUpdate(notification.recipient, { $inc: { unreadCount: -1 } });
    }

    res.redirect(`/profile/${userToUnfollowId}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


