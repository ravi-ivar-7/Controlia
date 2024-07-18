import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

const ScheduleScriptModal = ({ show, handleClose, onSubmit, scriptData }) => {
  const [formData, setFormData] = useState({
    scheduleName: '',
    scheduleRule: '',
    scheduleType: '',
    scheduleOptions: [],
    scheduleOutputFileName: '',
    ...scriptData
  });

  useEffect(() => {
    setFormData({
      scheduleName: '',
      scheduleRule: '',
      scheduleType: '',
      scheduleOptions: [],
      scheduleOutputFileName: '',
      ...scriptData
    });
  }, [scriptData]);

  const [cronFields, setCronFields] = useState({
    second: '',
    minute: '',
    hour: '',
    dayOfMonth: '',
    month: '',
    dayOfWeek: '',
  });

  const handleRecurringSchedule = () => {
    const { second, minute, hour, dayOfMonth, month, dayOfWeek } = cronFields;
    const cronExpression = `${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    return cronExpression;
  };

  const handleAdd = () => {
    if (formData.scheduleType === 'recurring') {
      formData.scheduleRule = handleRecurringSchedule();
    }

    if (isFormValid()) {
      onSubmit(formData);
      handleClose();
    } else {
      console.log('Invalid form');
    }
  };

  const handleFieldChange = (field, value) => {
    setCronFields(prev => ({ ...prev, [field]: value }));
    setFormData(prev => ({ ...prev, scheduleRule: cronFields }));
  };

  const handleCheckboxChange = (option) => {
    setFormData(prev => {
      const options = [...prev.scheduleOptions];
      if (options.includes(option)) {
        return { ...prev, scheduleOptions: options.filter(opt => opt !== option) };
      } else {
        return { ...prev, scheduleOptions: [...options, option] };
      }
    });
  };

  const isScheduleRuleValid = () => {
    if (formData.scheduleType === 'fixed' && formData.scheduleRule) {
      return true;
    } else if (formData.scheduleType === 'recurring') {
      const { second, minute, hour, dayOfMonth, month, dayOfWeek } = cronFields;
      return (
        second.trim() !== '' ||
        minute.trim() !== '' ||
        hour.trim() !== '' ||
        dayOfMonth.trim() !== '' ||
        month.trim() !== '' ||
        dayOfWeek.trim() !== ''
      );
    }
    return false;
  };

  const isFormValid = () => {
    return (
      formData.scheduleName &&
      formData.scheduleOutputFileName &&
      formData.scheduleRule &&
      formData.scheduleType &&
      formData.scheduleOptions.length > 0 &&
      isScheduleRuleValid()
    );
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{scriptData.scriptName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="schedulename">
            <Form.Label>Schedule Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter a name for schedule."
              value={formData.scheduleName}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduleName: e.target.value }))}
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="outputfilename">
            <Form.Label>Schedule Output FileName</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter a name for schedule output file name."
              value={formData.scheduleOutputFileName}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduleOutputFileName: e.target.value }))}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="scheduleOptions">
            <Form.Label>Schedule Options</Form.Label>
            <Form.Check
              type="checkbox"
              label="Send me output over mail"
              checked={formData.scheduleOptions.includes('sendOverMail')}
              onChange={() => handleCheckboxChange('sendOverMail')}
            />
            <Form.Check
              type="checkbox"
              label="Save output on system"
              checked={formData.scheduleOptions.includes('saveToSystem')}
              onChange={() => handleCheckboxChange('saveToSystem')}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>On a fixed Date-Time</Form.Label>
            <Form.Control
              type="datetime-local"
              placeholder="Select date and time"
              value={formData.scheduleRule}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, scheduleRule: e.target.value, scheduleType: 'fixed' }));
              }}
              disabled={formData.scheduleType === 'recurring'}
            />
          </Form.Group>
          <Modal.Title>OR</Modal.Title>
          <Form.Group className="mb-3" controlId="exampleForm.ControlSelect1">
            <Form.Label>A recurring schedule</Form.Label>
            <Form.Control
              type="text"
              placeholder="Second (0 - 59), use * for every Second"
              value={cronFields.second}
              onChange={(e) => {
                handleFieldChange('second', e.target.value);
                setFormData(prev => ({ ...prev, scheduleType: 'recurring' }));
              }}
              disabled={formData.scheduleType === 'fixed'}
            />
            <Form.Control
              type="text"
              placeholder="Minute (0 - 59), use * for every Minute"
              value={cronFields.minute}
              onChange={(e) => handleFieldChange('minute', e.target.value)}
              disabled={formData.scheduleType === 'fixed'}
            />
            <Form.Control
              type="text"
              placeholder="Hour (0 - 23), use * for every Hour"
              value={cronFields.hour}
              onChange={(e) => handleFieldChange('hour', e.target.value)}
              disabled={formData.scheduleType === 'fixed'}
            />
            <Form.Control
              type="text"
              placeholder="Day of Week (0 - 7, Sun 0 or 7), use * for every Day of Week"
              value={cronFields.dayOfWeek}
              onChange={(e) => handleFieldChange('dayOfWeek', e.target.value)}
              disabled={formData.scheduleType === 'fixed'}
            />
            <Form.Control
              type="text"
              placeholder="Day of Month (1 - 31), use * for every Day of Month"
              value={cronFields.dayOfMonth}
              onChange={(e) => handleFieldChange('dayOfMonth', e.target.value)}
              disabled={formData.scheduleType === 'fixed'}
            />
            <Form.Control
              type="text"
              placeholder="Month (1 - 12), use * for every Month"
              value={cronFields.month}
              onChange={(e) => handleFieldChange('month', e.target.value)}
              disabled={formData.scheduleType === 'fixed'}
            />
          </Form.Group>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleAdd} disabled={!isFormValid()}>
              Add/Edit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ScheduleScriptModal;
