import React, { useState , useEffect } from "react";
import toast from "react-hot-toast";
import { createRazorpayWallet, verifyRazorpayWallet , getWallet} from "../../api/user.api";
import { useNavigate } from "react-router-dom";



const Wallet = () => {
  const navigate=useNavigate();
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const [wallet,setWallet]=useState({
    amount:0
  })
  const[user,setUser]=useState({})
  const [amount, setAmount] = useState(1);

  const [transactions, setTransactions] = useState([
    // { id: 1, type: "Debit",status: "pending", amount: 500, date: "2025-01-01" },
    // { id: 2, type: "Credit",status: "success", amount: 200, date: "2025-01-03" },
  ]);

  useEffect(()=>{
  
    fetchData()
  },[])

  const fetchData = async()=>{
    try{
      const response = await getWallet()
      setWallet(response.wallet)
      setTransactions(response.wallet.transactionHistory)
      setUser(response.userData)
  
    }
    catch(error){
      toast.error(error.message)
    }
      
    
  }

  useEffect(() => {
    // Dynamically load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);



  // const handleTransaction = (type) => {
  //   const amount = parseInt(prompt(`Enter amount to ${type.toLowerCase()}:`), 10);
  //   if (isNaN(amount) || amount <= 0) return alert("Invalid amount!");

  //   const newBalance = type === "Deposit" ? balance + amount : balance - amount;
  //   if (newBalance < 0) return alert("Insufficient balance!");

  //   setBalance(newBalance);
  //   setTransactions([
  //     { id: transactions.length + 1, type, amount, date: new Date().toISOString().split("T")[0] },
  //     ...transactions,
  //   ]);
  // };

  const handleRazorpayPayment = async () => {
    try {
      // Create Razorpay order
      const { success, order } = await createRazorpayWallet(amount);
  
      if (!success) {
        toast.error('Error creating payment order');
        return;
      }
      
      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'MiniPitstop',
        description: 'Payment to add funds to wallet',
        order_id: order.id,
        handler: async function (response) {
          try {
          
  
            // Verify payment
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount:Number(amount),
            };
          
  
            const verificationResult = await verifyRazorpayWallet(verifyData);

  
            
            if (verificationResult.success) {
              toast.success('Payment successful and funds added to wallet!');
              setTimeout(() => {
                fetchData();
              }, 500); // Delay fetchData() slightly
            
            } else {
              toast.error(verificationResult.message || 'Payment verification failed');
            }
          } catch (error) {
            //('Payment verification error:', error);
            toast.error(error?.message || 'Error verifying payment');
          }
        },
        prefill: {
          name: user.fullName,
          contact: user.contact,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function () {
     
            
        
            toast.info('Payment was not completed. Please try again.');
          },
        },
      };
  
      // Open Razorpay payment popup
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      //('Razorpay payment error:', error);
      toast.error('Error initiating payment. Please try again.');
    }
  };

  return (
   
      <div className="user-glass-effect shadow-md rounded-lg p-6 w-full max-w-md ">
        <h1 className="text-2xl font-bold text-center mb-4">User Wallet</h1>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Current Balance</h2>
          <p className="text-3xl font-bold text-green-600">Rs{(wallet?.amount || 0).toFixed(2)}</p>
        </div>
        <div className="flex justify-between  mb-6" >
        <input 
  type="number" 
  value={amount} 
  onChange={(e) => setAmount(Math.max(1, e.target.value))} 
  min="1"
  className="border p-2 rounded" 
/>
          <button
            onClick={handleRazorpayPayment}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            Add Funds
          </button>
        
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className={`border-t ${tx.status === 'success' ? 'bg-green-50' : tx.status === 'failed' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                    <td className="px-4 py-2">
                      <span className={`capitalize ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-medium">
                        ₹{(tx?.amount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`capitalize px-2 py-1 rounded-full text-xs ${
                        tx.status === 'success' ? 'bg-green-100 text-green-800' :
                        tx.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {new Date(tx.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No transactions found
              </div>
            )}
          </div>
        </div>
      </div>
    
  );
};

export default Wallet;
