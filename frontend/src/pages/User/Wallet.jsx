import React, { useState } from "react";

const Wallet = () => {
  const [balance, setBalance] = useState(1000); // Initial balance
  const [transactions, setTransactions] = useState([
    { id: 1, type: "Deposit", amount: 500, date: "2025-01-01" },
    { id: 2, type: "Withdrawal", amount: 200, date: "2025-01-03" },
  ]);

  const handleTransaction = (type) => {
    const amount = parseInt(prompt(`Enter amount to ${type.toLowerCase()}:`), 10);
    if (isNaN(amount) || amount <= 0) return alert("Invalid amount!");

    const newBalance = type === "Deposit" ? balance + amount : balance - amount;
    if (newBalance < 0) return alert("Insufficient balance!");

    setBalance(newBalance);
    setTransactions([
      { id: transactions.length + 1, type, amount, date: new Date().toISOString().split("T")[0] },
      ...transactions,
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">User Wallet</h1>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Current Balance</h2>
          <p className="text-3xl font-bold text-green-600">${balance.toFixed(2)}</p>
        </div>
        <div className="flex justify-between mb-6">
          <button
            onClick={() => handleTransaction("Deposit")}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            Add Funds
          </button>
          <button
            onClick={() => handleTransaction("Withdrawal")}
            className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
          >
            Withdraw
          </button>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex justify-between items-center bg-gray-50 p-2 rounded border"
              >
                <span>{tx.type}</span>
                <span className="font-medium">${tx.amount.toFixed(2)}</span>
                <span className="text-gray-500 text-sm">{tx.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
