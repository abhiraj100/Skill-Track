import mongoose from "mongoose";
const schema = new mongoose.Schema({ name: { type: String, unique: true }, category: String });
export default mongoose.model("Skill", schema);
