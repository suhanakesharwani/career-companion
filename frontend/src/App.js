
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'

import LandingPage from "./components/Core/Landing/LandingPage";
import Register from "./components/AuthForm/Register/Register";
import Login from "./components/AuthForm/Login/Login";
import Home from "./components/Core/Home/Home";
import ResumeMatcher from "./components/Matching/ResumeMatcher";
import JobTracker from "./components/Jobs/JobTracker";
import InterviewPrep from "./components/InterviewPrep/InterviewPrep";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AiInterview from "./components/AiInterview/AiInterview";
function App() {
  

  return (
    <>
    {/* <Connect/> */}
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔒 Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/matcher"
          element={
            <ProtectedRoute>
              <ResumeMatcher />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <JobTracker />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview-prep"
          element={
            <ProtectedRoute>
              <InterviewPrep />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-interview"
          element={
            <ProtectedRoute>
              <AiInterview />
            </ProtectedRoute>
          }
        />


        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </Router>



    </>
  )
}

export default App