'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';

type CartState = {
  quantity: number;
  pulseKey: number;
};

type CartAction =
  | { type: 'set'; quantity: number }
  | { type: 'increment'; delta?: number }
  | { type: 'decrement'; delta?: number };

type CartContextValue = CartState & {
  dispatchCart: Dispatch<CartAction>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  initialQuantity,
}: {
  children: ReactNode;
  initialQuantity: number;
}) {
  const quantity = sanitizeQuantity(initialQuantity);
  const [state, dispatchCart] = useReducer(cartReducer, {
    quantity,
    pulseKey: quantity,
  });

  useEffect(() => {
    dispatchCart({ type: 'set', quantity: initialQuantity });
  }, [initialQuantity]);

  return (
    <CartContext.Provider value={{ ...state, dispatchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  if (action.type === 'set') {
    const quantity = sanitizeQuantity(action.quantity);

    if (quantity === state.quantity) {
      return state;
    }

    return { ...state, quantity };
  }

  if (action.type === 'decrement') {
    return {
      ...state,
      quantity: Math.max(0, state.quantity - sanitizeDelta(action.delta)),
    };
  }

  return {
    quantity: state.quantity + sanitizeDelta(action.delta),
    pulseKey: state.pulseKey + 1,
  };
}

function sanitizeQuantity(quantity: number) {
  return Math.max(0, Math.floor(quantity));
}

function sanitizeDelta(delta = 1) {
  return Math.max(1, Math.floor(delta));
}
