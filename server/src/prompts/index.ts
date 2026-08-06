import systemPrompt from './systemPrompt';
import bookingPrompt from './bookingPrompt';
import pricingPrompt from './pricingPrompt';
import faqPrompt from './faqPrompt';
import hairstylePrompt from './hairstylePrompt';
import toolCallingPrompt from './toolCallingPrompt';
import safetyPrompt from './safetyPrompt';
import conversationPrompt from './conversationPrompt';

export const getCombinedSystemPrompt = (): string => {
  return [
    systemPrompt,
    bookingPrompt,
    pricingPrompt,
    faqPrompt,
    hairstylePrompt,
    toolCallingPrompt,
    safetyPrompt,
    conversationPrompt,
  ].join('\n\n');
};

export {
  systemPrompt,
  bookingPrompt,
  pricingPrompt,
  faqPrompt,
  hairstylePrompt,
  toolCallingPrompt,
  safetyPrompt,
  conversationPrompt,
};
