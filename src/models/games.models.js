import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    gameName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    gameDescription: {
      type: String,
      required: true,
      trim: true
    },
    noOfPlayersRequired: {
      type: Number,
      required: true,
      default: 1
    }
  },
  { timestamps: true }
);

export const Games = mongoose.model("Games", gameSchema);
