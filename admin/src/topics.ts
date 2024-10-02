const topics = {
  "order-events": "order-events",
};

export type Topic = keyof typeof topics;
export const Topics: Topic[] = Object.keys(topics) as Topic[];
