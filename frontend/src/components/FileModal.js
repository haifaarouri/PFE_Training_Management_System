import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

const FileModal = ({
  show,
  handleClose,
  selectedFile,
  urlFile,
  fileContent,
}) => {
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
        case "application/doc":
          fileTypeResult = "doc";
          break;
        case "application/docx":
          fileTypeResult = "docx";
          break;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          fileTypeResult = "docx";
          break;
        case "image/png":
          fileTypeResult = "png";
          break;
        case "image/jpeg":
          fileTypeResult = "jpeg";
          break;
        case "image/jpg":
          fileTypeResult = "jpg";
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
            {fileContent === "CV"
              ? "CV du formateur"
              : fileContent !== "Template"
              ? "Fichier sélectionné pour les spécifications techniques du matériel"
              : "Document"}
          </h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        {!urlFile ? (
          <iframe
            src={`http://localhost:8000/DocumentsTemplates/${selectedFile}`}
            width="100%"
            height="600px"
            title="PDF Viewer"
          ></iframe>
        ) : (
          <DocViewer
            prefetchMethod="GET"
            documents={docs}
            pluginRenderers={DocViewerRenderers}
          />
        )}
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
