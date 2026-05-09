import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Home } from "./pages/Home";
import { MyPage } from "./pages/MyPage";
import { Onboarding } from "./pages/Onboarding";
import { Recruitment } from "./pages/Recruitment";
import { Recommendation } from "./pages/Recommendation";
import { TeamMatching } from "./pages/TeamMatching";
import { Schedule } from "./pages/Schedule";
import { Chat } from "./pages/Chat";
import { Promotion } from "./pages/Promotion";
import { AiMatching } from "./pages/AiMatching";
import { PortfolioFeedback } from "./pages/PortfolioFeedback";
import { Events } from "./pages/Events";
import { Mentors } from "./pages/Mentors";
import { Board } from "./pages/Board";
import { Clubs } from "./pages/Clubs";
import { Community } from "./pages/Community";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="mypage" element={<MyPage />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="coins" element={<MyPage />} />
          <Route path="events" element={<Events />} />
          <Route path="clubs" element={<Clubs />} />
          <Route path="board" element={<Board />} />
          <Route path="community" element={<Community />} />
          <Route path="mentors" element={<Mentors />} />
          <Route path="mentors/request" element={<Mentors />} />
          <Route path="mentors/schedule" element={<Schedule />} />
          <Route path="mentors/chat" element={<Chat />} />
          <Route path="ai-matching" element={<AiMatching />} />
          <Route path="ai-match" element={<AiMatching />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="chat" element={<Chat />} />
          <Route path="recruitment" element={<Recruitment />} />
          <Route path="recommendation" element={<Recommendation />} />
          <Route path="contests" element={<Recommendation />} />
          <Route path="team-matching" element={<TeamMatching />} />
          <Route path="teams" element={<TeamMatching />} />
          <Route path="studies" element={<Recruitment />} />
          <Route path="promotion" element={<Promotion />} />
          <Route path="portfolio" element={<PortfolioFeedback />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
