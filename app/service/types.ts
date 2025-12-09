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

export type AdvertisementOverview = Pick<Advertisement, "id" | "title" | "content" | "hot" | "price" | "url">;

export type AdvertisementSetting = Pick<Advertisement, "id" | "title" | "content" | "price" | "publisher" | "url">;

export interface GetAdvertisementListRequest {
  pageIndex: number;
  capacity: number;
}

export interface GetAdvertisementListResponse {
  list: AdvertisementOverview[],
  total: number
}

export interface GetDetailRequest {
  id: number;
}

export type GetDetailResponse = AdvertisementSetting;

export interface DeleteRequest {
  id: number;
}

export type PutEditRequest = AdvertisementSetting;

export type PostCreateRequest = Pick<AdvertisementSetting, "title" | "content" | "price" | "publisher" | "url">;