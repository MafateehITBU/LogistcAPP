import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

import Sidebar from "./components/Sidebar";
import Header from './components/Header';
import Home from './components/Home';
import User from './components/User';
import Captain from './components/Captain';
import Car from './components/Car';
import Item from './components/Item';
import Inventory from './components/Inventory';
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="wrapper">
        <Sidebar />
        <div className='main-panel'>
          <Header />

          <div className="main-area" style={{minHeight: "80vh"}}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/users" element={<User />} />
              <Route path="/captains" element={<Captain />} />
              <Route path="/cars" element={<Car />} />
              <Route path="/items" element={<Item />} />
              <Route path="/inventories" element={<Inventory />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </Router>
  );
}


export default App;
