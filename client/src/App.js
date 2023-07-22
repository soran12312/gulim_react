import { BrowserRouter, Route, Routes } from "react-router-dom";
import VideoRoom from './components/VideoRoom';
import GameList from "./components/GameList";

function App() {
  

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/:room/:userId" element={<VideoRoom />}/>
          <Route path="/roomList" element={<GameList/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
