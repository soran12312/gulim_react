import { BrowserRouter, Route, Routes } from "react-router-dom";
import VideoRoom from './components/VideoRoom';
import GameList from "./components/GameList";
import Sales from "./components/Sales";
import Support from "./components/Support";
import CustomerChat from "./components/CustomerChat";

function App() {
  

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/:room/:userId" element={<VideoRoom />}/>
          <Route path="/roomList" element={<GameList/>}/>
          <Route path="/sales" element={<Sales/>}/>
          <Route path="/support/data/:category" element={<Support/>}/>
          <Route path="/customerchat/:userId" element={<CustomerChat/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
