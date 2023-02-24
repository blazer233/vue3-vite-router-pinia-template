import { defineStore } from "pinia";
import { UserInfo, State } from "#/store";

export default defineStore("userStore", {
  state: (): State => {
    return {
      userInfo: {
        userName: "",
        userId: ""
      },
      login: false,
      token: ""
    };
  },
  actions: {
    /**
     * 修改用户信息
     * @param {UserInfo} userInfo 用户信息
     */
    changeUserName(userInfo: UserInfo) {
      this.userInfo = userInfo;
    },
    bindLogin(login: boolean) {
      this.login = login;
    }
  },
  persist: true
});
