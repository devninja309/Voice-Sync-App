import React, {useContext, useState, createContext} from 'react';
import merge from 'deepmerge';

import {UseAPICallsWithAuth} from './APICalls'

const AuthContext = createContext()
const useAuthContext = () => useContext(AuthContext)

const useContextValue = () => {
    const [token, setToken] = useState(null)

    return {
        token,
        setToken
    }
}

export const AuthProvider = ({ children }) => {
    const ctx = useContextValue()

    return (
        <AuthContext.Provider value={ctx}>
            {children}
        </AuthContext.Provider>
    )
}
const authInit = (token) => {return {
    headers: {
        'Authorization': `Bearer ${token}`,
    }}};

export const useAuthTools = () => {
    const { token, setToken } = useAuthContext()

    //TODO I should probably be defined outside this function
    const fetchWithAuth = (resource, init) => {    
        console.log(resource);
        return fetch(resource,merge(authInit(token),init??{}));
    }

    const APICalls = UseAPICallsWithAuth(fetchWithAuth)
    return { token, setToken, fetchWithAuth, APICalls}
}
