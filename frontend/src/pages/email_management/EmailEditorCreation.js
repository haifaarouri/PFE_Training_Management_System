import React, { useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Alert, Button, Form, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "../../services/axios";
import { BiSolidCategory } from "react-icons/bi";
import { FaMailBulk } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { MdAttachEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { EmailEditor } from "react-email-editor";

function EmailEditorCreation() {
  const [editorData, setEditorData] = useState("");
  const [emailType, setEmailType] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [imageAttachements, setImageAttachements] = useState([]);
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [showAttachements, setShowAttachements] = useState(false);
  const navigate = useNavigate();
  const emailEditorRef = useRef(null);
  // const [preview, setPreview] = useState(false);

  const saveDesignJson = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.saveDesign((design) => {
      console.log("saveDesign", design);
      alert("Design JSON has been logged in your developer console.");
    });
  };

  const saveDesignHtml = () => {
    emailEditorRef.current.editor.saveDesign((data) => {
      const { body } = data;
      setContent(JSON.stringify(data));
    });

    emailEditorRef.current.editor.exportHtml((data) => {
      const { design, html } = data;
      setHtmlContent(html);
    });
  };

  // const togglePreview = () => {
  //   const unlayer = emailEditorRef.current?.editor;

  //   if (preview) {
  //     unlayer?.hidePreview();
  //     setPreview(false);
  //   } else {
  //     unlayer?.showPreview("desktop");
  //     setPreview(true);
  //   }
  // };

  const onDesignLoad = (data) => {
    console.log("onDesignLoad", data);
  };

  const onReady = (unlayer) => {
    console.log("onReady", unlayer);
  };

  // const handleEditorChange = (event, editor) => {
  //   const data = editor.getData();
  //   setEditorData(data);
  //   setContent(`<!DOCTYPE html>
  //   <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  //       xmlns:o="urn:schemas-microsoft-com:office:office">

  //   <head>
  //       <meta charset="utf-8"> <!-- utf-8 works for most cases -->
  //       <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
  //       <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
  //       <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
  //       <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->

  //       <link href="https://fonts.googleapis.com/css?family=Poppins:200,300,400,500,600,700" rel="stylesheet">

  //       <!-- CSS Reset : BEGIN -->
  //       <style>
  //           /* What it does: Remove spaces around the email design added by some email clients. */
  //           /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
  //           html,
  //           body {
  //               margin: 0 auto !important;
  //               padding: 0 !important;
  //               height: 100% !important;
  //               width: 100% !important;
  //               background: #f1f1f1;
  //           }

  //           /* What it does: Stops email clients resizing small text. */
  //           * {
  //               -ms-text-size-adjust: 100%;
  //               -webkit-text-size-adjust: 100%;
  //           }

  //           /* What it does: Centers email on Android 4.4 */
  //           div[style*="margin: 16px 0"] {
  //               margin: 0 !important;
  //           }

  //           /* What it does: Fixes webkit padding issue. */
  //           table {
  //               border-spacing: 0 !important;
  //               border-collapse: collapse !important;
  //               table-layout: fixed !important;
  //               margin: 0 auto !important;
  //           }

  //           /* What it does: Uses a better rendering method when resizing images in IE. */
  //           img {
  //               -ms-interpolation-mode: bicubic;
  //           }

  //           /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
  //           a {
  //               text-decoration: none;
  //           }

  //           /* What it does: A work-around for email clients meddling in triggered links. */
  //           *[x-apple-data-detectors],
  //           /* iOS */
  //           .unstyle-auto-detected-links *,
  //           .aBn {
  //               border-bottom: 0 !important;
  //               cursor: default !important;
  //               color: inherit !important;
  //               text-decoration: none !important;
  //               font-size: inherit !important;
  //               font-family: inherit !important;
  //               font-weight: inherit !important;
  //               line-height: inherit !important;
  //           }

  //           /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
  //           .a6S {
  //               display: none !important;
  //               opacity: 0.01 !important;
  //           }

  //           /* What it does: Prevents Gmail from changing the text color in conversation threads. */
  //           .im {
  //               color: inherit !important;
  //           }

  //           /* If the above doesn't work, add a .g-img class to any image in question. */
  //           img.g-img+div {
  //               display: none !important;
  //           }

  //           /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
  //           /* Create one of these media queries for each additional viewport size you'd like to fix */

  //           /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
  //           @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
  //               u~div .email-container {
  //                   min-width: 320px !important;
  //               }
  //           }

  //           /* iPhone 6, 6S, 7, 8, and X */
  //           @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
  //               u~div .email-container {
  //                   min-width: 375px !important;
  //               }
  //           }

  //           /* iPhone 6+, 7+, and 8+ */
  //           @media only screen and (min-device-width: 414px) {
  //               u~div .email-container {
  //                   min-width: 414px !important;
  //               }
  //           }
  //       </style>
  //       <!-- CSS Reset : END -->

  //       <!-- Progressive Enhancements : BEGIN -->
  //       <style>
  //           .container {
  //               display: flex;
  //               flex-direction: column;
  //               align-items: center;
  //               width: 100%;
  //               margin: auto;
  //           }

  //           .row {
  //               width: 100%;
  //               padding: 1em 2.5em;
  //               display: flex;
  //               justify-content: center;
  //               text-align: center;
  //           }

  //           .bg_white {
  //               background-color: white;
  //           }

  //           .hero {
  //               padding: 2em 0 4em 0;
  //           }

  //           .col {
  //               padding: 0 2.5em;
  //           }

  //           .logo h1 {
  //               margin: 0;
  //           }

  //           .text {
  //               padding-bottom: 3em;
  //           }

  //           .primary {
  //               background: #17bebb;
  //           }

  //           .bg_white {
  //               background: #ffffff;
  //           }

  //           .bg_light {
  //               background: #f7fafa;
  //           }

  //           .bg_black {
  //               background: #000000;
  //           }

  //           .bg_dark {
  //               background: rgba(0, 0, 0, .8);
  //           }

  //           .email-section {
  //               padding: 2.5em;
  //           }

  //           /*BUTTON*/
  //           .btn {
  //               padding: 10px 15px;
  //               display: inline-block;
  //           }

  //           .btn.btn-primary {
  //               border-radius: 5px;
  //               background: #17bebb;
  //               color: #ffffff;
  //           }

  //           .btn.btn-white {
  //               border-radius: 5px;
  //               background: #ffffff;
  //               color: #000000;
  //           }

  //           .btn.btn-white-outline {
  //               border-radius: 5px;
  //               background: transparent;
  //               border: 1px solid #fff;
  //               color: #fff;
  //           }

  //           .btn.btn-black-outline {
  //               border-radius: 0px;
  //               background: transparent;
  //               border: 2px solid #000;
  //               color: #000;
  //               font-weight: 700;
  //             }

  //             .btn-custom {
  //               color: rgba(0, 0, 0, .3);
  //               text-decoration: underline;
  //             }

  //             h1,
  //             h2,
  //             h3,
  //             h4,
  //             h5,
  //             h6 {
  //               font-family: 'Poppins', sans-serif;
  //               color: #000000;
  //               margin-top: 0;
  //               font-weight: 400;
  //             }

  //             body {
  //               font-family: 'Poppins', sans-serif;
  //               font-weight: 400;
  //               font-size: 15px;
  //               line-height: 1.8;
  //               color: rgba(0, 0, 0, .4);
  //             }

  //             a {
  //               color: #17bebb;
  //             }

  //             /*LOGO*/

  //             .logo h1 {
  //               margin: 0;
  //             }

  //             .logo h1 a {
  //               color: #17bebb;
  //               font-size: 24px;
  //               font-weight: 700;
  //               font-family: 'Poppins', sans-serif;
  //             }

  //             /*HERO*/
  //             .hero {
  //               position: relative;
  //               z-index: 0;
  //             }

  //             .hero .text {
  //               color: rgba(0, 0, 0, .3);
  //             }

  //             .hero .text h2 {
  //               color: #000;
  //               font-size: 34px;
  //               margin-bottom: 0;
  //               font-weight: 200;
  //               line-height: 1.4;
  //             }

  //             .hero .text h3 {
  //               font-size: 24px;
  //               font-weight: 300;
  //             }

  //             .hero .text h2 span {
  //               font-weight: 600;
  //               color: #000;
  //             }

  //             .text-author {
  //               border: 1px solid rgba(0, 0, 0, .05);
  //               max-width: 50%;
  //               margin: 0 auto;
  //               padding: 2em;
  //             }

  //             .text-author img {
  //               border-radius: 50%;
  //               padding-bottom: 20px;
  //             }

  //             .text-author h3 {
  //               margin-bottom: 0;
  //             }

  //             ul.social {
  //               padding: 0;
  //             }

  //             ul.social li {
  //               display: inline-block;
  //               margin-right: 10px;
  //             }

  //             /*FOOTER*/

  //             .footer {
  //               border-top: 1px solid rgba(0, 0, 0, .05);
  //               color: rgba(0, 0, 0, .5);
  //             }

  //             .footer .heading {
  //               color: #000;
  //               font-size: 20px;
  //             }

  //             .footer ul {
  //               margin: 0;
  //               padding: 0;
  //             }

  //             .footer ul li {
  //               list-style: none;
  //               margin-bottom: 10px;
  //             }

  //             .footer ul li a {
  //               color: rgba(0, 0, 0, 1);
  //             }

  //             @media screen and (max-width: 500px) {}
  //           </style>
  //         </head>

  //         <body width="100%" style="margin: 0; padding: 0 !important; background-color: #f1f1f1;">
  //           <center style="width: 100%; background-color: #f1f1f1;">
  //             <div style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; font-family: sans-serif;">
  //             </div>
  //             <div style="max-width: 600px; margin: 0 auto;" class="email-container">
  //               <div class="container">
  //                 <div class="row bg_white">
  //                   <div class="col logo">
  //                     <h1 style="text-align: center;"><a href="#">Train Scheduler</a></h1>
  //                   </div>
  //                 </div>
  //                 <div class="row hero bg_white">
  //                   <div class="col text" style="text-align: left;">
  //                     ${data}
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           </center>
  //         </body>

  //         </html>
  //   `);
  // };

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const handleError = (err) =>
    toast.error(err, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const saveEmailTemplate = async (event) => {
    event.preventDefault();
    await csrf();

    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      saveDesignHtml();

      const formData = new FormData();
      formData.append("emailType", emailType);
      formData.append("subject", subject);
      formData.append("content", content);
      formData.append("htmlContent", htmlContent);
      if (imageAttachements.length > 0) {
        const filesArray = Array.from(imageAttachements);
        filesArray.forEach((file, index) => {
          formData.append(`imageAttachement[${index}]`, file);
        });
      }

      try {
        if (!localStorage.getItem("token")) {
          const res = await axios.post("/api/add-email-template", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (res.status === 201) {
            handleSuccess(res.data.message);
            Swal.fire(
              "Success",
              "Modèle d'e-mail enregistré avec succès !",
              "success"
            );

            setEditorData("");
            setEmailType("");
            setSubject("");
            setContent("");

            navigate("/email-templates");
          }
        } else {
          const headers = {
            "Content-Type": "multipart/form-data",
          };

          const token = localStorage.getItem("token");
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }

          const response = await axios.post(
            "/api/add-email-template",
            formData,
            {
              headers: headers,
            }
          );

          if (response.status === 201) {
            handleSuccess(response.data.message);
            Swal.fire(
              "Success",
              "Modèle d'e-mail enregistré avec succès !",
              "success"
            );

            setEditorData("");
            setEmailType("");
            setSubject("");
            setContent("");

            navigate("/email-templates");
          }
        }
      } catch (error) {
        Swal.fire(
          "Error",
          "Echec de l'enregistrement du modèle d'e-mail.",
          "error"
        );
      }
    } catch (error) {
      if (error && error.response.status === 422) {
        handleError(error.response.data.message);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Quelque chose s'est mal passé !",
        });
      }
    }
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <h4 className="card-title mb-5 mt-2">
                Etapes de création d'un nouvel modèle d'e-mail
              </h4>
              <ToastContainer />
              <Form
                onSubmit={saveEmailTemplate}
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
              >
                <Form.Group>
                  <Form.Label>Type d'e-mail</Form.Label>
                  <InputGroup className="mb-3 d-flex justify-content-center">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <BiSolidCategory
                            style={{ fontSize: "1.5em" }}
                            className="text-primary"
                          />
                        </span>
                      </div>
                    </InputGroup.Text>
                    <Form.Select
                      value={emailType}
                      onChange={(e) => setEmailType(e.target.value)}
                      required
                    >
                      <option value="">Sélectionner le type d'e-mail</option>
                      <option value="Convocation">
                        Convocation pour les participants
                      </option>
                      <option value="SessionChanges">
                        Changements dans une session
                      </option>
                      <option value="TrainerConfirmation">
                        Confirmation des formateurs
                      </option>
                      <option value="EvaluationLink">
                        Lien d'évaluation de la session
                      </option>
                      <option value="Thanking">Mail de remerciement</option>
                    </Form.Select>
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez sélectionner le type de modèle de l'e-mail !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Objet de l'e-mail</Form.Label>
                  <InputGroup className="mb-3 d-flex justify-content-center">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <FaMailBulk
                            style={{ fontSize: "1.5em" }}
                            className="text-primary"
                          />
                        </span>
                      </div>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Saisir l'objet de l'e-mail"
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir l'objet de l'e-mail !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <EmailEditor
                  ref={emailEditorRef}
                  // onLoad={()=>onLoad(<div>tempalte</div>)}
                  onReady={onReady}
                  options={{
                    projectId: 239297,
                    version: "latest",
                    appearance: {
                      theme: "modern_light",
                    },
                    tools: {
                      button: {
                        enabled: true,
                        properties: {
                          link: {
                            defaultValue:
                              "http://localhost:8000/api/track-click",
                          },
                        },
                      },
                    },
                  }}
                />
                {/* <button onClick={saveDesignHtml}>Save Design</button> */}
                {/* <Form.Group>
                  <Form.Label>Contenu de l'e-mail</Form.Label>
                  <Alert variant="info">
                    Veuillez saisir dans le contenu de l'e-mail les variables
                    qui seront remplacées par des valeurs dynamiques lors de
                    l'envoi de l'e-mail selon cette format :{" "}
                    <b>{"{nomDuVariable}"}</b>
                  </Alert>
                  <InputGroup className="mb-3 d-flex justify-content-center">
                    <div style={{ width: "100%" }}>
                      <Form.Control
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        hidden
                        required
                      />
                      <CKEditor
                        style={{ width: "150%" }}
                        editor={ClassicEditor}
                        data={editorData}
                        onChange={handleEditorChange}
                        config={{
                          // extraPlugins: [MyCustomUploadAdapterPlugin],
                          toolbar: [
                            "undo",
                            "redo",
                            "|",
                            "heading",
                            "bold",
                            "italic",
                            "underline",
                            "strikethrough",
                            "link",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "outdent",
                            "indent",
                            "|",
                            // "imageUpload",
                            "blockQuote",
                            "insertTable",
                            // "mediaEmbed",
                            // "|",
                            // "emoji",
                            // "resizeImage",
                          ],
                        }}
                      />
                    </div>
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le contenu de l'e-mail !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group> */}
                <div className="mt-5 d-flex justify-content-center">
                  <Button
                    className="btn btn-block btn-inverse-primary btn-lg font-weight-medium auth-form-btn"
                    onClick={() => setShowAttachements(!showAttachements)}
                  >
                    Ajouter des pièces jointes <MdAttachEmail size={20} />
                  </Button>
                </div>
                {showAttachements && (
                  <Form.Group className="mt-3">
                    <Form.Label>
                      Sélectionner la ou les pièce(s) jointe(s)
                    </Form.Label>
                    <InputGroup className="mb-3 d-flex justify-content-center">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setImageAttachements(e.target.files);
                        }}
                        multiple
                        // hidden
                      />
                    </InputGroup>
                  </Form.Group>
                )}
                <div className="mt-5 d-flex justify-content-center">
                  <Button
                    type="submit"
                    className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  >
                    Enregister
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailEditorCreation;
