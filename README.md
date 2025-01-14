# DevPay Connect

[![Demo Video](https://img.shields.io/badge/Demo-Video-blue)](https://youtu.be/zPfiv-anGV0) [![GitHub](https://img.shields.io/github/stars/krishaga/devpay-connect?style=social)](https://github.com/krishaga/devpay-connect)

## 🚀 Overview
DevPay Connect is a decentralized platform that connects developers with customers for **instant video calls** and **crypto payments**. It enables developers to set hourly rates, accept payments via **MetaMask**, and ensure secure transactions. Payments are held in escrow until the call ends, after which the client finalizes the payment.

## 🌟 Features
- 🔹 **Instant Developer Booking** - Customers can instantly book available developers.
- 🔹 **Video Call Integration** - Built-in video calls using **ZegoCloud**.
- 🔹 **Crypto Payments** - Payments held in escrow until the call ends, then authorized via **MetaMask**.
- 🔹 **Developer Profiles** - Devs can set availability, rates, and profiles.
- 🔹 **Real-time Booking System** - Ensures smooth scheduling and availability.

## 🔧 Tech Stack
- **Frontend:** Next.js, TypeScript, TailwindCSS
- **Backend:** Supabase (Database & Auth)
- **Video Call:** ZegoCloud
- **Payments:** MetaMask (Crypto Payments)

## 📌 Installation

### Prerequisites
- **Node.js** (v16+ recommended)
- **Yarn or npm**
- **MetaMask Wallet Extension**

### Steps
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/krishaga/devpay-connect.git
   cd devpay-connect
   ```

2. **Install Dependencies:**
   ```bash
   yarn install  # or npm install
   ```

3. **Setup Environment Variables:**
   Create a `.env.local` file and add necessary API keys (check `.env.example`).

4. **Run the Development Server:**
   ```bash
   yarn dev  # or npm run dev
   ```

5. **Open in Browser:**
   Navigate to `http://localhost:3000`.
 
## 🛠 Usage
1. **Sign up/Login** using **Supabase Auth**.
2. **Set Developer Availability & Rates**.
3. **Customers Browse & Book Devs**.
4. **Start Video Call** upon booking confirmation.
5. **Payment Escrow** until call completion.
6. **Client Authorizes Payment via MetaMask**.

## 📜 API & Configuration
- **Supabase:** Used for user authentication & database management.
- **ZegoCloud API:** Manages video call functionality.
- **MetaMask & Web3.js:** Handles crypto transactions securely.

## 📌 Contributing
1. Fork the repo & create a feature branch.
2. Commit changes & submit a pull request.
3. Follow the contribution guidelines in `CONTRIBUTING.md` (if applicable).

## 📝 License
This project is licensed under the **MIT License**.

---

## 📞 Contact & Support
- **GitHub Issues:** [Report a Bug](https://github.com/krishaga/devpay-connect/issues)
- **Twitter:** [@yourhandle](https://twitter.com/yourhandle)
- **Email:** akkirat@gmail.com

🚀 *Built with ❤️ by the DevPay Connect team!*

