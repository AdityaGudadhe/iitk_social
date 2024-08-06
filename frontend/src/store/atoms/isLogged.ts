import { atom } from "recoil";

const isLogged = atom<boolean>({
    key:"isLogged",
    default: false
})

export default isLogged;