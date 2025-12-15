import React from 'react';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  return (
    <div className="container" style={{padding: '2rem 0'}}>
      <h1>Shopping Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} style={{display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd'}}>
              <img src={item.image} alt={item.name} style={{width: '100px', height: '100px', objectFit: 'cover'}} />
              <div style={{flex: 1}}>
                <h3>{item.name}</h3>
                <p>₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}</p>
                <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  <button onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
          <div style={{marginTop: '2rem', padding: '1rem', background: '#f5f5f5'}}>
            <h2>Total: ₹{getCartTotal()}</h2>
            <button onClick={clearCart}>Clear Cart</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

