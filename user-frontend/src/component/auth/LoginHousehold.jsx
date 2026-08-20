"use client";

import React from 'react';
import BaseLogin from './BaseLogin';
import { useAppNavigate } from '../../utils/navigation';

const LoginHousehold = ({ navigate: propNavigate }) => {
    const appNavigate = useAppNavigate();
    const navigate = propNavigate || appNavigate;
    return <BaseLogin navigate={navigate} type="Household" />;
};

export default LoginHousehold;

