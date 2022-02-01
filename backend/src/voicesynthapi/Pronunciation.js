

export function ConvertPronunciationFast(Translations, clipText) {
    const wb = '\\b'; //word boundary 
    const dict = Object.assign({}, ...Translations.map ((t) => ({[t.Word.toLowerCase()]: t.Pronunciation})))
    var re = new RegExp(Object.keys(dict).map(k=>wb+k+wb).join("|"),"gi");  
    return clipText.toLowerCase().replace(re, function(matched){
            return dict[matched];
        });
    
}