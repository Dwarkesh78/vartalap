import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage(){
    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>Vartalap</h2>
                </div>
                <div className="navList">
                    <p>Join as Guest</p>
                    <p>Register</p>
                    <div role="button">
                        <p>Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1><span style={{color: "#FF9849"}}>Connect</span> with your loved ones</h1>
                    <p>Cover the distance by Vartalap</p>
                    <div role="button">
                        <Link to="/auth">Get started</Link>
                    </div>
                </div>
                <div>
                    <img src="/mobile.png"></img>
                </div>
            </div>
        </div>
        
    )
}