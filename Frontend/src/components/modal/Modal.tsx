import React, { useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  // Controls visibility of the modal
  isOpen: boolean;
  // Callback triggered when modal should close
  onClose: () => void;
  // Title displayed in the modal header
  title: string;
  // Content rendered inside the modal body
  children: React.ReactNode;
}

/**
 * Modal Component
 *
 * A reusable modal dialog that:
 * - Locks background scroll when open
 * - Closes on overlay click or Escape key
 * - Prevents click propagation inside modal content
 *
 * @component
 *
 * @param {ModalProps} props - Modal configuration props
 * @returns {JSX.Element | null} Modal UI when open, otherwise null
 *
 * @example
 * <Modal isOpen={isOpen} onClose={handleClose} title="Confirm Delete">
 *   <p>Are you sure?</p>
 * </Modal>
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    // Handles Escape key press to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);

      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      // Restore scrolling
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Do not render anything if modal is closed
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} tabIndex={-1}>
        <div className={styles.modalHeader}>
          <h3 id="modal-title">{title}</h3>

          <button className={styles.closeIcon} onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
