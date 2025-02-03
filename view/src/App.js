import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate} from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

import Login from './components/Login';
import UnAuth from './components/UnAuth';
import Sidebar from "./components/Sidebar";
import Header from './components/Header';
import Home from './components/Home';
import Partner from './components/Partner';
import Normal from './components/Normal';
import FulltimeCaptain from './components/FulltimeCaptain';
import FreelanceCaptain from './components/FreelanceCaptain';
import Car from './components/Car';
import Inventory from './components/Inventory';
import Ticket from './components/Ticket';
import Reward from './components/Reward';
import Order from './components/Order';
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
                <Route path="/" element={<ProtectedRoute component={Home} roleRequired="admin" />} />
                <Route path="/partners" element={<ProtectedRoute component={Partner} roleRequired="admin" />} />
                <Route path="/normalUsers" element={<ProtectedRoute component={Normal} roleRequired="admin" />} />
                <Route path="/FulltimeCaptains" element={<ProtectedRoute component={FulltimeCaptain} roleRequired="admin" />} />
                <Route path="/FreelanceCaptains" element={<ProtectedRoute component={FreelanceCaptain} roleRequired="admin" />} />
                <Route path="/cars" element={<ProtectedRoute component={Car} roleRequired="admin"/>} />
                <Route path="/inventories" element={<ProtectedRoute component={Inventory} roleRequired="admin" />} />
                <Route path="/orders" element={<ProtectedRoute component={Order} roleRequired="admin" />} />
                <Route path="/tickets" element={<ProtectedRoute component={Ticket} roleRequired="admin" />} />
                <Route path="/rewards" element={<ProtectedRoute component={Reward} roleRequired="admin" />} />
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