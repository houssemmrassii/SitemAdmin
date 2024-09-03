import React from 'react';
import Modal from 'react-bootstrap/Modal';
import './myModal.css';
//import 'bootstrap/dist/css/bootstrap.min.css';
import EmojiMessage from '../assets/images/EmojiMessage.png'
interface MyModalProps {
  showconf: boolean;
  handleCloseconf: () => void;
  handleConfirmconf: () => void;
}
 
const MyModalconf: React.FC<MyModalProps> = ({ showconf, handleCloseconf, handleConfirmconf }) => {
  return (
    <>
      <Modal show={showconf} onHide={handleCloseconf} centered backdrop={false} className="modal-out">
        <div className="modal-contenu custom-contenu">
          <div className="header-modal">
            <img  alt="Emoji" className="modalimg" />
            <p id="title">Confirmation de suppression</p>
          </div>
          <div className="body-modal">
          <p>Êtes-vous sûr de vouloir supprimer ?</p>
          </div>
          <div className="modal-footer">
            <button className="action-button" onClick={handleCloseconf}>Non merci</button>
            <button className="action-button confirm-button" onClick={handleConfirmconf}>Confirmer</button>
          </div>
        </div>
      </Modal>
   
    </>
  );
};
 
export default MyModalconf;
 