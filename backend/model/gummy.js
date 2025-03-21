import mongoose from "mongoose";

const GummySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    brand: { type: String, required: true },
    rating: { type: Number, required: true },
    horn: { type: String, required: true },
    munchie: { type: Number, required: true },
    munchNotes: { type: String, required: true },
    notes: { type: String, required: true },
    felt: { type: String, required: true },
    morningAfter: { type: String, required: true },
    weeknight: { type: String, required: true },
    cbd: { type: Number, required: true },
    thc: { type: Number, required: true },
    dateCreated: { type: Date, required: true },
    picture: {type: String, required: false}
  },
  { timestamps: true }
);

export const Gummy = mongoose.model("Gummy", gummySchema); 
