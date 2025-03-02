import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import React from "react";

function ExpenseModal({ visible, handleClose, expense }) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="modal show"
      style={{
        display: "block",
        position: "fixed",
        zIndex: 1050,
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        overflow: "auto",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Slightly darker overlay
        backdropFilter: "blur(5px)", // Adds a blur effect for modern UI
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Modal.Dialog style={{ background: "white", borderRadius: "10px", padding: "20px", width: "90%", maxWidth: "450px" }}>
        <Modal.Header closeButton onClick={handleClose}>
          <Modal.Title style={{ fontWeight: "bold", color: "#1E3A8A" }}>
            Expense Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ fontSize: "16px", color: "#333", lineHeight: "1.8" }}>
          <p>
            <strong>👤 Member:</strong> {expense.expense_userFname}
          </p>
          <p>
            <strong>📂 Category:</strong> {expense.expense_cat}
          </p>
          <p>
            <strong>🏷️ Category Name:</strong> {expense.expense_name}
          </p>
          <p>
            <strong>📅 Date:</strong>{" "}
            {new Date(expense.expense_date.seconds * 1000).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
          <p>
            <strong>💰 Amount:</strong>{" "}
            <span style={{ color: expense.expense_type=='Outcome'? "red" : "green", fontWeight: "bold" }}>
              {expense.expense_amount.toLocaleString()} ₪
            </span>
          </p>
          <p>
            <strong>📝 Description:</strong> {expense.expense_description}
          </p>
        </Modal.Body>

        <Modal.Footer style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={handleClose} variant="primary" style={{ backgroundColor: "#3B82F6", border: "none", padding: "10px 15px", fontSize: "14px" }}>
            Close
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  );
}

export default ExpenseModal;
