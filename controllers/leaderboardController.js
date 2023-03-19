const PR = require('../models/PR');
const User = require("../models/User");

module.exports = {
  getLeaderboard: async (req, res) => {
    try {
      let selectedCategory = req.query.category || '';
      let selectedBodyweight = req.query.bodyweight || '';
      const prsByCategory = await PR.find({ category: selectedCategory });
      let prs = await PR.find(selectedCategory ? { category: selectedCategory } : {})
        .sort({ weight: -1 })
        .limit(100)
        .populate({ path: 'user', model: 'User' });
      if (selectedBodyweight) {
        prs = prs.filter(pr => pr.bodyweight === Number(selectedBodyweight));
      }
      res.render('leaderboard', { prsByCategory, prs, selectedCategory, selectedBodyweight, loggedUser: req.user, onNotificationsPage: false });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }
};
