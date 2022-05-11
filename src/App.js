import React from 'react';
import hero from './assets/swiftpay-hero.png';
import './global.css';
import Header from './Components/Header';
import CreatePayment from './Components/CreatePayment';
import getConfig from './config'

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

function App() {
  return (
    <div className="App">
      <Header />
      <div className="hero">
        <div className="hero-text">
          <h1 style={{fontSize: '3em'}}>Payroll solution built for Web3 champions</h1>
          <p style={{fontSize: '1.3em'}}>We are simplifying payroll and benefits. Whether you are a big multi-national, freelancer, or an individual, start receiving & sending payments with ease.</p>
        </div>
        <div><img src={hero} alt="SwiftPay" className="hero-image" /></div>
      </div>
      <CreatePayment />
    </div>
  );
}

export default App;
