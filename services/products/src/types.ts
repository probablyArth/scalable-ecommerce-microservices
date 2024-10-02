export type OrderEvent = "order-placed" | "order-shipped";

export type OrderEventPayload = {
  type: OrderEvent;
  payload: {
    _id: string;
    userId: string;
    products: {
      _id: string;
      quantity: number;
    }[];
  };
};
