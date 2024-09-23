import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import CreateProfile from "./components/employee/create"
import ReadProfile from "./components/employee/read"
import UpdateProfile from "./components/employee/update"
import EmployeeProfile from "./pages/EmployeeProfile"
import CreateProject from "./components/task/create"
import ProjectList from "./components/task/read"
import ProjectDetail from "./components/task/details"
import UpdateProject from "./components/task/update"
import ProjectCalendar from "./components/task/calendar"
import NotificationModal from "./components/NotificationModal"


function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {/* <Navbar /> */}
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/create-profile" 
          element={
            <ProtectedRoute>
              <CreateProfile />
            </ProtectedRoute>
            } 
        />
        <Route 
          path="/view-profile" 
          element={
            <ProtectedRoute>
              <ReadProfile />
            </ProtectedRoute>
            } 
        />
        <Route 
          path="/update-profile" 
          element={
            <ProtectedRoute>
              <UpdateProfile />
            </ProtectedRoute>
            } 
        />
        <Route 
          path="/create-project" 
          element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
            } 
        />
        <Route 
          path="/view-project" 
          element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
            } 
        />
        <Route 
          path="/detail-project/:id" 
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
            } 
        />
        <Route 
          path="/update-project/:id" 
          element={
            <ProtectedRoute>
              <UpdateProject />
            </ProtectedRoute>
            } 
        />
        <Route 
          path="/calendar-project" 
          element={
            <ProtectedRoute>
              <ProjectCalendar />
            </ProtectedRoute>
            } 
        />
        <Route 
          path="/notification" 
          element={
            <ProtectedRoute>
              <NotificationModal />
            </ProtectedRoute>
            } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
