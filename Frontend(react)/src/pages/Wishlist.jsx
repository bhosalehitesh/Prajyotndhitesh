import React from 'react';
import { useWishlist } from '../contexts/WishlistContext';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="container" style={{padding: '2rem 0'}}>
      <h1>My Wishlist</h1>
      {wishlist.length === 0 ? (
        <p>Your wishlist is empty</p>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem'}}>
          {wishlist.map((item) => (
            <div key={item.id} style={{border: '1px solid #ddd', padding: '1rem'}}>
              <img src={item.image} alt={item.name} style={{width: '100%', height: '200px', objectFit: 'cover'}} />
              <h3>{item.name}</h3>
              <p>₹{item.price}</p>
              <button onClick={() => removeFromWishlist(item.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;

