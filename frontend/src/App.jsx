import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import StudentSupport from "./pages/StudentSupport";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student-support" element={<StudentSupport />} />
      </Routes>
      <ThemeToggle />
    </BrowserRouter>
  );
}

export default App;
