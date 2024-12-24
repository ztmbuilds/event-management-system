import { Request, Response } from "express";
import crypto from "node:crypto";
import { PAYSTACK_SECRET_KEY } from "../config";
import { PaystackService } from "../services/paystack.service";

const paystackService = new PaystackService();

export async function paystackWebhookHandler(req: Request, res: Response) {
  try {
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.sendStatus(400);
    }
    res.sendStatus(200);
    await paystackService.verifyPaymentWebhook(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }
}
