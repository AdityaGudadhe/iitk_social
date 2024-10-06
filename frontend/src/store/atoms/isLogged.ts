import { atom } from "recoil";

interface LoggedState {
    userId : string,
    photoUrl : string | null,
    email : string | null,
    displayName : string | null,
}

const isLogged = atom<boolean>({
    key:"isLogged",
    default: false
})

const LoginInfo = atom<null | LoggedState>({
    key: "LoginInfo",
    default: null
})


export {isLogged, LoginInfo};
export type { LoggedState };