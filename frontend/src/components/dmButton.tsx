import {Link} from "react-router-dom";

export default function DmButton(){
    return <div className="w-1/4 bg-green-500">
        <Link to={"chat"} className="w-1/4 bg-cyan-500">DM this fucker</Link>
    </div>
}