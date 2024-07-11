import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

import { CodeiumEditor } from "@codeium/react-code-editor";

const AddExecuteScriptModal = ({ show, handleClose, onSubmit, initialTitle, initialLanguage, initialScript, initialArgumentsList }) => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');
  const [script, setScript] = useState('');
  const [argumentsList, setArgumentsList] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (show) {
      setTitle(initialTitle);
      setLanguage(initialLanguage);
      setScript(initialScript);
      setArgumentsList(initialArgumentsList);
      validateForm(initialTitle, initialLanguage, initialScript);
    }
  }, [show, initialTitle, initialLanguage, initialScript, initialArgumentsList]);

  const handleArgumentsChange = (value) => {
    const args = value.split('\n').map(line => line.trim()).filter(line => line !== '');
    setArgumentsList(args);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    validateForm(newTitle, language, script);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    validateForm(title, newLanguage, script);
  };

  const handleScriptChange = (value) => {
    setScript(value);
    validateForm(title, language, value);
  };

  const validateForm = (title, language, script) => {
    const isValid = title.trim() !== '' && language.trim() !== '' && script.trim() !== '';
    setIsFormValid(isValid);
  };

  const handleAdd = () => {
    const scriptData = { title, language, script, argumentsList };
    onSubmit(scriptData);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
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
              onChange={handleTitleChange}
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlSelect1">
            <Form.Label>Language</Form.Label>
            <Form.Select
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="">Select Language</option>
              <option value="shell">Shell/Bash</option>
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
              onChange={handleScriptChange}
              logo={<></>}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea2">
            <Form.Label>Arguments</Form.Label>
            <CodeiumEditor
              language="text"
              theme="vs-dark"
              value={argumentsList ? argumentsList.join('\n') : ''}
              onChange={handleArgumentsChange}
              logo={<></>}
            />
          </Form.Group>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleAdd} disabled={!isFormValid}>
              Add/Edit
            </Button>
          </Modal.Footer>

        </Form>
      </Modal.Body>

    </Modal>
  );
};

export default AddExecuteScriptModal;
