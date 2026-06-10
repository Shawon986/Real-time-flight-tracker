import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);
const CartDispatch = createContext(null);

const STORAGE_KEY = 'ft_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function cartReducer(state, action) {
  let next;
  switch (action.type) {
    case 'ADD': {
      const exists = state.find(i => i.flightId === action.item.flightId);
      if (exists) {
        next = state.map(i =>
          i.flightId === action.item.flightId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        next = [...state, { ...action.item, quantity: 1, addedAt: Date.now() }];
      }
      break;
    }
    case 'REMOVE':
      next = state.filter(i => i.flightId !== action.flightId);
      break;
    case 'UPDATE_QTY':
      next = state.map(i =>
        i.flightId === action.flightId
          ? { ...i, quantity: Math.max(1, action.quantity) }
          : i
      );
      break;
    case 'CLEAR':
      next = [];
      break;
    default:
      return state;
  }
  saveCart(next);
  return next;
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], loadCart);
  useEffect(() => { saveCart(cart); }, [cart]);
  return (
    <CartContext.Provider value={cart}>
      <CartDispatch.Provider value={dispatch}>
        {children}
      </CartDispatch.Provider>
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

export function useCartDispatch() {
  return useContext(CartDispatch);
}

export function useCartTotal() {
  const cart = useCart();
  return cart.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
}

export function useCartCount() {
  const cart = useCart();
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}
