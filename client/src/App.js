import { BrowserRouter, Route, Routes } from "react-router-dom";
import VideoRoom from './components/VideoRoom';
import GameList from "./components/GameList";
import Sales from "./components/Sales";

function App() {
  

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/:room/:userId" element={<VideoRoom />}/>
          <Route path="/roomList" element={<GameList/>}/>
          <Route path="/sales" element={<Sales/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
