import Axios from "axios";

const axios = Axios.create({});

axios.interceptors.response.use((res) => {
  console.log(`URL: ${res.config?.url}\n${JSON.stringify(res.data)}`);
  return res;
});

export { axios };
