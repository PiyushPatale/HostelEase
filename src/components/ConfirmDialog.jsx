import { toast } from "react-hot-toast";
import React from "react";

export const showConfirmDialog = (message, onConfirm) => {
  const ConfirmComponent = ({ t }) => {
    const handleConfirmClick = async () => {
      toast.dismiss(t.id);
      await onConfirm();
    };

    const handleCancelClick = () => {
      toast.dismiss(t.id);
    };

    return (
      <div className={`custom-toast ${t.visible ? 'show' : ''}`}>
        <h3>Are you sure?</h3>
        <p>{message}</p>
        <div className="toast-buttons">
          <button className="cancel-btn" onClick={handleCancelClick}>
            Cancel
          </button>
          <button className="delete-btn" onClick={handleConfirmClick}>
            Confirm
          </button>
        </div>
      </div>
    );
  };

  toast.custom((t) => <ConfirmComponent t={t} />);
};
