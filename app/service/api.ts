import type { DeleteAdvertisementRequest, GetAdvertisementDetailRequest, GetAdvertisementDetailResponse, GetAdvertisementListRequest, GetAdvertisementListResponse, PostCopyAdvertisementRequest, PostCreateAdvertisementRequest, PostLoginRequest, PutEditAdvertisementRequest, PutViewAdvertisementRequest } from "~/service/types";

import { request } from "./service";

export const postLogin = (p: PostLoginRequest) => request<null>("/api/login", "POST", {
  data: p
});

export const postLogout = () => request<null>("/api/logout", "POST", null);

export const getAdvertisementList = (p: GetAdvertisementListRequest) => request<GetAdvertisementListResponse>("/api/list", "GET", {
  params: p
});

export const getAdvertisementDetail = (p: GetAdvertisementDetailRequest) => request<GetAdvertisementDetailResponse>("/api/advertisement", "GET", {
  params: p
});

export const deleteAdvertisement = (p: DeleteAdvertisementRequest) => request<null>("/api/advertisement", "DELETE", {
  params: p
});

export const postCreateAdvertisement = (p: PostCreateAdvertisementRequest) => request<null>("/api/advertisement", "POST", {
  data: p
});

export const putEditAdvertisement = (p: PutEditAdvertisementRequest) => request<null>("/api/advertisement", "PUT", {
  data: p
});

export const postCopyAdvertisement = (p: PostCopyAdvertisementRequest) => request<null>("/api/copy", "POST", {
  data: p
});

export const putViewAdvertisement = (p: PutViewAdvertisementRequest) => request<null>("/api/view", "PUT", {
  data: p
});