import React, {useContext, useState, createContext} from 'react';
import merge from 'deepmerge';
import { useAuth0 } from "@auth0/auth0-react";

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

export function IsAdmin() {
    const { user } = useAuth0();
    if (user) {
        //Would rather this be the permissions, but that's enough harder to get at it's not worth the time.
        return user[`https://industryacademy.com//roles`].some(val => val == `Admin`);  
    }
    return false;
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
        if (token === null) return Promise.resolve({json:()=>{return''}});
        return fetch(resource,merge(authInit(token),init??{})).then(response => {
            if (!response.ok) {
                alert('There was a problem with the server');
                var change = 0;
            }
            return response;
        });
    }

    const APICalls = UseAPICallsWithAuth(fetchWithAuth)
    return { token, setToken, fetchWithAuth, APICalls}
}
