import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function ExpenseTracker() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);

  const [formData, setFormData] = useState({
    crop: "",
    expenseType: "",
    amount: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/expense"
      );

      setExpenses(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/expense",
        formData
      );

      setFormData({
        crop: "",
        expenseType: "",
        amount: "",
      });

      fetchExpenses();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/expense/${id}`
      );

      fetchExpenses();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="expense-page">
      <div className="expense-card">

        <div className="expense-header">
          <h1 className="expense-title">
            💰 Expense Tracker
          </h1>

          <button
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </button>
        </div>

        <form
          className="expense-form"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Crop"
            value={formData.crop}
            onChange={(e) =>
              setFormData({
                ...formData,
                crop: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Expense Type"
            value={formData.expenseType}
            onChange={(e) =>
              setFormData({
                ...formData,
                expenseType: e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: e.target.value,
              })
            }
          />

          <button
            type="submit"
            className="expense-btn"
          >
            Add Expense
          </button>
        </form>

        <div className="expense-list">
          {expenses.map((expense) => (
            <div
              key={expense._id}
              className="expense-item"
            >
              <div>
                <h3>{expense.crop}</h3>

                <p>{expense.expenseType}</p>

                <p>₹{expense.amount}</p>
              </div>

              <button
                className="delete-btn"
                onClick={() =>
                  deleteExpense(expense._id)
                }
              >
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default ExpenseTracker;