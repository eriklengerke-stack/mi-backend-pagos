const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

// Inicialización de Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Middleware básico
app.use(express.json());

// CONFIGURACIÓN CORS AVANZADA
// Permite tanto el dominio sin www como con www
const originesPermitidos = [
    'https://interconectadosweb.es', 
    'https://www.interconectadosweb.es'
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitimos peticiones sin 'origin' (como llamadas de herramientas de desarrollo)
        // o si el origen está en nuestra lista de permitidos
        if (!origin || originesPermitidos.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
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
