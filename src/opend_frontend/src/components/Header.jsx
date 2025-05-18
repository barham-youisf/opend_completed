import React, { useEffect, useState } from "react";
import logo from "../../public/logo.png";
import homeImage from "../../public/home-img.png";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { opend_backend } from "../../../declarations/opend_backend";
import CURRENT_USER_ID from "../main";
import { Principal } from '@dfinity/principal';

import "../../public/main.css";
// Page components
const HomeComponent = () => (
  <div className="home-container">
    <img className="bottom-space" src={homeImage} alt="Home" />
  </div>
);

const DiscoverComponent = ({ listingGallery }) => (
  <div className="discover-container">
    {listingGallery}
  </div>
);

// Main App component
// function App() {
//   const [userNFTIds, setUserNFTIds] = useState([]);
//   const [listingGallery, setListingGallery] = useState([]);

//   async function getNFTs() {
//     const userNFTIds = await opend_backend.getOwnerNFTs(CURRENT_USER_ID);

//     console.log("User NFTs:", userNFTIds);
// setUserNFTIds(<Gallery title="Discover" ids={userNFTIds} role="collection" />);
//     // setUserNFTIds(userNFTIds);
//     // <Gallery title="Discover" ids={ids} role="collection" />

//     const listedNFTIds = await opend_backend.getListedNFTs();
//     console.log(listedNFTIds);

//     setListingGallery(<Gallery title="Discover" ids={listedNFTIds} role="discover" />);
//   }


//   useEffect(() => {
//     getNFTs();
//   }, []);

//   return (
//     <BrowserRouter>
//       <Header />
//       <MainContent userNFTIds={userNFTIds} listingGallery={listingGallery} />
//     </BrowserRouter>
//   );
// }

function App() {
  const [userNFTIds, setUserNFTIds] = useState([]);
  const [listedNFTIds, setListedNFTIds] = useState([]);

  async function getNFTs() {
    const userNFTIds = await opend_backend.getOwnerNFTs(CURRENT_USER_ID);
    console.log("User NFTs:", userNFTIds);
    setUserNFTIds(userNFTIds || []); // Ensure it's always an array

    const listedNFTIds = await opend_backend.getListedNFTs();
    console.log("Listed NFTs:", listedNFTIds);
    setListedNFTIds(listedNFTIds || []);
  }

  useEffect(() => {
    getNFTs();
  }, []);

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomeComponent />} />
        <Route
          path="/discover"
          element={
            <Gallery title="Discover" ids={listedNFTIds} role="discover" />
          }
        />
        <Route path="/minter" element={<Minter />} />
        <Route
          path="/collection"
          element={<Gallery title="My NFTs" ids={userNFTIds} role="collection" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

// Header component
function Header() {

  return (
    <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
      <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
        <div className="header-left-4"></div>
        <img className="header-logo-11" src={logo} alt="Logo" />
        <div className="header-vertical-9"></div>
        <Link to="/">
          <h5 className="Typography-root header-logo-text">OpenD</h5>
        </Link>
        <div className="header-empty-6"></div>
        <div className="header-space-8"></div>
        <NavButton to="/discover">Discover</NavButton>
        <NavButton to="/minter">Minter</NavButton>
        <NavButton to="/collection">My NFTs</NavButton>
      </div>
    </header>
  );
}

// Reusable NavButton component
function NavButton({ to, children }) {
  return (
    <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
      <Link to={to}>{children}</Link>
    </button>
  );
}

// Main content area with routes
function MainContent({ userNFTIds, listingGallery }) {
  return (
    <main className="main-content" style={{ padding: "20px", minHeight: "calc(100vh - 64px)" }}>
      <Routes>
        <Route path="/" element={<HomeComponent />} />
        <Route path="/discover" element={<DiscoverComponent listingGallery={listingGallery} />} />
        <Route path="/minter" element={<Minter />} />
        <Route path="/collection" element={<Gallery title="My NFTs" ids={userNFTIds} />} />
      </Routes>
    </main>
  );
}

export default App;