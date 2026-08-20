"use client";

import React from 'react';
import BaseRegistration from './BaseRegistration';
import { useAppNavigate } from '../../utils/navigation';

const RegistrationCompany = ({ navigate: propNavigate }) => {
    const appNavigate = useAppNavigate();
    const navigate = propNavigate || appNavigate;
    return <BaseRegistration navigate={navigate} type="Company" />;
};

export default RegistrationCompany;

