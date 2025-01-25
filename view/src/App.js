import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

import Login from './components/Login';
import UnAuth from './components/UnAuth';
import Sidebar from "./components/Sidebar";
import Header from './components/Header';
import Home from './components/Home';
import User from './components/User';
import Captain from './components/Captain';
import Car from './components/Car';
import Item from './components/Item';
import Inventory from './components/Inventory';
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
                <Route path="/users" element={<ProtectedRoute component={User} roleRequired="admin" />} />
                <Route path="/captains" element={<ProtectedRoute component={Captain} roleRequired="admin" />} />
                <Route path="/cars" element={<ProtectedRoute component={Car} roleRequired="admin"/>} />
                <Route path="/items" element={<ProtectedRoute component={Item} roleRequired="admin" />} />
                <Route path="/inventories" element={<ProtectedRoute component={Inventory} roleRequired="admin" />} />
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