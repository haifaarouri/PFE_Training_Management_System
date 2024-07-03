import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "./imageSessionShare.css";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setImage, setMessage } from "../store/slices/shareInLinkedinSlice";

const ImageSessionShareModal = ({ show, handleClose, imageToShare }) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [imageId, setImageId] = useState("");
  const [messageToSend, setMessageToSend] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    setImageId(imageToShare?.id);
  }, [imageToShare]);

  const handleTogglePopup = () => {
    setPopupVisible(!popupVisible);
  };

  const handleLogin = () => {
    dispatch(setImage(imageId));
    dispatch(setMessage(messageToSend));
    const redirectUri = `http://localhost:3000/auth/linkedin/callback`;
    const clientId = "78qcie9wzyy5ml";
    const scope = encodeURIComponent("openid profile email w_member_social");
    const state = "YOUR_UNIQUE_STATE_STRING"; // Generate a unique state string for security
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

    window.location.href = url;
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-md"
      fullscreen="sm-down"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Partager une image d'une session</Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <div className="d-flex justify-content-center">
          <Button className="view-modal" onClick={handleTogglePopup}>
            Partager
          </Button>
        </div>
        <div className="d-flex justify-content-center">
          {popupVisible && (
            <div className="popup">
              <header>
                <span className="text-center">Partager l'image</span>
              </header>
              <div className="content">
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    type="text"
                    className="form-control"
                    id="message"
                    value={messageToSend}
                    onChange={(e) => setMessageToSend(e.target.value)}
                    placeholder="Saisir un message pour le partager avec l'image"
                  />
                </div>
                <p className="text-center">Partager avec</p>
                <ul className="icons no-bullets d-flex justify-content-center">
                  <li>
                    <a href="#">
                      <FaFacebook size={25} />
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <FaLinkedin size={25} onClick={handleLogin} />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageSessionShareModal;
