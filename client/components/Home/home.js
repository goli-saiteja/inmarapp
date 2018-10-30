import React from 'react';

import './home.scss';
//functional component for rendering homepage
const Home = () => {
    return (
        <div>
            <div className="banner welcome">
                <div className="banner-container">
                    <div className="banner-header card">Welcome</div>
                    <div className="banner-content card">A new world all around you</div>
                </div>
            </div>
            <div className="banner cream">
                <div className="banner-header">We Are Everywhere</div>
                <div className="banner-content">
                    Transform the way you work, learn, play and connect with the world around you. Build for next generations.
                </div>
            </div>
        </div>
    )
}

export default Home;
