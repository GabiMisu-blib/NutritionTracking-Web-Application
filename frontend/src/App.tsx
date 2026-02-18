import Dashboard from "./pages/dashboard"
import DashboardPage from "./pages/dashboard"
import Domains from "./pages/Domains"
import AuthHandler from "./pages/login"
import { BrowserRouter, Route, Routes } from "react-router"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthHandler />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="domains" element={<Domains/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
