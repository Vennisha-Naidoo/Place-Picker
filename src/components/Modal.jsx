import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

function Modal({ open, children, onClose }) {
  const dialog = useRef();

  //This useEffect is to synchronise the code - allowing the code to execute AFTER the Modal component executes
  //The useEffect should run every time the component function is executed, if one of the dependencies change
  useEffect(() => {
    if (open) {
      dialog.current.showModal();
    } else {
      dialog.current.close();
    }
  }, [open]);

  return createPortal(
    <dialog className="modal" ref={dialog} onClose={ onClose }>
      {children}
    </dialog>,
    document.getElementById('modal')
  );
}

export default Modal;
