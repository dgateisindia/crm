import {
  createContext,
  useContext
} from "react";

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({
  value,
  children
}) {
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}