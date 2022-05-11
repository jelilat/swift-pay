import React, { useState, useEffect } from 'react';
import './Header.css';
import logo from '../assets/swiftpay.png';
import near from 'near-api-js';
import { login, logout } from '../utils';

export default function Header() {
    const [accountId, setAccountId] = useState('');
    
    useEffect(() => {
        const account = window.walletConnection.getAccountId();
        setAccountId(account);
    }, []);

    return(
        <>
            <div className="header">
                {/* <img src={logo} alt="SwiftPay" className="logo" /> */}
                <div className="menu">
                    <a href="#">Dashboard</a>
                    <a href="#instant">Instant payment</a>
                    <a href="#link" onClick={() => {
                        link.click();
                    }}>Payment Link</a>
                    <a href="#">Payroll</a>
                    {accountId && 
                        <p className="accountId">{accountId}</p>
                        }
                    {accountId ? 
                        <button onClick={logout}>Logout</button>
                        : <button onClick={() => {
                            login();
                            setAccountId(window.walletConnection.getAccountId());
                        }} className="">Login</button>
                    }
                </div>
            </div>
        </>
    )
}