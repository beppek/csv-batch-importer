import * as mongoose from 'mongoose';

export interface OrderModel extends mongoose.Document {
  orderId: string;
  customerId: string;
  item: string;
  quantity: number;
}

const schema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const Order = mongoose.model<OrderModel>('Order', schema);

export default Order;
