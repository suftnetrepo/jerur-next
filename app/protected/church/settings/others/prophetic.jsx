import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { OkDialogue } from '@/src/components/elements/ConfirmDialogue';
import ErrorDialogue from '@/src/components/elements/errorDialogue';
import { validate } from '@/validator/validator';
import { useProphetic } from '@/hooks/useSettings';

const Prophetic = ({ data }) => {
    const { error, success, fields, rules, handleChange, handleUpdate, handleReset, handleSelect } = useProphetic();
    const [errorMessages, setErrorMessages] = useState({});

    useEffect(() => {
        data && handleSelect(data);
    }, [data]);

    const resetFields = () => { };

    const handleSubmit = async () => {

        console.log(".......................1", fields)

        setErrorMessages({});
        const validationResult = validate(fields, rules);

         console.log(".......................validationResult.hasError", validationResult.errors)

        if (validationResult.hasError) {
            setErrorMessages(validationResult.errors);
            return;
        }

              console.log(".......................2", fields)

        handleUpdate(fields).then((result) => {
            result && resetFields();
        });
    };

    return (
        <div style={{ marginLeft: 25, width: '40%', backgroundColor: 'white' }}>
            <Form>
                <div className="row">
                    <div className="col-md-6">
                        <Form.Group controlId="formMonth" className="mb-3">
                            <Form.Label className="text-dark">Month</Form.Label>
                            <Form.Select
                                name="month"
                                value={fields.month}
                                className="border-dark"
                                onChange={(e) => handleChange('month', e.target.value)}
                            >
                                <option value="">Select a month</option>
                                <option value="January">January</option>
                                <option value="February">February</option>
                                <option value="March">March</option>
                                <option value="April">April</option>
                                <option value="May">May</option>
                                <option value="June">June</option>
                                <option value="July">July</option>
                                <option value="August">August</option>
                                <option value="September">September</option>
                                <option value="October">October</option>
                                <option value="November">November</option>
                                <option value="December">December</option>
                            </Form.Select>
                            {errorMessages.month?.message && <span className="text-danger">{errorMessages.month?.message}</span>}
                        </Form.Group>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Form.Group controlId="formReference" className="mb-3">
                            <Form.Label className="text-dark">Reference</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter verse"
                                name="verse"
                                value={fields?.verse}
                                onChange={(e) => handleChange('verse', e.target.value)}
                                className="border-dark"
                                maxLength={50}
                            />
                            {errorMessages.verse?.message && <span className="text-danger">{errorMessages.verse?.message}</span>}
                        </Form.Group>
                    </div>
                    <div className="col-md-6"></div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <Form.Group className="mb-3">
                            <Form.Label className="text-dark">Description</Form.Label>
                            <Form.Control
                                maxLength={500}
                                as="textarea"
                                rows={3}
                                value={fields?.description}
                                className="border-dark"
                                onChange={(e) => handleChange('description', e.target.value)}
                            />
                        </Form.Group>
                    </div>
                </div>

                <div className="d-flex justify-content-start">
                    <Button type="button" variant="primary" onClick={() => handleSubmit()}>
                        Save Changes
                    </Button>
                </div>
            </Form>
            {success && (
                <OkDialogue
                    show={success}
                    message="Your changes was save successfully"
                    onConfirm={() => {
                        handleReset();
                    }}
                />
            )}
            {error && <ErrorDialogue showError={error} onClose={() => { }} />}
        </div>
    );
};

export default Prophetic;
