const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Usa la variable de entorno
const app = express();

// --- CONFIGURACIÓN CORS ---
// Sustituye 'https://interconectadosweb.es' por el dominio real donde está tu index.html
const corsOptions = {
  origin: 'https://interconectadosweb.es', 
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// --- RUTA DEL BACKEND ---
// Esta ruta debe coincidir exactamente con el fetch en tu index.html
app.post('/crear-sesion-checkout', async (req, res) => {
    try {
        const { items } = req.body;

        // Aquí transformas tus productos a formato Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: { name: item.service },
                unit_amount: item.price * 100, // Stripe usa céntimos
            },
            quantity: 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'https://interconectadosweb.es/exito.html',
            cancel_url: 'https://interconectadosweb.es/cancelado.html',
        });

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
