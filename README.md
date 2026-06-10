# 🎬 Campus Impact — Landing Page

A vibrant, animated landing page for the Campus Impact Media Innovation Challenge with Razorpay payment integration.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Then edit `.env` and add your Razorpay credentials:
```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Run the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Visit → **http://localhost:3000**

---

## 💳 Razorpay Setup

1. Create a free account at [https://razorpay.com](https://razorpay.com)
2. Go to **Settings → API Keys**
3. Generate a new API key pair
4. Copy the **Key ID** and **Key Secret** into your `.env` file

### Test Mode
Use test credentials (start with `rzp_test_`) to test payments without real money.

**Test Cards:**
- Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: `1234`

### Go Live
Switch to live credentials (`rzp_live_`) when you're ready to accept real payments.

---

## 📁 Project Structure

```
campus-impact/
├── server.js           # Express server
├── routes/
│   └── payment.js      # Razorpay API routes
├── views/
│   ├── index.html      # Main landing page
│   └── success.html    # Post-payment success page
├── public/
│   ├── css/style.css   # All styles
│   ├── js/main.js      # Animations + Razorpay JS
│   └── images/         # Add your logo here
├── .env.example        # Environment template
└── package.json
```

---

## 🎨 Features

- ✅ Full animated landing page (reel/social media theme)
- ✅ Scroll reveal animations
- ✅ Phone mockup with scrolling reel cards
- ✅ Floating film-strip decorations
- ✅ Registration form with validation
- ✅ Razorpay payment gateway (₹399)
- ✅ Payment signature verification
- ✅ Success/error modals + success page
- ✅ Mobile responsive
- ✅ Accessibility (reduced motion support)

---

## 🔧 Customization

### Change Registration Fee
In `.env`:
```
REGISTRATION_AMOUNT=39900   # in paise (₹399 = 39900)
```

### Add Your Logo
Place `logo.png` in `/public/images/`

### Add Database
In `routes/payment.js`, the `/verify` endpoint is where you'd save registration data after successful payment. Add your database calls there.

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `express` | Web server |
| `razorpay` | Payment gateway SDK |
| `dotenv` | Environment variables |
| `body-parser` | Request parsing |
| `cors` | Cross-origin support |
| `nodemon` | Dev auto-reload |

---

## 🛡️ Security Notes

- Never expose `RAZORPAY_KEY_SECRET` to the frontend
- Payment signature verification happens server-side
- Always verify payments on your server before fulfilling orders
- Add `.env` to `.gitignore` before pushing to GitHub

---

Built with ❤️ for student creators everywhere 🎬
