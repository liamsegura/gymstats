import mongoose from 'mongoose'

const RelationshipSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  following: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('Relationship', RelationshipSchema);
