const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//UPDATE USER
router.put("/:id", async (req, res) => {
  if (req.params.id === req.body.userId || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        res.status(500).json(err.message);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account updated successfully");
    } catch (err) {
      res.status(500).json(err.message);
    }
  } else {
    return res.status(403).json("Action Denied - UPDATE");
  }
});

//DELETE USER
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account deleted successfully");
    } catch (err) {
      res.status(500).json(err.message);
    }
  } else {
    return res.status(403).json("Action Denied - DELETE");
  }
});

//GET USER
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json("User does not exist");
    }
    const {
      password,
      coverPicture,
      followers,
      following,
      createdAt,
      updatedAt,
      ...other
    } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

//FOLLOW A USER
router.put("/:id/follow", async (req, res) => {
  if (!(req.body.userId === req.params.id)) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("User has been FOLLOWED");
      } else {
        res.status(403).json("You already FOLLOW the user");
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  } else {
    return res.status(403).json("Action Denied - SELF-FOLLOW");
  }
});

//UNFOLLOW A USER
router.put("/:id/unfollow", async (req, res) => {
  if (!(req.body.userId === req.params.id)) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("User has be UNFOLLOWED");
      } else {
        res.status(403).json("You already UNFOLLOW the user");
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  } else {
    return res.status(403).json("Action Denied - SELF-UNFOLLOW");
  }
});

module.exports = router;
