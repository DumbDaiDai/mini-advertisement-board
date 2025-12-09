import axios, { type AxiosError, type Method } from "axios";

import { useAuthStore } from "#imports";

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body.code === 200) {
      return response;
    }

    if (body.code === 200401) {
      useAuthStore().$reset();
      navigateTo("/login", { replace: true });
    }
    throw new Error(body.msg, body.code);
  },
  (err: AxiosError) => {
    throw err;
  }
);

export const request = async <ResponseData>(url: string, method: Method, payload: { data: unknown } | { params: unknown } | null) => {
  const { data: body } = await axiosInstance({
    url: url,
    method: method,
    ...payload
  });

  return (body.data as ResponseData);
};