import React, {useContext, useState, createContext} from 'react';


const AudioRetainerContext = createContext()

const useAudioRetainerContext = () => useContext(AudioRetainerContext)


const useContextValue = () => {
    const [token, setToken] = useState(null)

    return {
        token,
        setToken
    }
    
}
export const AudioRetainerProvider = ({ children }) => {
    const ctx = useContextValue()

    return (
        <AudioRetainerContext.Provider value={ctx}>
            {children}
        </AudioRetainerContext.Provider>
    )
}
export const useAudioRetainerTools = () => {
    const { clipAudios, setClipAudios } = useAudioRetainerContext()

    return { token, setToken, fetchWithAuth, APICalls}
}