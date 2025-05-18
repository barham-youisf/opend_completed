import React, { useEffect, useState } from "react";
import logo from "../../public/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";
import Button from "./button";
import PriceLable from "./PriceLable";
import { opend_backend } from "../../../declarations/opend_backend";
import { idlFactory as token_backend } from "../../../declarations/token_backend";
import CURRENT_USER_ID from "../main";


function Item(props) {
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [image, setImage] = useState(""); // Default image
  const [button, setButton] = useState(null); // Button state
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");
  const [priceLable, setPriceLable] = useState();
  const [shouldDisplay, setDisplay] = useState(true);

  const id = props.id;
  let NFTActor;

  async function loadNFT() {
    try {
      // Initialize agent inside the function to ensure fresh instance
      const agent = new HttpAgent({
        host: "http://localhost:4943", // or 8000 for older dfx versions
      });

      // Fetch root key for local development, remove the following line if you deploed th code live on icp blokchaing 
      await agent.fetchRootKey();

      // Create actor with proper configuration
      NFTActor = await Actor.createActor(idlFactory, {
        agent,
        canisterId: id,
      });

      // Fetch NFT data
      const nftName = await NFTActor.getName();
      const nftOwner = await NFTActor.getOwner();
      const imageData = await NFTActor.getAsset();
      const imageContent = new Uint8Array(imageData);
      const image = URL.createObjectURL(new Blob([imageContent.buffer], { type: "image/png" }));

      setName(nftName);
      setOwner(nftOwner.toText());
      setImage(image);

      if (props.role == "collection") {
        const nftIsListed = await opend_backend.isListed(props.id);
        if (nftIsListed) {
          setOwner("OpenD");
          setBlur({ filter: "blur(4px)" });
          setSellStatus("Listed");
          setButton(<Button text="Listed" disabled={true} />); // Disable if already listed
        } else {
          setButton(<Button handleClick={handleSell} text="Sell" />); // Show Sell if not listed
        }



      } else if (props.role == "discover") {
        const originalOwner = await opend_backend.getOriginalOwner(props.id);
        if (originalOwner.toText() != CURRENT_USER_ID.toText()) {
          setButton(<Button handleClick={handleBuy} text={"Buy"} />);
        };
        const price = await opend_backend.getListedNFTPrice(props.id);
        setPriceLable(<PriceLable sellPrice={price.toString()} />)

      };

    } catch (error) {
      console.error("Error loading NFT:", error);
      setName("Error loading NFT");
    }

  }

  useEffect(() => {
    loadNFT();
  }, []);

  let price;

  function handleSell() {
    console.log("Sell button clicked for NFT:", id);
    setPriceInput(<input
      placeholder="Price in BARHAM"
      type="number"
      className="price-input"
      value={price}
      onChange={(e) => {
        price = e.target.value;
        console.log("Price set to:", price);
      }}
    />
    )

    setButton(<Button handleClick={sellNFT} text={"Confirm"} />);
  }

  async function sellNFT() {
    console.log("Selling NFT:", id.toString(), "for price:", price);

    try {
      setBlur({ filter: "blur(4px)" });
      setLoaderHidden(false);
      const listingResult = await opend_backend.listItem(props.id, Number(price));
      console.log("Listing result:", listingResult);
      alert("NFT listed for sale! " + listingResult);

      if (listingResult == "Success") {
        const opendId = await opend_backend.getOpendCanisterId();
        const transferResult = await NFTActor.transferOwnership(opendId);
        console.log("transfer: " + transferResult);

        if (transferResult == "Success") {
          setLoaderHidden(true);
          setButton(<Button text="Listed" disabled={true} />);

          setPriceInput();
          setOwner("OpenD");
          setSellStatus("Listed");
        }

      }

    } catch (error) {
      console.error("Error listing NFT:", error);
      alert("Failed to list NFT: " + error);
    }
  }



  async function handleBuy() {

    try {
      setLoaderHidden(false);
      console.log("Buy was triggered");
      // 1. Create and configure agent
      const buyAgent = new HttpAgent({ host: "http://localhost:4943" });
      await buyAgent.fetchRootKey();

      // 2. Create token actor with the CORRECT agent (buyAgent, not agent)
      const token_backend_Actor = await Actor.createActor(token_backend, {
        agent: buyAgent, // Use the agent we just created
        canisterId: Principal.fromText("wrjd4-zp777-77774-qaanq-cai"),
      });

      // 3. Get sale details
      const sellerId = await opend_backend.getOriginalOwner(props.id);
      const itemPrice = await opend_backend.getListedNFTPrice(props.id); // Fixed: use opend_backend

      // 4. Execute transfer (assuming transfer is the correct method name)
      const result = await token_backend_Actor.transfer(sellerId, itemPrice);


      if (result === "Success") {
        // alert("NFT purchased successfully!");
        const transferResult = await opend_backend.completePurchase(props.id, sellerId, CURRENT_USER_ID);
        console.log("purchase: " + transferResult);
        setLoaderHidden(true);


        // Optional: refresh the NFT state
        await loadNFT();
        setDisplay(false);
      }
    } catch (error) {
      console.error("Buy error:", error);
      alert("Failed to buy NFT: " + error);
    }
  }

  return (
    <div style={{ display: shouldDisplay ? "inline" : "none" }} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
          alt="NFT"
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLable}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;