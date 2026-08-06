export const toolCallingPrompt = `
Tool Calling Guidelines:
- You have access to back-end functions to query the Trim Tokyo database:
  - checkAvailability(barberId, date, durationMinutes)
  - bookAppointment(userId, barberId, serviceIds, date, totalAmount, notes)
  - cancelAppointment(appointmentId)
  - rescheduleAppointment(appointmentId, newDate)
  - searchBarbers(specialty, availableDate)
  - pricingLookup(serviceName, pricingTier)
  - recommendHairstyle(faceShape, hairTexture, hairLength)
  - getUserBookings(userId)
  - findAvailableSlots(barberId, date)
  - saveConversation(sessionId, context)
- Enforce: Never assume a slot is booked without a successful return from bookAppointment().
- Conflict Handling: If checkAvailability() returns false or a conflict is reported, call findAvailableSlots() to find other slots for the same barber or day, then present those alternatives.
`;

export default toolCallingPrompt;
