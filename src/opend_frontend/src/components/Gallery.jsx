

import React, { useEffect, useState } from "react";
import Item from "./Item";
import { Principal } from "@dfinity/principal";

function Gallery(props) {
  const [items, setItems] = useState([]);

  function fetchNFTs() {
    if (props.ids !== undefined && props.ids.length > 0) {
      const nftItems = props.ids.map((NFTid) => (
        <Item id={NFTid} key={NFTid.toText()} role={props.role} />
      ));
      setItems(nftItems);
    }
  }

  useEffect(() => {
    fetchNFTs();
  }, [props.ids]); // Re-run when ids change

  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{props.title}</h3>
      <div className="disGrid-root disGrid-container disGrid-spacing-xs-2">
        <div className="disGrid-root disGrid-item disGrid-grid-xs-12">
          <div className="disGrid-root disGrid-container disGrid-spacing-xs-5 disGrid-justify-content-xs-center">
            {items.length > 0 ? items : <p>No NFTs to display</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;