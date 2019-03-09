import * as mongoose from 'mongoose';

export interface iCustomer {
  customerId: string;
  firstName: string;
  lastName: string;
}

export interface CustomerModel extends iCustomer, mongoose.Document {}

const schema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

const Customer = mongoose.model<CustomerModel>('Customer', schema);

export default Customer;
