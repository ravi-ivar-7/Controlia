import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

import { CodeiumEditor } from "@codeium/react-code-editor";
const AddExecutionScriptModal = ({ show, handleClose, onSubmit, initialTitle, initialLanguage, initialScript }) => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');
  const [script, setScript] = useState('');

  useEffect(() => {
    if (show) {
      setTitle(initialTitle);
      setLanguage(initialLanguage);
      setScript(initialScript);
    }
  }, [show, initialTitle, initialLanguage, initialScript]);

  const handleAdd = () => {
    const scriptData = { title, language, script };
    onSubmit(scriptData);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Execution Script</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Execute server start"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlSelect1">
            <Form.Label>Language</Form.Label>
            <Form.Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="">Select Language</option>
              <option value="shell">Bash</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript/Nodejs</option>
              <option value="cpp">C++</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Script</Form.Label>
            <CodeiumEditor
              language={language}
              theme="vs-dark"
              value={script}
              onChange={(value) => setScript(value)}
              logo={<></>}
            />
          </Form.Group>

        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleAdd}>
          Add/Edit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddExecutionScriptModal;
