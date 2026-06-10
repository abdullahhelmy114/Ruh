"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useTheme } from "next-themes";

interface PayPalButtonProps {
  amount: string; // "40.00"
  onSuccess: (details: { orderID: string; payerID: string }) => void;
}

export default function PayPalButton({ amount, onSuccess }: PayPalButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const { theme } = useTheme();

  if (!clientId) {
    return (
      <p className="text-red-500 text-sm text-center">
        PayPal Client ID غير مضبوط
      </p>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
        components: "buttons",
      }}
    >
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay",
        }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: amount } }],
          });
        }}
        onApprove={(data, actions) => {
          // يتم الالتقاط على الخادم
          onSuccess({
            orderID: data.orderID,
            payerID: data.payerID ?? "",
          });
        }}
        onError={(err) => {
          console.error("PayPal Button Error:", err);
        }}
      />
    </PayPalScriptProvider>
  );
}