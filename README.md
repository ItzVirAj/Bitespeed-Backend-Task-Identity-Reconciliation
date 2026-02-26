# Identity Reconciliation Service

A simple full-stack application that performs identity reconciliation based on email and phone number.

## 🛠 Tech Stack

Backend:
- Node.js
- Express
- PostgreSQL (Supabase)
- Prisma ORM

Frontend:
- React (Vite)

---

## 📌 Backend Setup

1. Navigate to backend folder:
    cd BiteSpeed

2. Install dependencies:

3. Add `.env` file:

4. Run server:

    Server runs at: https://localhost:3000


    ---

    ## 📌 API Endpoint

    ### POST `/identify`

    Example Request:

    ```json
    {
    "email": "alice@test.com",
    "phoneNumber": "123456"
    }

Example Response:

    {
    "contact": {
        "primaryContactId": 1,
        "emails": ["alice@test.com"],
        "phoneNumbers": ["123456"],
        "secondaryContactIds": [2]
    }
    }


##  📌 Frontend Setup

1. Navigate to frontend folder:
    cd idt_FE

2. Install dependencies:

    npm install

3. Start frontend:

    npm run dev

4. Frontend runs at:

    http://localhost:5173

## 🔎 How It Works

    If no existing contact → create primary

    If match found → link as secondary

    Returns consolidated identity cluster

👤 Author

Viraj Mane