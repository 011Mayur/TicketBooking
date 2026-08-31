export interface CreatePaymentOrderRequest {
  bookingId: number;
}

export interface CreatePaymentOrderResponse {
  orderId: string;
  bookingId: number;
  amount: number;
  currency: string;
  razorpayKeyId: string;
}

export interface VerifyPaymentRequest {
  bookingId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResult {
  isValid: boolean;
  message: string;
  bookingId?: number;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  config_id?: string;
  name: string;
  description?: string;
  theme?: { color?: string };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
