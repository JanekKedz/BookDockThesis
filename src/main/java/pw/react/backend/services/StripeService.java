package pw.react.backend.services;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripeService {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret}")
    private String endpointSecret;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Create a Stripe PaymentIntent for the given amount (in cents) and currency.
     * @param amountCents amount in the smallest currency unit (e.g. 2500 for €25.00)
     * @param currency e.g. "eur" or "usd"
     * @param metadata optional metadata to attach (e.g. bookingId)
     * @return the created PaymentIntent object
     * @throws StripeException on error
     */
    public PaymentIntent createPaymentIntent(Long amountCents, String currency, Map<String, String> metadata) throws StripeException {
        // Enforce minimum amounts by currency
        if ("pln".equalsIgnoreCase(currency) && amountCents < 200) {
            amountCents = 200L; // 2.00 PLN minimum
        }

        PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency(currency)
                .addPaymentMethodType("card");

        if (metadata != null && !metadata.isEmpty()) {
            paramsBuilder.putMetadata("bookingId", metadata.get("bookingId"));
            // you can put other metadata if needed
        }

        PaymentIntentCreateParams params = paramsBuilder.build();
        return PaymentIntent.create(params);
    }
    /**
     * Verify a Stripe webhook signature and parse the Event.
     * @param payload raw JSON payload from Stripe
     * @param sigHeader value of the "Stripe-Signature" header
     * @return parsed Event object if signature is valid
     * @throws SignatureVerificationException if signature check fails
     */
    public Event constructEvent(String payload, String sigHeader) throws SignatureVerificationException {
        return Webhook.constructEvent(payload, sigHeader, endpointSecret);
    }

    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }}
