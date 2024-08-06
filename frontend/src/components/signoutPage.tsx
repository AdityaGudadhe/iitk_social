import {useNavigate} from "react-router-dom";
import {useSetRecoilState} from "recoil";
import isLogged from "../store/atoms/isLogged.ts";
import { signOut } from "firebase/auth";
import {auth} from "../firebase/config.ts";

export default function Signout(){
    const navigate = useNavigate();
    const setIsLogged = useSetRecoilState(isLogged);
    async function signoutHandler(){
        signOut(auth).then(()=>{
            if(setIsLogged) setIsLogged(false);
            navigate('/')
        }).catch(err=>{
            console.log("error while signout:", err);
        })
    }

    return (
        <div className="relative flex min-h-screen flex-col justify-center overflow-hidden py-6 sm:py-12">
            <div
                className="relative dark:border-amber-50 dark:border px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10">
                <div>
                    Are you sure you want to signout?
                </div>
                <button onClick={signoutHandler}>
                    Yes
                </button>
            </div>
        </div>
    )
}