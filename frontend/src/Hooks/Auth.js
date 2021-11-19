import React, {useContext, useState, createContext} from 'react';

const AuthContext = createContext()
const useAuthContext = () => useContext(AuthContext)

const useContextValue = () => {
    const [token, setToken] = useState(null)

    // let myToken = () => {
    //     console.log('myToken token:', token)
    //     return token;
    // }
    // let mySetToken = (val) => {
    //     console.log('mySetToken val:', val)
    //     setToken(val)
    // }

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

export const useAuthTools = () => {
    const { token, setToken } = useAuthContext()
    console.log('useAuthTools token: ',token)

    const fetchWithAuth = (path, headers) => {
        console.log('fetchWithAuth token: ', token)      
        return fetch(path,{
            headers: {
            'Authorization': `Bearer ${token}`,
            ...headers}})
    }
    return { token, setToken, fetchWithAuth}
}
