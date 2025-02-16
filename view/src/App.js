import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

import Login from './components/Login';
import Profile from './components/Profile';
import UnAuth from './components/UnAuth';
import Sidebar from "./components/Sidebar";
import Header from './components/Header';
import Home from './components/Home';
import Admin from './components/Admin';
import Partner from './components/Partner';
import Normal from './components/Normal';
import FulltimeCaptain from './components/FulltimeCaptain';
import FreelanceCaptain from './components/FreelanceCaptain';
import Car from './components/Car';
import Inventory from './components/Inventory';
import Ticket from './components/Ticket';
import Reward from './components/Reward';
import NormalOrder from './components/NormalOrder';
import FastOrder from './components/FastOrder';
import Footer from "./components/Footer";
import ProtectedRoute from './components/ProtectedRoutes';

function AppContent() {
  const location = useLocation();
  const noLayoutPaths = ["/login", "/unAuth"];
  const shouldShowLayout = !noLayoutPaths.includes(location.pathname);

  return (
    <>
      {shouldShowLayout ? (
        <div className="wrapper">
          <Sidebar />
          <div className='main-panel'>
            <Header />
            <div className="main-area" style={{ minHeight: "80vh" }}>
              <Routes>
                <Route path="/" element={<ProtectedRoute component={Home} rolesRequired={["Admin","Accountant", "Dispatcher", "HR", "StoreKeeper", "SupportTeam"]} />} />
                <Route path="/profile" element={<ProtectedRoute component={Profile} rolesRequired={["Admin","Accountant", "Dispatcher", "HR", "StoreKeeper", "SupportTeam"]} />} />
                <Route path="/admin" element={<ProtectedRoute component={Admin} rolesRequired={["Admin"]} />} />
                <Route path="/partners" element={<ProtectedRoute component={Partner} rolesRequired={["Admin", "HR"]} />} />
                <Route path="/normalUsers" element={<ProtectedRoute component={Normal} rolesRequired={["Admin", "HR"]} />} />
                <Route path="/FulltimeCaptains" element={<ProtectedRoute component={FulltimeCaptain} rolesRequired={["Admin", "HR", "Dispatcher"]} />} />
                <Route path="/FreelanceCaptains" element={<ProtectedRoute component={FreelanceCaptain} rolesRequired={["Admin", "HR", "Dispatcher"]} />} />
                <Route path="/cars" element={<ProtectedRoute component={Car} rolesRequired={["Admin", "Dispatcher"]} />} />
                <Route path="/inventories" element={<ProtectedRoute component={Inventory} rolesRequired={["Admin", "StoreKeeper"]} />} />
                <Route path="/normal-orders" element={<ProtectedRoute component={NormalOrder} rolesRequired={["Admin", "Dispatcher"]} />} />
                <Route path="/fast-orders" element={<ProtectedRoute component={FastOrder} rolesRequired={["Admin", "Dispatcher"]} />} />
                <Route path="/tickets" element={<ProtectedRoute component={Ticket} rolesRequired={["Admin", "SupportTeam"]} />} />
                <Route path="/rewards" element={<ProtectedRoute component={Reward} rolesRequired={["Admin"]} />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path='/unAuth' element={<UnAuth />} />
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;