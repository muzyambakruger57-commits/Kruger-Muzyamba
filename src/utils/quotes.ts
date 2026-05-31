import { Quote } from "../types";

export const MINDFUL_QUOTES: Quote[] = [
  { text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
  { text: "Quiet the mind and the soul will speak.", author: "Ma Jaya Sati Bhagavati" },
  { text: "Breathe in deeply to bring your mind home to your body.", author: "Thich Nhat Hanh" },
  { text: "Doing nothing is better than being busy doing nothing.", author: "Lao Tzu" },
  { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
  { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" },
  { text: "Mindfulness isn't difficult, we just need to remember to do it.", author: "Sharon Salzberg" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" },
  { text: "The soul always knows what to do to heal itself. The challenge is to silence the mind.", author: "Caroline Myss" },
  { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
  { text: "Slow down and everything you are chasing will come around and catch you.", author: "John De Paola" },
  { text: "In the midst of movement and chaos, keep stillness inside of you.", author: "Deepak Chopra" },
  { text: "To understand everything is to forgive everything.", author: "Gautama Buddha" },
  { text: "The feeling that any task is a nuisance will soon disappear if you perform it with complete attention.", author: "Eckhart Tolle" },
  { text: "Adopt the pace of nature: her secret is patience.", author: "Ralph Waldo Emerson" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "Be here now.", author: "Ram Dass" },
  { text: "The little things? The little moments? They aren't little.", author: "Jon Kabat-Zinn" },
  { text: "Patience has all the time in the world.", author: "Wavy Gravy" },
  { text: "Look at trees, look at flowers, look at water. Let them teach you how to be.", author: "Eckhart Tolle" },
  { text: "Let go of the battle. Breathe in, and let it be.", author: "Unknown" },
  { text: "Water flowing, wind whispering; hear the silence behind the sounds.", author: "Zen Saying" },
  { text: "Your calm mind is the ultimate weapon against your challenges. So relax.", author: "Bryant McGill" },
  { text: "Surrender to what is. Let go of what was. Have faith in what will be.", author: "Sonia Ricotti" },
  { text: "He who is contented is rich.", author: "Lao Tzu" },
  { text: "Nothing is permanent in this wicked world, not even our troubles.", author: "Charlie Chaplin" },
  { text: "Letting go gives us freedom, and freedom is the only condition for happiness.", author: "Thich Nhat Hanh" },
  { text: "Each step we take, we make beautiful wildflowers bloom under our feet.", author: "Buddha" },
  { text: "In this moment, let go of all burdens and allow your breath to bring you peace.", author: "Mind Haven Reflection" },
  { text: "A stone is balanced not by force, but by listening to its weight.", author: "Haven Guide" }
];

export function getRandomQuote(): Quote {
  const idx = Math.floor(Math.random() * MINDFUL_QUOTES.length);
  return MINDFUL_QUOTES[idx];
}
