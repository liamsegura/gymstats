const PR = require('../models/PR');
const User = require("../models/User");

module.exports = {
  getLeaderboard: async (req, res) => {
    try {
      let selectedCategory = req.query.category || '';
      let selectedBodyweight = req.query.bodyweight || '';
      let selectedReps = req.query.reps || '';
      const prsByCategory = await PR.find({ category: selectedCategory });
      let prs = await PR.find(selectedCategory ? { category: selectedCategory } : {})
        .sort({ weight: -1 })
        .limit(100)
        .populate({ path: 'user', model: 'User' });
      if (selectedBodyweight) {
        prs = prs.filter(pr => pr.bodyweight === Number(selectedBodyweight));
      }
      if (selectedReps) {
        prs = prs.filter(pr => pr.reps === Number(selectedReps));
      }
      const prsByUser = new Map();
      for (const pr of prs) {
        const key = `${pr.user._id}_${pr.bodyweight}_${pr.reps}`;
        if (!prsByUser.has(key)) {
          prsByUser.set(key, pr);
        } else {
          const existingPr = prsByUser.get(key);
          if (pr.weight > existingPr.weight) {
            prsByUser.set(key, pr);
          }
        }
      }
      prs = Array.from(prsByUser.values());

      // limit the number of PRs to 100
      res.render('leaderboard', { pageTitle: 'leaderboard', prsByCategory, prs, selectedCategory, selectedBodyweight, selectedReps, loggedUser: req.user, onNotificationsPage: false });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }
};
