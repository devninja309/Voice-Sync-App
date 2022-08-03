//I should not be in code.  Put this in the database?  Put it in a flat file?  What's easiest for the IA team to edit?
//Maybe this needs to be a database + edit page in the UI?
export const Avatars = [
    { value: 1, label: 'Test 1'},
    { value: 2, label: 'Test 2'},
    { value: 3, label: 'Alana B.' },
    { value: 4, label: 'Ramona J.' },
    { value: 5, label: 'Ramona J. (Promo)'},
    { value: 7, label: 'Wade C.' },
    { value: 8, label: 'Sofia H.' },
    { value: 9, label: 'David D.' },
    { value: 10, label: 'Vanessa N.' },
    { value: 11, label: 'Isabel V.' },
    { value: 12, label: 'Ava M.' },
    { value: 13, label: 'Jeremy G.' },
    { value: 14, label: 'Nicole L.' },
    { value: 15, label: 'Paige L.' },
    { value: 16, label: 'Tobin A.' },
    { value: 17, label: 'Kai M.' },
    { value: 18, label: 'Tristan F.' },
    { value: 19, label: 'Patrick K.' },
    { value: 20, label: 'Sofia H. (Promo)'},
    { value: 21, label: 'Damian P. (Promo)'},
    { value: 22, label: 'Jodi P. (Promo)'},
    { value: 23, label: 'Lee M. (Promo)'},
    { value: 24, label: 'Selene R. (Promo)'},
    { value: 26, label: 'Wade C. (Promo)'},
    { value: 27, label: 'Joe F. (Narration)'},
    { value: 28, label: 'Joe F. (Promo)'},
    { value: 29, label: 'Garry J. (Character)'},
    { value: 33, label: 'Jude D. (Narration)'},
    { value: 34, label: 'Eric S. (Promo)'},
    { value: 35, label: 'Chase J. (Narration)'},
    { value: 37, label: 'Steve B. (Promo)'},
    { value: 38, label: 'Bella B. (Promo)'},
    { value: 39, label: 'Tilda C. (Promo)'},
    { value: 41, label: 'Paul B. (Promo)'},
    { value: 42, label: 'Sofia H. (Conversational)'},
    { value: 43, label: 'Ava M. (Conversational)'},
    { value: 44, label: 'Kai M. (Conversational)'},
    { value: 45, label: 'Nicole L. (Conversational)'},
    { value: 46, label: 'Wade C. (Conversational)'},
    { value: 47, label: 'Patrick K. (Conversational)'},
    { value: 48, label: 'Vanessa N. (Conversational)'},
    { value: 49, label: 'Gia V. (Narration)'},
    { value: 50, label: 'Antony A. (Narration)'},
    { value: 51, label: 'Jodi P. (Narration)'},
    { value: 52, label: 'Raine B. (Narration)'},
    { value: 53, label: 'Owen C. (Narration)'},
    { value: 54, label: 'Zach E. (Promo)'},
    { value: 55, label: 'Genevieve M. (Narration)'},
    { value: 56, label: 'Jarvis H. (Narration)'},
    { value: 57, label: 'Theo K. (Narration)'},
    { value: 58, label: 'James B. (Narration)'},
    { value: 61137774, label: 'C Black'}
  ];


export function GetVoiceName(clip) {
  const voiceID = Number(clip.VoiceID)
  const result =  Avatars.find(cs => cs.value === voiceID)
  return result;
}