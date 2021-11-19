//Functions for handling error messages

const exportMethods = {
    DEBUG: "console everything"
}

const exportMethod = exportMethods.DEBUG

export function LogError(error) {
    LogErrorMessage(error.message);
    console.log(error);
}
export function LogErrorMessage(errorMessage) {
    LogErrorMessageToConsole(errorMessage);
}
function LogErrorMessageToConsole(errorMessage){
    switch (exportMethod) {
        case exportMethods.DEBUG:
            console.log(errorMessage);
            break;
        default:
            console.log('Invalid export Method');

    }
}

export function LogTraceMessage(message)
{
    switch (exportMethod) {
        case exportMethods.DEBUG:
            console.log(message);
            break;
        default:
            console.log('Invalid export Method');
    }
}