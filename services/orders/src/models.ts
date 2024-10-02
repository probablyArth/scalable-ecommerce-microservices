import { model, Schema } from "mongoose";

const OrderSchema = new Schema({
  userId: { type: String, required: true },
  products: [
    {
      _id: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
});

const Order = model("Order", OrderSchema);

export { Order };
