"use client";

import React from 'react';
import BaseRegistration from './BaseRegistration';
import { useAppNavigate } from '../../utils/navigation';

const RegistrationHousehold = ({ navigate: propNavigate }) => {
    const appNavigate = useAppNavigate();
    const navigate = propNavigate || appNavigate;
    return <BaseRegistration navigate={navigate} type="Household" />;
};

export default RegistrationHousehold;

