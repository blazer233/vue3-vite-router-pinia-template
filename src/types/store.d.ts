export interface UserInfo {
  userName: string;
  userId: string | number;
}
export interface State {
  userInfo: UserInfo;
  login?: boolean;
  token: string;
}
