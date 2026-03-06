const express = require('express');
const app = express();
const cors = require('cors');
// Carga las variables de entorno (asegúrate de tener dotenv instalado)
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(express.json());

// CONFIGURACIÓN DE CORS: Solo permite peticiones de tu dominio real
app.use(cors({
    origin: 'https://interconectadosweb.es',
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Ruta para crear la sesión de pago
app.post('/crear-sesion-checkout', async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }

        // Mapeo de productos para Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.service,
                },
                unit_amount: Math.round(item.price * 100), // Stripe requiere centavos
            },
            quantity: 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'https://interconectadosweb.es/success.html',
            cancel_url: 'https://interconectadosweb.es/cancel.html',
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error en Stripe:', error);
        res.status(500).json({ error: error.message });
    }
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});
