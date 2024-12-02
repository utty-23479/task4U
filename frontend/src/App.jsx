import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Table from "./components/Table";
import "./App.css";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            {/* <Route path="/login" element={<Login></Login>}></Route> */}
            <Route path="/" element={<Login></Login>}></Route>
            <Route path="/register" element={<Register></Register>}></Route>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard>
                    <Table></Table>
                  </Dashboard>
                </ProtectedRoute>
                // <Dashboard>
                //   <Table></Table>
                // </Dashboard>
              }
            ></Route>
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
