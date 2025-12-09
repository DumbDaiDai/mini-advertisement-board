export interface ListBoardUrlQuery {
  page: number;
  [key: string]: unknown;
}
export interface PostLoginRequest {
  username: string;
  password: string;
}

export interface Advertisement {
  id: number;
  title: string;
  content: string;
  hot: number;
  price: number;
  publisher: string;
  url: string;
}

export interface GetAdvertisementListRequest {
  pageIndex: number;
  capacity: number;
}

export interface GetAdvertisementListResponse {
  list: Advertisement[],
  total: number
}

export interface GetAdvertisementDetailRequest {
  id: number;
}

export type GetAdvertisementDetailResponse = Omit<Advertisement, "hot">;

export interface DeleteAdvertisementRequest {
  id: number;
}

export type PutEditAdvertisementRequest = Omit<Advertisement, "hot">;

export type PostCreateAdvertisementRequest = Omit<Advertisement, "id" | "hot">;

export interface PostCopyAdvertisementRequest {
  id: number;
}

export interface PutViewAdvertisementRequest {
  id: number;
}