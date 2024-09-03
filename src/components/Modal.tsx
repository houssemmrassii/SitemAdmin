import React from 'react';
import Modal from 'react-bootstrap/Modal';
import './myModal.css';
//import 'bootstrap/dist/css/bootstrap.min.css';
import EmojiMessage from '../assets/images/EmojiMessage.png'
interface MyModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
}

const MyModal: React.FC<MyModalProps> = ({ show, handleClose, handleConfirm }) => {
  return (
    <>
      <Modal show={show} onHide={handleClose} centered backdrop={false} className="modal-out">
        <div className="modal-contenu custom-contenu">
          <div className="header-modal">
            <img src={EmojiMessage} alt="Emoji" className="modalimg" />
            <p id="title">Confirmation</p>
          </div>
          <div className="body-modal">
            <p>Une commande avec les mêmes détails existe déjà. Voulez-vous la confirmer à nouveau ?</p>
          </div>
          <div className="modal-footer">
            <button className="action-button" onClick={handleClose}>Non merci</button>
            <button className="action-button confirm-button" onClick={handleConfirm}>Confirmer</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MyModal;

