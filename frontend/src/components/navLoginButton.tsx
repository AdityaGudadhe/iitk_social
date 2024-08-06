import { Link } from 'react-router-dom';
import { auth } from "../firebase/config.ts";
import NavProfile from "./navProfile.tsx";
import {useRecoilValue} from "recoil";
import isLogged from "../store/atoms/isLogged.ts";

export default function LoginButton(){
    const user = auth.currentUser ;
    const isLoggedIn = useRecoilValue(isLogged);
    const displayName = user ? user.displayName : null;
    const photoUrl = user ? user.photoURL : null;
    return (
        <div className="mr-4 md:flex">
            <nav className="flex items-center gap-4 text-sm lg:gap-6">
                { isLoggedIn ? <NavProfile displayName={displayName} photoUrl={photoUrl}/> : <div>Anon</div>}
                {isLoggedIn? <Link to="/signout">
                    Logout
                </Link> : <Link to="/signin">
                    Login
                </Link>}
            </nav>
        </div>
    )
}