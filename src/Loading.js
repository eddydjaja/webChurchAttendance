import logo from './cbmLogo.png';
import './Loading.css';
import React from 'react';
export default function Loading() {
    return (
        <div className="loadingContainer">
        <img src={logo} alt="Loading..." className="logi"/>
        {/* <p className="loading-text">Loading...</p> */}
        </div>
    );
}