import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {SiteHeader} from "./components/header.tsx";
import Login from "./components/auth/loginPage.tsx";
import {RecoilRoot} from "recoil";
import Signout from "./components/auth/signoutPage.tsx";
import Home from "./components/home.tsx";
import ChatHome from "./components/chat/home.tsx";

function App() {
  // const [count, setCount] = useState(0)

  return (
      <RecoilRoot>
          <BrowserRouter>
              <SiteHeader/>
              <Routes>
                  <Route path="/" element={<Home/>}/>
                  <Route path="signin" element={<Login/>}/>
                  <Route path={"signout"} element={<Signout/>}/>
                  <Route path={"chat"} element={<ChatHome/>}/>
              </Routes>
          </BrowserRouter>
      </RecoilRoot>
  )
}

export default App
