const express = require('express');
const app = express();
const stripe = require('stripe')('TU_STRIPE_SECRET_KEY'); // ¡Usa tu variable de entorno!
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.post('/crear-sesion-checkout', async (req, res) => {
  const { items } = req.body;
  
  // Aquí deberías buscar los precios en tu base de datos para evitar manipulación
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: { name: item.service },
      unit_amount: item.price * 100, // Stripe usa centavos
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: 'https://interconectadosweb.es/success',
    cancel_url: 'https://interconectadosweb.es/cancel',
  });

  res.json({ id: session.id });
});

app.listen(process.env.PORT || 3000);
