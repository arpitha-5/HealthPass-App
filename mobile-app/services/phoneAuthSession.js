let currentPhoneAuthSession = null;

export const setPhoneAuthSession = (session) => {
  currentPhoneAuthSession = session;
};

export const getPhoneAuthSession = () => currentPhoneAuthSession;

export const clearPhoneAuthSession = () => {
  currentPhoneAuthSession = null;
};