
//Color is just for reference.  Actual value is in the CSS
export const ClipStatus = [
    { value: 1, label: 'Unapproved', color: "#FFFFF"},
    { value: 2, label: 'Approved', color: "#e6ffe6"},
    { value: 3, label: 'NeedsReview', colod: "#ffe6e6"}]

export function GetClipStatus(clip) {
    console.log("ClipStatusID: ",clip.ClipStatusID)
    return ClipStatus.find(cs => cs.value == clip.ClipStatusID)
}