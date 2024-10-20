import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import CreateProfile from "./components/employee/create"
import ReadProfile from "./components/employee/read"
import UpdateProfile from "./components/employee/update"
import EmployeeProfile from "./pages/EmployeeProfile"
import CreateProject from "./components/project/create"
import ProjectList from "./components/project/read"
import ProjectDetail from "./components/project/details"
import UpdateProject from "./components/project/update"
import ProjectCalendar from "./components/project/calendar"
// import NotificationModal from "./components/NotificationModal"
import NotificationsPage from "./components/NotificationPage"
import CreateTask from "./components/task/create_task"
import TaskList from "./components/task/view_task"
import TaskUpdate from "./components/task/update_task"
import ViewTask from "./components/task/details_task"
import Register from "./pages/Register"
import UsersList from "./pages/UserList"
import UpdateUser from "./pages/UserUpdate"


function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

// function RegisterAndLogout() {
//   // localStorage.clear()
//   return <Register />
// }

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
          path="/messages" 
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
            } 
        />
        <Route 
          path="/task/:id/create" 
          element={
            <ProtectedRoute>
              <CreateTask />
            </ProtectedRoute>
            } 
        />
        <Route 
          path="/task/:id/list" 
          element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
            } 
        />
        <Route 
          path="/update-task/:id" 
          element={
            <ProtectedRoute>
              <TaskUpdate />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/detail-task/:id" 
          element={
            <ProtectedRoute>
              <ViewTask />
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/register" 
          element={
            <ProtectedRoute>
              <Register />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <UsersList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/update-user/:id" 
          element={
            <ProtectedRoute>
              <UpdateUser />
            </ProtectedRoute>
          } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        {/* <Route path="/register" element={<RegisterAndLogout />} /> */}
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
