
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'

import LandingPage from "./components/Core/Landing/LandingPage";
import Register from "./components/AuthForm/Register/Register";
import Login from "./components/AuthForm/Login/Login";
import Home from "./components/Core/Home/Home";
import ResumeMatcher from "./components/Matching/ResumeMatcher";
import JobTracker from "./components/Jobs/JobTracker";
function App() {
  

  return (
    <>
    {/* <Connect/> */}
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/home" element={<Home />} /> {/* new route */}
        <Route path="/matcher" element={<ResumeMatcher />} />
        <Route path="/jobs" element={<JobTracker />} />
      </Routes>
    </Router>



    </>
  )
}

export default App