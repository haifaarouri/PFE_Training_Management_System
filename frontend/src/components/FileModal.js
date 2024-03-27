import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

const FileModal = ({ show, handleClose, selectedFile, urlFile }) => {
  const [docs, setDocs] = useState([
    {
      uri: "",
      fileType: "",
      fileName: "",
    },
  ]);

  useEffect(() => {
    if (urlFile && urlFile.imgUpload) {
      let fileTypeResult;
      switch (urlFile.fileType) {
        case "application/pdf":
          fileTypeResult = "pdf";
          break;
        default:
          fileTypeResult = "unknown";
          break;
      }

      setDocs([
        {
          uri: urlFile.imgUpload,
          fileType: fileTypeResult,
          fileName: selectedFile ? selectedFile.name : "",
        },
      ]);
    }
  }, [selectedFile, urlFile]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-lg my-special-modal-class"
      fullscreen="lg-down"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <h5 className="modal-title">
            Fichier sélectionné pour les spécifications techniques du matériel
          </h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <DocViewer documents={docs} pluginRenderers={DocViewerRenderers} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FileModal;
