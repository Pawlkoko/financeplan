export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const userId = req.body.user_id;

    if (!userId) {
        return res.status(400).json({ error: 'Missing user_id' });
    }

    try {
        const formData = new URLSearchParams();
        formData.append("mode", "subscription");
        formData.append("success_url", "https://finapla.pl/sukces?session_id={CHECKOUT_SESSION_ID}");
        formData.append("cancel_url", "https://finapla.pl/anulowano");
        formData.append("payment_method_types[]", "card");
        formData.append("line_items[0][price]", "price_1RhrSM4MqzigOuZtIldteDe8");
        formData.append("line_items[0][quantity]", "1");
        formData.append("metadata[user_id]", userId);

        const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${stripeSecret}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        const data = await response.json();

        if (!data.url) {
            return res.status(500).json({ error: "❌ Brak checkout_url.", details: data });
        }

        res.status(200).json({ checkout_url: data.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
