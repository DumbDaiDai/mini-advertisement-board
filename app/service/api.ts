import type { DeleteRequest, GetAdvertisementListRequest, GetAdvertisementListResponse, GetDetailRequest, GetDetailResponse, PostCreateRequest, PostLoginRequest, PutEditRequest } from "~/service/types";

import { request } from "./service";

export const postLogin = (p: PostLoginRequest) => request<null>("/api/login", "POST", {
  data: p
});

export const postLogout = () => request<null>("/api/logout", "POST", null);

export const getAdvertisementList = (p: GetAdvertisementListRequest) => request<GetAdvertisementListResponse>("/api/list", "GET", {
  params: p
});

export const getDetail = (p: GetDetailRequest) => request<GetDetailResponse>("/api/list", "GET", {
  params: p
});

export const deleteAd = (p: DeleteRequest) => request<null>("/api/advertisement", "DELETE", {
  params: p
});

export const postCreateAd = (p: PostCreateRequest) => request<null>("/api/advertisement", "POST", {
  data: p
});

export const putEditAd = (p: PutEditRequest) => request<null>("/api/advertisement", "PUT", {
  data: p
});