interface UserData {
  name: string;
}

interface GreetingData {
  user: UserData;
  currentTime: string;
}

/**
 * Generates a personalized greeting based on the user's name and the current time in IST.
 * 
 * @param data - The input data object containing the user and currentTime (ISO string in IST).
 * @returns The formatted greeting message.
 */
export const generateGreeting = ({ user, currentTime }: GreetingData): string => {
  // Extract the username and capitalize the first letter
  let username = user?.name || "";
  if (username) {
    username = username.charAt(0).toUpperCase() + username.slice(1);
  }

  // Since the input timestamp is strictly in IST, we extract the hour directly
  // from the ISO string to avoid local timezone conversions.
  // Example: "2026-04-18T19:10:00+05:30"
  const timePart = currentTime.split('T')[1];
  const hourStr = timePart.split(':')[0];
  const hour = parseInt(hourStr, 10);

  let greeting = "Good Night"; // Default to night

  // 05:00 AM – 11:59 AM
  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
  } 
  // 12:00 PM – 04:59 PM
  else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } 
  // 05:00 PM – 09:59 PM
  else if (hour >= 17 && hour < 22) {
    greeting = "Good Evening";
  } 
  // 10:00 PM – 04:59 AM (handled by default "Good Night")

  return `${greeting}, ${username} 👋`;
};
