const Challenge = require("../models/Challenge");
const cloudinary = require("../middleware/cloudinary");
const moment = require('moment');
const Comment = require("../models/Comments");
const Notification = require("../models/Notification");
const Post = require("../models/Post");
const PR = require("../models/PR");
const Submission = require("../models/Submission");
const User = require("../models/User");

module.exports = {

  createChallenge: async (req, res) => {
    const { title, description, endDate } = req.body;
  
   
    try{
      const challenge = await Challenge.create({
      
        user: req.user.id,
        title,
        description,
        startDate: new Date(),
        endDate,
  
      })
      console.log("challenge has been added!");
      res.redirect("/postmenu")
    } catch (err) {
        console.log(err);
      }
  },
  getChallenges: async (req, res) => {
    const challenges = await Challenge.find()
    try{
    res.render("challenges.ejs", {challenges, pageTitle: "challenges", loggedUser: req.user})
    } catch (err) {
      console.log(err);
    }
  },
  getChallenge: async (req, res) => {
    const challenge = await Challenge.findById(req.params.id).populate({
      path: "leaderboard.submission",
      model: 'Submission'
    }).populate({
      path: "leaderboard.user",
      model: 'User'
    }).lean();
    console.log(challenge.leaderboard)
    const submissions = challenge.leaderboard.sort((a, b) => b.submission.reps - a.submission.reps);
    console.log(submissions)

    const userRank = submissions.findIndex(sub => sub.user._id.toString() === req.user._id.toString());

    try {
      res.render("challenge.ejs", {
        challenge,
        pageTitle: "challenge",
        loggedUser: req.user,
        submissions,
        userRank
      });
    } catch (err) {
      console.log(err);
    }
  },


  joinChallenge: async (req, res) => {
    const challenge = await Challenge.findById(req.params.id)
    console.log(req.user.id)
    if (challenge.participants.includes(req.user.id)) {
      console.log("User is already a participant");
      res.redirect("/challenges/" + req.params.id);
      return;
    }
    try{
    challenge.participants.push(req.user.id)
    await challenge.save()
    res.redirect("/challenges/" + req.params.id)
    } catch (err) {
      console.log(err);
    }
  },
  submitChallenge: async (req, res) => {
    try {
      const challenge = await Challenge.findById(req.params.id);
      console.log(req.file.mimetype);
  
      // Upload media to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        bit_rate: "550k",
        transformation: [
          { duration: "30.0" },
          { named: "e_thumb" },
        ],
        eager_async: true
      });
  
      const thumbnailUrl = result.eager && result.eager[0] && result.eager[0].secure_url;
  
      const existingSubmission = await Submission.findOne({ user: req.user.id, challenge: challenge._id });
      if (existingSubmission) {
        if (existingSubmission.cloudinaryId) {
          await cloudinary.uploader.destroy(existingSubmission.cloudinaryId, { resource_type:  'video' });
        }
        await Submission.deleteOne({ _id: existingSubmission._id });
        challenge.leaderboard = challenge.leaderboard.filter(entry => entry.submission.toString() !== existingSubmission._id.toString());
      }
  
      const submission = await Submission.create({
        media: {
          type: 'video',
          url: result.secure_url,
          thumbnailUrl: thumbnailUrl || result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
        },
        challenge: challenge._id,
        likes: [],
        user: req.user.id,
        reps: req.body.reps,
        cloudinaryId: result.public_id
      });
      challenge.leaderboard.push({ user: req.user.id, submission: submission });
      await challenge.save();
      console.log("submission has been added!");
      res.redirect("/challenges/" + req.params.id);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  

  getSubmission: async (req, res) => {
    try {
        
  
        const submissionId = req.params.id;
        console.log(submissionId)

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
        let submission = await Submission.findById(submissionId).populate({
          path: 'user',
          model: 'User'
        }).populate("media").lean();
       
        // If a post or PR with the given ID is found, render the post.ejs template with the post and user objects
        const user = await User.findById(submission.user._id);

          // Calculate the elapsed time
          const elapsedTime = moment(submission.createdAt).fromNow(true);

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
          submission.formattedElapsedTime = elapsedTimeString.replace(/\s+/g, '');

        res.render("submission.ejs", { pageTitle: 'submission', post: submission, loggedUser: req.user, user: user, comments: comments, onNotificationsPage: false });

    } catch (err) {
        console.log(err);
    }
},

  deleteChallenge: async (req, res) => {}
}
  

  
    // try {
    //   const savedChallenge = await challenge.save();
    //   const user = await User.findById(req.user._id);
    //   user.challenges.push(savedChallenge);
    //   await user.save();
    //   res.redirect('/challenges/' + savedChallenge._id);
    // } catch (err) {
    //   console.error(err);
    //   res.render('error', { message: err.message });
    // }