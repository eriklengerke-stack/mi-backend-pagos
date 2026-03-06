const express = require('express');
const cors = require('cors');
// IMPORTANTE: Aquí va tu CLAVE SECRETA (sk_live_...). ¡Nunca la compartas!
const stripe = require('stripe')('sk_live_TU_CLAVE_SECRETA_AQUI_REEMPLAZAR'); 

const app = express();

// Middlewares
app.use(express.json()); // Para poder leer el JSON que envía el carrito
app.use(cors()); // Para permitir que tu HTML se conecte a este servidor

app.post('/crear-sesion-checkout', async (req, res) => {
    try {
        const { items } = req.body; // Recibimos el carrito desde el HTML

        // 1. Transformar los ítems del carrito al formato que Stripe requiere
        const lineItems = items.map(item => {
            return {
                price_data: {
                    currency: 'eur', // Moneda: Euros
                    product_data: {
                        name: item.service, // Nombre del servicio (ej: "Tienda Online")
                    },
                    // Stripe procesa los pagos en céntimos, por eso multiplicamos por 100
                    // Ej: 799€ se envían como 79900
                    unit_amount: item.price * 100, 
                },
                quantity: 1, // Suponemos 1 unidad por servicio
            };
        });

        // 2. Crear la sesión de pago segura en Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment', // 'payment' para pagos únicos, 'subscription' para recurrentes
            
            // 3. URLs de redirección (Reemplaza con tu dominio real)
            success_url: 'https://interconectadosweb.es/exito.html', 
            cancel_url: 'https://interconectadosweb.es/carrito.html',
        });

        // 4. Enviar el ID de la sesión de vuelta al HTML
        res.json({ id: session.id });

    } catch (error) {
        console.error("Error al crear sesión de Stripe:", error);
        res.status(500).json({ error: error.message });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de pagos corriendo en el puerto ${PORT}`);
});