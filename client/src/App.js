import { BrowserRouter, Route, Routes } from "react-router-dom";
import VideoRoom from './components/VideoRoom';

function App() {
  

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/:room/:userId" element={<VideoRoom />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
