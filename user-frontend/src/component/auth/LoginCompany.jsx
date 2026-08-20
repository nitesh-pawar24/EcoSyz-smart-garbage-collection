"use client";

import React from 'react';
import BaseLogin from './BaseLogin';
import { useAppNavigate } from '../../utils/navigation';

const LoginCompany = ({ navigate: propNavigate }) => {
    const appNavigate = useAppNavigate();
    const navigate = propNavigate || appNavigate;
    return <BaseLogin navigate={navigate} type="Company" />;
};

export default LoginCompany;

