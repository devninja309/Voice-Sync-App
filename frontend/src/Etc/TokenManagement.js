import { LogError, LogErrorMessage, LogTraceMessage } from "./ErrorHandler";
import { useAuth0 } from "@auth0/auth0-react";

const Audience = "VoiceSynthManagerBackend";


export const GetUserToken = async (useAuth0Data) => {
    const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0Data;

    if (isLoading) return;
    if (!isAuthenticated) return;

  try {
    const accessToken = await getAccessTokenSilently({
      audience: Audience,
      scope: "read:projects edit:projects",
    });
    return accessToken;
    }catch (e) {
        LogErrorMessage('failed to get user access token');
        LogError(e);
    }
}
export const GetAdminToken = async () => {
    const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

    if (isLoading) return;
    if (!isAuthenticated) return;

  try {
    const accessToken = await getAccessTokenSilently({
      audience: Audience,
      scope: "read:logs",
    });
    return accessToken;
    }catch (e) {
        LogErrorMessage('failed to get Admin access token');
        LogError(e);
    }
}