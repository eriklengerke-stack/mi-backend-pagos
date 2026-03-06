const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const app = express();

// CONFIGURACIÓN VERIFICADA: Permite que tu web hable con el servidor
app.use(cors());
app.use(express.json());

app.post('/crear-sesion-checkout', async (req, res) => {
    try {
        const { items } = req.body;
        
        const line_items = items.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100), // Stripe usa céntimos
            },
            quantity: 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: 'https://interconectadosweb.es/exito.html',
            cancel_url: 'https://interconectadosweb.es/index.html',
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error("Error Stripe:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor listo en puerto ${PORT}`));
