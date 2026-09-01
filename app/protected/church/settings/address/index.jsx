'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Form, Button } from 'react-bootstrap';
import FindAddress from '../../../../share/findAddress';
import { validate } from '../../../../../validator/validator';
import { useAddress } from '../../../../../hooks/useAddress';

const AddressForm = ({ address }) => {
    const [errorMessages, setErrorMessages] = useState({});
    const {
        handleChange,
        handleEdit,
        handleSelectedAddress,
        handleSave,
        handleSelect,
        handleStatusReset,
        fields,
        rules,
        loading,
        error,
        success
    } = useAddress()

    useEffect(() => {
        address && handleSelect(address)
    }, [address, handleSelect])

    const handleSubmit = async () => {
        setErrorMessages({});
        const validationResult = validate(fields, rules);

        if (validationResult.hasError) {
            setErrorMessages(validationResult.errors);
            return;
        }

        const { addressLine1, town, county, status, country, postcode, location, completeAddress } = fields;

        const body = {
            addressLine1,
            town,
            county,
            status,
            country,
            postcode,
            location,
            completeAddress
        };

        if (fields?._id) {
            await handleEdit(body);
        } else {
            await handleSave(body);
        }
    };
    return (
        <Form>
             <div className="row col-md-6">
                <div className="col-md-12 mt-2">
                    <FindAddress addressStatus={fields?.completeAddress ? false : true} handleSelectedAddress={handleSelectedAddress} />
                </div>
                {fields?.completeAddress && <span className='text-dark fs-15 p-4'>{fields.completeAddress}</span>}
            </div>

            {fields?.completeAddress && (
                <div className="row col-md-6 ">
                    <div className="row">
                        <div className="col-md-12">
                            <Form.Group controlId="formAddressLine1" className="mb-3">
                                <Form.Label className="text-dark">AddressLine1</Form.Label>
                                <Form.Control
                                    type="addressLine1"
                                    placeholder="Enter addressLine1"
                                    name="addressLine1"
                                    value={fields?.addressLine1}
                                    onChange={(e) => handleChange('addressLine1', e.target.value)}
                                    className="border-dark"
                                />
                                {errorMessages?.addressLine1?.message && (
                                    <span className="text-danger fs-13">{errorMessages?.addressLine1?.message}</span>
                                )}
                            </Form.Group>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <Form.Group controlId="formTown" className="mb-3">
                                <Form.Label className="text-dark">Town</Form.Label>
                                <Form.Control
                                    type="town"
                                    placeholder="Enter town"
                                    name="town"
                                    value={fields?.town}
                                    onChange={(e) => handleChange('town', e.target.value)}
                                    className="border-dark"
                                />
                                {errorMessages?.town?.message && (
                                    <span className="text-danger fs-13">{errorMessages?.town?.message}</span>
                                )}
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group controlId="formCounty" className="mb-3">
                                <Form.Label className="text-dark">County</Form.Label>
                                <Form.Control
                                    type="county"
                                    placeholder="Enter county"
                                    name="county"
                                    value={fields?.county}
                                    onChange={(e) => handleChange('county', e.target.value)}
                                    className="border-dark"
                                />
                                {errorMessages?.county?.message && (
                                    <span className="text-danger fs-13">{errorMessages?.county?.message}</span>
                                )}
                            </Form.Group>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <Form.Group controlId="formPostcode" className="mb-3">
                                <Form.Label className="text-dark">Post code</Form.Label>
                                <Form.Control
                                    type="postcode"
                                    placeholder="Enter postcode"
                                    name="postcode"
                                    value={fields?.postcode}
                                    onChange={(e) => handleChange('postcode', e.target.value)}
                                    className="border-dark"
                                />
                                {errorMessages?.postcode?.message && (
                                    <span className="text-danger fs-13">{errorMessages?.postcode?.message}</span>
                                )}
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group controlId="formCountry" className="mb-3">
                                <Form.Label className="text-dark">Country</Form.Label>
                                <Form.Control
                                    type="country"
                                    placeholder="Enter country"
                                    name="country"
                                    value={fields?.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                    className="border-dark"
                                />
                                {errorMessages?.country?.message && (
                                    <span className="text-danger fs-13">{errorMessages?.country?.message}</span>
                                )}
                            </Form.Group>
                        </div>
                    </div>
                </div>
            )}

            {
                (fields?.completeAddress || address) && (
                    <div className="d-flex justify-content-start">
                        <Button type="button" variant="primary" disabled={loading} onClick={() => handleSubmit()}>
                            {loading ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </div>
                )
            }
            {success && (
                <Alert variant="success" dismissible className="mt-3 mb-0" onClose={handleStatusReset}>
                    Address saved successfully.
                </Alert>
            )}
            {error && (
                <Alert variant="danger" dismissible className="mt-3 mb-0" onClose={handleStatusReset}>
                    {typeof error === 'string' ? error : 'Unable to save the address.'}
                </Alert>
            )}
        </Form>
    );
};

export default AddressForm;
